import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * NOTIFICADOR APROVADOR - Envia notificações para aprovadores
 * ETAPA 2: Sistema de alertas para fluxos de aprovação
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const {
      usuario_aprovador_id,
      usuario_aprovador_email,
      tipo_documento,
      numero_documento,
      valor,
      descricao,
      acao_necessaria
    } = await req.json();

    const user = await base44.auth.me();

    // Preparar mensagem
    const assunto = `[APROVAÇÃO] ${tipo_documento} ${numero_documento}`;
    const corpo = `
Olá,

Uma nova aprovação está pendente:

📋 Documento: ${tipo_documento} ${numero_documento}
💰 Valor: R$ ${valor?.toFixed(2) || 'N/A'}
📝 Descrição: ${descricao}
⚡ Ação: ${acao_necessaria}

Por favor, acesse o sistema para revisar.

Atenciosamente,
Sistema ERP
    `;

    // Enviar email via integração
    const emailResult = await base44.integrations.Core.SendEmail({
      to: usuario_aprovador_email,
      subject: assunto,
      body: corpo
    });

    // Registrar notificação em log
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: user?.full_name || 'Sistema',
      usuario_id: user?.id || 'SISTEMA',
      acao: 'Notificação',
      modulo: 'Sistema',
      entidade: 'Notificacao',
      registro_id: usuario_aprovador_id,
      descricao: `Notificação enviada a ${usuario_aprovador_email} para aprovar ${tipo_documento} ${numero_documento}`,
      dados_novos: { tipo: tipo_documento, numero: numero_documento },
      data_hora: new Date().toISOString(),
      sucesso: true
    });

    return Response.json({
      success: true,
      notificacao: 'Enviada para ' + usuario_aprovador_email
    });

  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});