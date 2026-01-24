import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * ENTITY OPERATION GUARD - GUARDIÃO DE OPERAÇÕES
 * Middleware universal para validar RBAC + Multiempresa antes de qualquer operação
 * Chamado antes de create/update/delete em entidades sensíveis
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { 
      operation, 
      entityName, 
      data, 
      recordId,
      module,
      action 
    } = await req.json();

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ 
        allowed: false, 
        reason: 'Não autenticado' 
      }, { status: 401 });
    }

    // 1. VALIDAÇÃO RBAC
    if (user.role !== 'admin') {
      const rbacCheck = await base44.functions.invoke('rbacValidator', {
        module: module || 'Sistema',
        section: null,
        action: action || operation
      });

      if (!rbacCheck.data?.authorized) {
        await base44.asServiceRole.entities.AuditLog.create({
          usuario: user.full_name || user.email,
          usuario_id: user.id,
          acao: 'Bloqueio',
          modulo: module || 'Sistema',
          entidade: entityName,
          registro_id: recordId,
          descricao: `RBAC bloqueou ${operation} em ${entityName}: ${rbacCheck.data?.reason}`,
          dados_novos: { operation, data },
          data_hora: new Date().toISOString(),
          sucesso: false
        });

        return Response.json({ 
          allowed: false, 
          reason: rbacCheck.data?.reason || 'Sem permissão' 
        }, { status: 403 });
      }
    }

    // 2. VALIDAÇÃO MULTIEMPRESA
    const multiempresaCheck = await base44.functions.invoke('multiempresaValidator', {
      operation,
      entityName,
      data,
      filter: data,
      recordId
    });

    if (!multiempresaCheck.data?.valid) {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user.full_name || user.email,
        usuario_id: user.id,
        acao: 'Bloqueio',
        modulo: 'Sistema',
        entidade: entityName,
        registro_id: recordId,
        descricao: `Multiempresa bloqueou ${operation} em ${entityName}: ${multiempresaCheck.data?.reason}`,
        dados_novos: { operation, data },
        data_hora: new Date().toISOString(),
        sucesso: false
      });

      return Response.json({ 
        allowed: false, 
        reason: multiempresaCheck.data?.reason || 'Contexto multiempresa inválido' 
      }, { status: 403 });
    }

    // 3. AUDITORIA DA OPERAÇÃO AUTORIZADA
    await base44.functions.invoke('auditHelper', {
      usuario: user.full_name || user.email,
      usuario_id: user.id,
      empresa_id: data?.empresa_id || null,
      acao: operation,
      modulo: module || 'Sistema',
      entidade: entityName,
      registro_id: recordId,
      descricao: `${operation} autorizado em ${entityName}`,
      dados_novos: data,
      origem: 'EntityOperationGuard'
    });

    return Response.json({ 
      allowed: true,
      message: 'Operação autorizada'
    });

  } catch (error) {
    return Response.json({ 
      allowed: false, 
      reason: error.message 
    }, { status: 500 });
  }
});