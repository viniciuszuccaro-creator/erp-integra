import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * AUDIT IA - Registra interações e decisões de IA
 * ETAPA 1: Rastreabilidade de ações orientadas por IA
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const {
      iaModel,
      entityName,
      action,
      entityId,
      suggestion,
      confidence,
      applied = false,
      result = {}
    } = await req.json();

    const user = await base44.auth.me();

    // Registrar interação de IA
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: `IA - ${iaModel}`,
      usuario_id: user?.id || 'SISTEMA',
      empresa_id: result?.empresa_id || null,
      acao: applied ? 'IA Ação Aplicada' : 'IA Sugestão Gerada',
      modulo: 'IA',
      entidade: entityName,
      registro_id: entityId,
      descricao: `${iaModel} sugeriu ${action} com confiança ${confidence}%${applied ? ' (aplicado)' : ''}`,
      dados_novos: {
        suggestion,
        confidence,
        applied,
        model: iaModel
      },
      data_hora: new Date().toISOString(),
      sucesso: true
    });

    return Response.json({ success: true });

  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});