import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json().catch(() => ({}));
    const { empresaId, destinatario, destinatario_nome, assunto, mensagem, tipo_conteudo = 'html', anexos = [], action = 'send' } = payload || {};

    // Busca configuração de Email
    const cfgs = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({ categoria: 'Email', chave: `email_${empresaId}` });
    const emailCfg = cfgs?.[0]?.configuracoes_email || null;

    if (action === 'status') {
      return Response.json({ configurado: !!emailCfg, provedor: emailCfg?.provedor || 'Core' });
    }

    // Se não configurado, usa integração segura do Core
    if (!emailCfg || emailCfg.ativo === false) {
      await base44.asServiceRole.integrations.Core.SendEmail({ to: destinatario, subject: assunto, body: mensagem });
      return Response.json({ sucesso: true, modo: 'core', status: 'enviado' });
    }

    const provedor = emailCfg.provedor;

    if (provedor === 'SendGrid') {
      const payloadSG = {
        personalizations: [{ to: [{ email: destinatario, name: destinatario_nome }], subject: assunto }],
        from: { email: emailCfg.email_remetente || 'noreply@zuccaro.com.br', name: emailCfg.nome_remetente || 'ERP Zuccaro' },
        content: [{ type: tipo_conteudo === 'html' ? 'text/html' : 'text/plain', value: mensagem }],
      };
      if (anexos?.length) {
        payloadSG.attachments = anexos.map(a => ({ content: a.conteudo_base64, filename: a.nome_arquivo, type: a.tipo_mime, disposition: 'attachment' }));
      }
      const r = await fetch('https://api.sendgrid.com/v3/mail/send', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${emailCfg.api_key}` }, body: JSON.stringify(payloadSG) });
      if (!r.ok) return Response.json({ error: await r.text() }, { status: 502 });
      return Response.json({ sucesso: true, modo: 'real', status: 'enviado' });
    }

    // Fallback padrão (ou provedores não implementados): usa Core
    await base44.asServiceRole.integrations.Core.SendEmail({ to: destinatario, subject: assunto, body: mensagem });
    return Response.json({ sucesso: true, modo: 'core', status: 'enviado' });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});