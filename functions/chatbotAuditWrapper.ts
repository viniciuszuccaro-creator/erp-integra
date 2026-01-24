import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * CHATBOT AUDIT WRAPPER - AUDITORIA DE CHATBOT
 * Registra todas as interações e transações do chatbot
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { 
      conversaId,
      mensagem,
      tipo,
      intent,
      entidadeAfetada,
      registroId,
      acaoExecutada,
      resultado,
      erro,
      canal,
      clienteId,
      empresaId
    } = await req.json();

    // Registro em ChatbotInteracao (específico)
    await base44.asServiceRole.entities.ChatbotInteracao.create({
      conversa_id: conversaId,
      canal: canal || 'Sistema',
      cliente_id: clienteId || null,
      empresa_id: empresaId || null,
      intent_detectado: intent || 'generico',
      mensagem_usuario: mensagem?.substring(0, 500),
      resposta_bot: resultado?.substring(0, 500),
      acao_executada: acaoExecutada || null,
      entidade_afetada: entidadeAfetada || null,
      registro_afetado_id: registroId || null,
      sucesso: !erro,
      erro_mensagem: erro || null,
      data_interacao: new Date().toISOString()
    });

    // Registro em AuditLog (universal)
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: `Chatbot (${canal || 'Sistema'})`,
      usuario_id: clienteId || null,
      empresa_id: empresaId || null,
      acao: acaoExecutada || 'Conversa',
      modulo: 'Chatbot',
      entidade: entidadeAfetada || 'Mensagem',
      registro_id: registroId || null,
      descricao: `Chatbot: ${intent || 'interação'} - ${acaoExecutada || 'conversa'}`,
      dados_novos: { intent, canal, resultado: resultado?.substring(0, 200), erro },
      data_hora: new Date().toISOString(),
      sucesso: !erro
    });

    return Response.json({ success: true });

  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
});