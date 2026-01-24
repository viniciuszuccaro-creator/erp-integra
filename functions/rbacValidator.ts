import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * RBAC VALIDATOR - BACKEND ENFORCEMENT
 * Validação centralizada de permissões no backend
 * Impede ações não autorizadas mesmo que UI seja burlada
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { module, section, action, entityName, recordId } = await req.json();

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ 
        authorized: false, 
        reason: 'Não autenticado' 
      }, { status: 401 });
    }

    // Admin bypassa tudo
    if (user.role === 'admin') {
      return Response.json({ authorized: true, reason: 'Admin' });
    }

    // Buscar perfil de acesso
    if (!user.perfil_acesso_id) {
      return Response.json({ 
        authorized: false, 
        reason: 'Usuário sem perfil de acesso' 
      }, { status: 403 });
    }

    const perfil = await base44.asServiceRole.entities.PerfilAcesso.get(user.perfil_acesso_id);
    if (!perfil || !perfil.ativo) {
      return Response.json({ 
        authorized: false, 
        reason: 'Perfil inválido ou inativo' 
      }, { status: 403 });
    }

    const perms = perfil.permissoes || {};
    
    // Normalizar ação
    const normalizedAction = action === 'ver' ? 'visualizar' : action;

    // Navegar hierarquia de permissões
    const modNode = perms[module];
    if (!modNode) {
      return Response.json({ 
        authorized: false, 
        reason: `Módulo ${module} não acessível` 
      }, { status: 403 });
    }

    // Se não há seção, verificar qualquer subnível
    if (!section) {
      const hasPermission = Object.values(modNode).some((node) => {
        if (Array.isArray(node)) {
          return node.includes(normalizedAction) || 
                 (normalizedAction === 'visualizar' && node.includes('ver'));
        }
        if (node && typeof node === 'object') {
          return Object.values(node).some((v) => 
            Array.isArray(v) && 
            (v.includes(normalizedAction) || (normalizedAction === 'visualizar' && v.includes('ver')))
          );
        }
        return false;
      });

      if (!hasPermission) {
        return Response.json({ 
          authorized: false, 
          reason: `Ação ${normalizedAction} não permitida no módulo ${module}` 
        }, { status: 403 });
      }

      return Response.json({ authorized: true });
    }

    // Com seção: navegar path
    const path = Array.isArray(section) ? section : String(section).split('.').filter(Boolean);
    let cursor = modNode;
    for (const key of path) {
      if (!cursor) {
        return Response.json({ 
          authorized: false, 
          reason: `Seção ${section} não encontrada` 
        }, { status: 403 });
      }
      cursor = cursor[key];
    }

    if (!cursor) {
      return Response.json({ 
        authorized: false, 
        reason: `Permissão não definida para ${module}.${section}` 
      }, { status: 403 });
    }

    // Verificar permissão final
    if (Array.isArray(cursor)) {
      const hasPermission = cursor.includes(normalizedAction) || 
                           (normalizedAction === 'visualizar' && cursor.includes('ver'));
      
      if (!hasPermission) {
        return Response.json({ 
          authorized: false, 
          reason: `Ação ${normalizedAction} não permitida` 
        }, { status: 403 });
      }

      return Response.json({ authorized: true });
    }

    // Cursor é objeto: verificar recursivamente
    const stack = [cursor];
    while (stack.length) {
      const node = stack.pop();
      if (Array.isArray(node)) {
        if (node.includes(normalizedAction) || 
            (normalizedAction === 'visualizar' && node.includes('ver'))) {
          return Response.json({ authorized: true });
        }
      } else if (node && typeof node === 'object') {
        Object.values(node).forEach((v) => stack.push(v));
      }
    }

    return Response.json({ 
      authorized: false, 
      reason: `Permissão ${normalizedAction} não encontrada` 
    }, { status: 403 });

  } catch (error) {
    return Response.json({ 
      authorized: false, 
      reason: error.message 
    }, { status: 500 });
  }
});