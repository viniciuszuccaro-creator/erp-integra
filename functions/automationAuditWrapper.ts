import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * AUTOMATION AUDIT WRAPPER - AUDITORIA DE AUTOMAÇÕES
 * Wrapper para auditar execução de automações agendadas e de entidades
 * Chamado automaticamente por todas as automações do sistema
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { 
      automationName,
      automationType,
      functionName,
      payload,
      result,
      error,
      executionTime
    } = await req.json();

    await base44.asServiceRole.entities.AuditLog.create({
      usuario: 'Sistema',
      usuario_id: null,
      empresa_id: payload?.empresa_id || null,
      acao: error ? 'Erro' : 'Execução',
      modulo: 'Automação',
      entidade: automationType === 'entity' ? payload?.event?.entity_name : 'Scheduled',
      registro_id: payload?.event?.entity_id || null,
      descricao: `Automação "${automationName}" ${error ? 'falhou' : 'executada'}`,
      dados_anteriores: payload,
      dados_novos: { result, error, executionTime },
      data_hora: new Date().toISOString(),
      sucesso: !error
    });

    return Response.json({ success: true });

  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
});