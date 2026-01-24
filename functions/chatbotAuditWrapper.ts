import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * CHATBOT AUDIT WRAPPER - Auditoria de Conversas de Chatbot
 * Registra todas as interações do chatbot
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { conversaId, mensagem, resposta } = await req.json();

    const user = await base44.auth.me();

    // Registrar auditoria da conversa
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: user?.full_name || 'Sistema',
      usuario_id: user?.id || 'auto',
      acao: 'Interação',
      modulo: 'Chatbot',
      entidade: 'Conversa',
      descricao: `Conversa chatbot ${conversaId || 'anônima'} processada`,
      dados_novos: { 
        conversaId,
        temMensagem: !!mensagem,
        temResposta: !!resposta
      },
      data_hora: new Date().toISOString(),
      sucesso: true
    });

    return Response.json({ 
      valid: true,
      message: 'Conversa auditada com sucesso'
    });

  } catch (error) {
    return Response.json({ 
      valid: false, 
      reason: error.message 
    }, { status: 500 });
  }
});