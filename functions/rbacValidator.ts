import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * RBAC VALIDATOR - VALIDAÇÃO DE PERMISSÕES NO BACKEND
 * Endpoint central para validar permissões antes de executar ações
 * ETAPA 1: Enforcement completo de RBAC
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { module, section, action, userId } = await req.json();

    // Autenticar usuário
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ 
        valid: false, 
        reason: 'Usuário não autenticado' 
      }, { status: 401 });
    }

    // Admin sempre tem permissão
    if (user.role === 'admin') {
      return Response.json({ valid: true, reason: 'Administrador' });
    }

    // Buscar perfil de acesso do usuário
    if (!user.perfil_acesso_id) {
      // Auditar tentativa sem perfil
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user.full_name || user.email,
        usuario_id: user.id,
        acao: 'Bloqueio',
        modulo: 'Sistema',
        entidade: 'RBACValidator',
        descricao: `Bloqueio: usuário sem perfil tentou ${action} em ${module}`,
        data_hora: new Date().toISOString(),
        sucesso: false
      });

      return Response.json({ 
        valid: false, 
        reason: 'Usuário sem perfil de acesso definido' 
      }, { status: 403 });
    }

    const perfil = await base44.asServiceRole.entities.PerfilAcesso.get(user.perfil_acesso_id);

    if (!perfil || !perfil.ativo) {
      return Response.json({ 
        valid: false, 
        reason: 'Perfil de acesso inativo' 
      }, { status: 403 });
    }

    // Validar permissão hierárquica
    const perms = perfil.permissoes || {};
    const modNode = perms[module];
    
    if (!modNode) {
      // Auditar bloqueio
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user.full_name || user.email,
        usuario_id: user.id,
        acao: 'Bloqueio',
        modulo: module,
        entidade: 'RBACValidator',
        descricao: `Bloqueio RBAC: ${action} em ${module}${section ? `.${section}` : ''}`,
        data_hora: new Date().toISOString(),
        sucesso: false
      });

      return Response.json({ 
        valid: false, 
        reason: `Sem acesso ao módulo ${module}` 
      }, { status: 403 });
    }

    // Normalizar ação (ver = visualizar)
    const normalizedAction = action === 'ver' ? 'visualizar' : action;

    // Se não há seção, verificar se algum filho tem a ação
    if (!section) {
      const hasPermission = Object.values(modNode).some((node) => {
        if (Array.isArray(node)) return node.includes(normalizedAction);
        if (node && typeof node === 'object') {
          return Object.values(node).some((v) => Array.isArray(v) && v.includes(normalizedAction));
        }
        return false;
      });

      if (!hasPermission) {
        await base44.asServiceRole.entities.AuditLog.create({
          usuario: user.full_name || user.email,
          usuario_id: user.id,
          acao: 'Bloqueio',
          modulo: module,
          entidade: 'RBACValidator',
          descricao: `Bloqueio RBAC: ${action} em ${module}`,
          data_hora: new Date().toISOString(),
          sucesso: false
        });

        return Response.json({ valid: false, reason: 'Permissão negada' }, { status: 403 });
      }

      return Response.json({ valid: true });
    }

    // Navegar hierarquia de seções
    const path = Array.isArray(section) ? section : String(section).split('.').filter(Boolean);
    let cursor = modNode;
    
    for (const key of path) {
      if (!cursor) {
        await base44.asServiceRole.entities.AuditLog.create({
          usuario: user.full_name || user.email,
          usuario_id: user.id,
          acao: 'Bloqueio',
          modulo: module,
          entidade: 'RBACValidator',
          descricao: `Bloqueio RBAC: ${action} em ${module}.${section}`,
          data_hora: new Date().toISOString(),
          sucesso: false
        });

        return Response.json({ valid: false, reason: 'Permissão negada' }, { status: 403 });
      }
      cursor = cursor[key];
    }

    // Verificar ação no nó final
    const hasPermission = Array.isArray(cursor) && cursor.includes(normalizedAction);

    if (!hasPermission) {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user.full_name || user.email,
        usuario_id: user.id,
        acao: 'Bloqueio',
        modulo: module,
        entidade: 'RBACValidator',
        descricao: `Bloqueio RBAC: ${action} em ${module}.${section}`,
        data_hora: new Date().toISOString(),
        sucesso: false
      });

      return Response.json({ valid: false, reason: 'Permissão negada' }, { status: 403 });
    }

    return Response.json({ valid: true });

  } catch (error) {
    return Response.json({ 
      valid: false, 
      reason: error.message 
    }, { status: 500 });
  }
});