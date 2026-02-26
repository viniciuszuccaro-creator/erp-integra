import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission, assertContextPresence, audit } from './_lib/guard.js';
import { notify } from './_lib/notificationService.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const { action = 'sendText', numero, mensagem, empresaId, groupId, clienteId, pedidoId, templateKey, intent, vars = {}, arquivoUrl, legenda, internal_token } = payload || {};

    // Auth: user session OR trusted internal token
    const user = await base44.auth.me().catch(() => null);
    const trustedInternal = internal_token && Deno.env.get('DEPLOY_AUDIT_TOKEN') && internal_token === Deno.env.get('DEPLOY_AUDIT_TOKEN');
    if (!user && !trustedInternal) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ctxPresenceErr = assertContextPresence({ empresa_id: empresaId, group_id: groupId || null }, true);
    if (ctxPresenceErr) return ctxPresenceErr;

    const ctx = await getUserAndPerfil(base44);
    if (user) {
      const permDenied = await assertPermission(base44, ctx, 'Integrações', 'WhatsApp', action === 'status' ? 'visualizar' : 'criar');
      if (permDenied) return permDenied;
    }
    const currentUser = user || { id: 'service', full_name: 'ServiceRole' };

    // Busca configuração (multiempresa): preferência por integracoes_{empresaId} ou integracoes_group_{groupId}; fallback whatsapp_{empresaId}
    let cfgDoc = null;
    if (empresaId) {
      const a = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({ categoria: 'Integracoes', chave: `integracoes_${empresaId}` }, undefined, 1);
      cfgDoc = a?.[0] || null;
    }
    if (!cfgDoc && groupId) {
      const b = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({ categoria: 'Integracoes', chave: `integracoes_group_${groupId}` }, undefined, 1);
      cfgDoc = b?.[0] || null;
    }
    if (!cfgDoc && empresaId) {
      const c = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({ categoria: 'Integracoes', chave: `whatsapp_${empresaId}` }, undefined, 1);
      cfgDoc = c?.[0] || null;
    }
    const config = cfgDoc?.integracao_whatsapp || cfgDoc?.whatsapp || null;

    if (!config || config.ativo === false) {
      if (action === 'status') {
        return Response.json({ conectado: false, modo: 'simulado', mensagem: 'WhatsApp não configurado' });
      }
      // Auditoria do envio simulado
      try { await base44.asServiceRole.entities.AuditLog.create({
        usuario: currentUser?.full_name || 'Service', usuario_id: currentUser?.id || null, acao: 'Criação', modulo: 'Integrações', tipo_auditoria: 'integracao', entidade: 'WhatsApp', descricao: 'Envio simulado (sem configuração)', empresa_id: empresaId || null, group_id: groupId || null, dados_novos: { numero, templateKey, vars }, data_hora: new Date().toISOString(), sucesso: true
      }); } catch {}
      return Response.json({ sucesso: true, modo: 'simulado', messageId: `SIM_${Date.now()}`, status: 'sent' });
    }

    // Admin-only: configuração de templates (RBAC sistema.configuracao.whatsapp.editar)
    if (action === 'setTemplate') {
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const permCfg = await assertPermission(base44, ctx, 'Sistema', 'Configurações', 'editar');
      if (permCfg) return permCfg;

      if (!templateKey || !mensagem) {
        return Response.json({ error: 'Parâmetros inválidos' }, { status: 400 });
      }

      let targetDoc = cfgDoc;
      if (!targetDoc) {
        const chave = empresaId ? `integracoes_${empresaId}` : (groupId ? `integracoes_group_${groupId}` : null);
        const novo = { chave, categoria: 'Integracoes', integracao_whatsapp: { ativo: true, templates: { [templateKey]: mensagem } } };
        targetDoc = await base44.asServiceRole.entities.ConfiguracaoSistema.create(novo);
      } else {
        const iw = targetDoc.integracao_whatsapp || {};
        const templates = { ...(iw.templates || {}), [templateKey]: mensagem };
        await base44.asServiceRole.entities.ConfiguracaoSistema.update(targetDoc.id, { integracao_whatsapp: { ...iw, templates } });
      }

      try { await base44.asServiceRole.entities.AuditLog.create({
        usuario: currentUser?.full_name || 'Service', usuario_id: currentUser?.id || null, acao: 'Edição', modulo: 'Sistema', tipo_auditoria: 'sistema', entidade: 'WhatsApp', descricao: `Template atualizado: ${templateKey}`, empresa_id: empresaId || null, group_id: groupId || null, dados_novos: { templateKey }, data_hora: new Date().toISOString(), sucesso: true
      }); } catch {}

      return Response.json({ sucesso: true, updated: true });
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

    // Resolver número e mensagem por template/variáveis
    let destinatario = numero;
    if (!destinatario) {
      if (pedidoId) {
        const ped = await base44.asServiceRole.entities.Pedido.filter({ id: pedidoId }, undefined, 1).then(r=>r?.[0]).catch(()=>null);
        const fromContatos = Array.isArray(ped?.contatos_cliente) ? ped.contatos_cliente.find(c => /whatsapp|celular|telefone/i.test(c?.tipo || '') && c?.valor) : null;
        destinatario = fromContatos?.valor || null;
        if (!destinatario && ped?.cliente_id) {
          const cli = await base44.asServiceRole.entities.Cliente.filter({ id: ped.cliente_id }, undefined, 1).then(r=>r?.[0]).catch(()=>null);
          const contato = Array.isArray(cli?.contatos) ? cli.contatos.find(c => /whatsapp|celular|telefone/i.test(c?.tipo || '') && c?.valor) : null;
          destinatario = contato?.valor || null;
        }
      } else if (clienteId) {
        const cli = await base44.asServiceRole.entities.Cliente.filter({ id: clienteId }, undefined, 1).then(r=>r?.[0]).catch(()=>null);
        const contato = Array.isArray(cli?.contatos) ? cli.contatos.find(c => /whatsapp|celular|telefone/i.test(c?.tipo || '') && c?.valor) : null;
        destinatario = contato?.valor || null;
      }
    }
    if (!destinatario && (config?.alertas?.numero_admin || config?.numero_admin)) {
      destinatario = config.alertas?.numero_admin || config.numero_admin;
    }
    destinatario = String(destinatario || '').replace(/\D/g, '');

    const templates = config?.templates || {};

    // Suporte a intents do Chatbot (migrateChatbotIntents): resolve template por intent
    let resolvedTemplateKey = templateKey;
    if (!resolvedTemplateKey && intent) {
      try {
        const ci = await base44.asServiceRole.entities.ChatbotIntent.filter({ nome: intent }, undefined, 1);
        const intentCfg = ci?.[0] || null;
        if (intentCfg?.template_whatsapp) resolvedTemplateKey = intentCfg.template_whatsapp;
      } catch (_) {}
    }

    const tpl = resolvedTemplateKey ? templates?.[resolvedTemplateKey] : null;
    // Chatbot proactive intents (migrateChatbotIntents): se intent informado e sem template definido, tenta buscar mensagem padrão
    if (!tpl && intent && !mensagem) {
      try {
        const intents = await base44.asServiceRole.entities.ChatbotIntent.filter({ nome: intent }, undefined, 1);
        if (intents?.[0]?.mensagem_padrao) {
          mensagem = intents[0].mensagem_padrao;
        }
      } catch (_) {}
    }
    const interpolate = (tplStr, v) => tplStr?.replace(/\{\{(.*?)\}\}/g, (_, k) => (v?.[k.trim()] ?? '')) || '';
    let texto = mensagem;
    if (!texto && tpl) {
      texto = interpolate(tpl, { ...vars, empresa: config?.nome_exibicao || '', pedidoId, data: new Date().toLocaleString('pt-BR') });
    }
    // Fallback seguro quando n e3o houver template configurado
    if (!texto) {
      const v = vars || {};
      const defaults = {
          pedido_em_transito: `Olá ${v.cliente || ''}! Seu pedido ${v.pedido || pedidoId || ''} está em trânsito. Previsão: ${v.data_prevista || ''}. ${v.rastreio ? 'Rastreamento: ' + v.rastreio : ''}`.trim(),
          pedido_criado: `Olá ${v.cliente || ''}! Recebemos seu pedido ${v.pedido || pedidoId || ''} no valor de R$ ${v.valor_total ?? ''}. Em breve enviaremos atualizações.`.trim(),
          estoque_baixo: `Alerta: estoque baixo para ${v.produto || ''}. Disponível: ${v.disponivel ?? ''}, mínimo: ${v.minimo ?? ''}`.trim(),
          otp: `Seu código de verificação é: ${v.codigo || ''}. Válido por 5 minutos.`.trim(),
        };
      texto = (templateKey && defaults[templateKey]) || mensagem || `Mensagem do sistema: ${v.motivo || 'notifica e7 e3o autom e1tica'}`;
    }

    if (action === 'sendMedia') {
      const body = { number: destinatario, mediaUrl: arquivoUrl, caption: legenda || '' };
      const r = await fetch(`${apiUrl}/message/sendMedia/${instanceName}`, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: apiKey }, body: JSON.stringify(body) });
      if (!r.ok) return Response.json({ error: await r.text() }, { status: 502 });
      const res = await r.json();
      await audit(base44, currentUser, { acao: 'Criação', modulo: 'Integrações', entidade: 'WhatsApp', descricao: `Midia enviada`, dados_novos: { numero: body.number, action } });
      return Response.json({ sucesso: true, messageId: res.key?.id, status: 'sent', modo: 'real' });
    }

    // default sendText
    const body = { number: destinatario, text: texto };
    const r = await fetch(`${apiUrl}/message/sendText/${instanceName}`, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: apiKey }, body: JSON.stringify(body) });
    if (!r.ok) return Response.json({ error: await r.text() }, { status: 502 });
    const res = await r.json();

    // Logs e auditoria detalhada
    await notify(base44, {
      titulo: 'WhatsApp Enviado',
      mensagem: `Para ${body.number}`,
      tipo: 'info',
      categoria: 'Sistema',
      prioridade: 'Baixa',
      empresa_id: empresaId || null
    });
    try { await base44.asServiceRole.entities.AuditLog.create({
      usuario: currentUser?.full_name || 'Service', usuario_id: currentUser?.id || null,
      acao: 'Criação', modulo: 'Integrações', tipo_auditoria: 'integracao', entidade: 'WhatsApp',
      descricao: 'Texto enviado', empresa_id: empresaId || null, group_id: groupId || null,
      dados_novos: { numero: body.number, mensagem: body.text, templateKey, vars }, data_hora: new Date().toISOString(), sucesso: true
    }); } catch {}

    return Response.json({ sucesso: true, messageId: res.key?.id, status: 'sent', modo: 'real' });
  } catch (err) {
    try {
      const payload = await req.json().catch(() => ({}));
      const empresaId = payload?.empresaId || null;
      const groupId = payload?.groupId || null;
      await (async () => {
        try { await (createClientFromRequest(req)).asServiceRole.entities.AuditLog.create({
          usuario: 'Service', acao: 'Erro', modulo: 'Integrações', tipo_auditoria: 'integracao', entidade: 'WhatsApp', descricao: String(err?.message || err), empresa_id: empresaId, group_id: groupId, data_hora: new Date().toISOString(), sucesso: false
        }); } catch {}
      })();
    } catch {}
    return Response.json({ error: err.message }, { status: 500 });
  }
});