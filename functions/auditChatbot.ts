import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * AUDIT CHATBOT - Registra transações e ações via chatbot
 * ETAPA 1: Rastreabilidade completa de atendimento omnicanal
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const {
      channel,
      intent,
      entityName,
      action,
      entityId,
      clientEmail,
      transcript = '',
      result = {}
    } = await req.json();

    const user = await base44.auth.me();

    // Registrar transação de chatbot
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: `Chatbot - ${channel}`,
      usuario_id: user?.id || 'SISTEMA',
      empresa_id: result?.empresa_id || null,
      acao: `Chatbot ${action}`,
      modulo: 'Chatbot',
      entidade: entityName,
      registro_id: entityId,
      descricao: `Cliente ${clientEmail} realizou '${intent}' via ${channel}`,
      dados_novos: {
        channel,
        intent,
        clientEmail,
        transcript: transcript.substring(0, 500) // Limitar tamanho
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