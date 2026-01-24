import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * ENTITY OPERATION GUARD - MIDDLEWARE UNIVERSAL DE VALIDAÇÃO
 * Combina RBAC + Multiempresa + Auditoria em um único endpoint
 * ETAPA 1: Enforcement total antes de qualquer operação de entidade
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { 
      operation,
      entityName, 
      data, 
      entityId,
      module,
      section,
      action 
    } = await req.json();

    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ 
        valid: false, 
        reason: 'Não autenticado' 
      }, { status: 401 });
    }

    const results = {
      rbac: { valid: false, reason: '' },
      multiempresa: { valid: false, reason: '' }
    };

    // 1. Validar RBAC
    try {
      const rbacResponse = await base44.functions.invoke('rbacValidator', {
        module: module || entityName,
        section,
        action: action || operation,
        userId: user.id
      });

      results.rbac = rbacResponse.data;
    } catch (error) {
      results.rbac = { valid: false, reason: error.message };
    }

    // 2. Validar Multiempresa
    try {
      const multiempresaResponse = await base44.functions.invoke('multiempresaValidator', {
        operation,
        entityName,
        data,
        entityId,
        userId: user.id
      });

      results.multiempresa = multiempresaResponse.data;
    } catch (error) {
      results.multiempresa = { valid: false, reason: error.message };
    }

    // 3. Decidir resultado final
    const valid = results.rbac.valid && results.multiempresa.valid;

    // 4. Auditar validação
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: user.full_name || user.email,
      usuario_id: user.id,
      empresa_id: data?.empresa_id || null,
      acao: valid ? 'Validação' : 'Bloqueio',
      modulo: module || entityName,
      entidade: entityName,
      registro_id: entityId || null,
      descricao: valid 
        ? `Validação aprovada: ${operation} ${entityName}`
        : `Bloqueio: ${results.rbac.valid ? results.multiempresa.reason : results.rbac.reason}`,
      dados_novos: { operation, results },
      data_hora: new Date().toISOString(),
      sucesso: valid
    });

    if (!valid) {
      return Response.json({ 
        valid: false,
        reason: results.rbac.valid ? results.multiempresa.reason : results.rbac.reason,
        details: results
      }, { status: 403 });
    }

    return Response.json({ valid: true, results });

  } catch (error) {
    return Response.json({ 
      valid: false, 
      reason: error.message 
    }, { status: 500 });
  }
});