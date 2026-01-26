import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission, assertContextPresence, audit } from './_lib/guard.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json().catch(() => ({}));
    const { action = 'sendText', numero, mensagem, empresaId, arquivoUrl, legenda } = payload || {};

    const ctxPresenceErr = assertContextPresence({ empresa_id: empresaId, group_id: null }, true);
    if (ctxPresenceErr) return ctxPresenceErr;

    const ctx = await getUserAndPerfil(base44);
    const permDenied = await assertPermission(base44, ctx, 'Integrações', 'WhatsApp', action === 'status' ? 'visualizar' : 'criar');
    if (permDenied) return permDenied;
    const currentUser = ctx.user;

    // Busca configuração como service role (não expõe segredos no frontend)
    const cfgs = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({ categoria: 'Integracoes', chave: `whatsapp_${empresaId}` });
    const config = cfgs?.[0]?.integracao_whatsapp || null;

    if (!config || config.ativo === false) {
      if (action === 'status') {
        return Response.json({ conectado: false, modo: 'simulado', mensagem: 'WhatsApp não configurado' });
      }
      return Response.json({ sucesso: true, modo: 'simulado', messageId: `SIM_${Date.now()}`, status: 'sent' });
    }

    const apiKey = config.api_key;
    const apiUrl = config.api_url || 'https://evolution-api.com';
    const instanceName = config.instance_name;

    if (action === 'status') {
      const r = await fetch(`${apiUrl}/instance/connectionState/${instanceName}`, { headers: { apikey: apiKey } });
      if (!r.ok) return Response.json({ conectado: false, erro: 'Falha ao consultar status' }, { status: 502 });
      const j = await r.json();
      return Response.json({ conectado: j.state === 'open', estado: j.state, qrcode: j.qrcode || null });
    }

    if (action === 'sendMedia') {
      const body = { number: String(numero || '').replace(/\D/g, ''), mediaUrl: arquivoUrl, caption: legenda || '' };
      const r = await fetch(`${apiUrl}/message/sendMedia/${instanceName}`, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: apiKey }, body: JSON.stringify(body) });
      if (!r.ok) return Response.json({ error: await r.text() }, { status: 502 });
      const res = await r.json();
      await audit(base44, currentUser, { acao: 'Criação', modulo: 'Integrações', entidade: 'WhatsApp', descricao: `Midia enviada`, dados_novos: { numero: body.number, action } });
      return Response.json({ sucesso: true, messageId: res.key?.id, status: 'sent', modo: 'real' });
    }

    // default sendText
    const body = { number: String(numero || '').replace(/\D/g, ''), text: mensagem };
    const r = await fetch(`${apiUrl}/message/sendText/${instanceName}`, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: apiKey }, body: JSON.stringify(body) });
    if (!r.ok) return Response.json({ error: await r.text() }, { status: 502 });
    const res = await r.json();

    // log simples
    await base44.asServiceRole.entities.Notificacao.create({ titulo: '📱 WhatsApp Enviado', mensagem: `Para ${body.number}`, tipo: 'info', categoria: 'Sistema', prioridade: 'Baixa' });
    await audit(base44, currentUser, { acao: 'Criação', modulo: 'Integrações', entidade: 'WhatsApp', descricao: `Texto enviado`, dados_novos: { numero: body.number, action } });

    return Response.json({ sucesso: true, messageId: res.key?.id, status: 'sent', modo: 'real' });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});