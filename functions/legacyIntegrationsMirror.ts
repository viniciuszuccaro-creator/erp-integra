import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const evt = payload?.event || {};
    const data = payload?.data || null;

    // Webhooks Marketplaces
    if (payload?.provider && (payload.provider === 'mercado_livre' || payload.provider === 'amazon')) {
      const empresa_id = payload.empresa_id || payload.company_id || null;
      const group_id = payload.group_id || null;
      try { await base44.asServiceRole.entities.AuditLog.create({ usuario: 'Webhook', acao: 'Criação', modulo: 'Integrações', tipo_auditoria: 'integracao', entidade: payload.provider, descricao: `Webhook recebido: ${payload.event || 'evento'}`, empresa_id, group_id, dados_novos: payload, data_hora: new Date().toISOString(), sucesso: true }); } catch {}
      if (Array.isArray(payload?.ajustes_estoque) && empresa_id) {
        try { await base44.asServiceRole.functions.invoke('applyInventoryAdjustments', { empresa_id, ajustes: payload.ajustes_estoque }); } catch (_) {}
      }
      return Response.json({ ok: true, action: 'webhook_processed' });
    }

    if (!evt?.entity_name) {
      return Response.json({ ok: true, skipped: true });
    }

    // Alerta de Estoque Baixo via WhatsApp (Produto atualizado)
    if (evt.entity_name === 'Produto' && evt.type === 'update' && data) {
      const empresaId = data.empresa_id || null;
      const groupId = data.group_id || null;
      const disp = Number(data.estoque_disponivel || data.estoque_atual || 0);
      const minimo = Number(data.estoque_minimo || 0);
      if (empresaId && minimo > 0 && disp <= minimo) {
        const internal_token = Deno.env.get('DEPLOY_AUDIT_TOKEN') || '';
        const vars = { produto: data.descricao || data.codigo || data.id, disponivel: disp, minimo };
        try { await base44.asServiceRole.functions.invoke('whatsappSend', { action: 'sendText', empresaId, groupId, templateKey: 'estoque_baixo', vars, internal_token }); } catch (_) {}
        try { await base44.asServiceRole.entities.AuditLog.create({ usuario: 'Webhook', acao: 'Criação', modulo: 'Estoque', tipo_auditoria: 'integracao', entidade: 'WhatsApp', descricao: 'Alerta de estoque baixo enviado', empresa_id: empresaId, group_id: groupId, dados_novos: { produto_id: data.id, descricao: data.descricao, disponivel: disp, minimo }, data_hora: new Date().toISOString(), sucesso: true }); } catch {}
      }
    }

    const map = {
      'ConfiguracaoNFe': 'integracao_nfe',
      'ConfiguracaoBoletos': 'integracao_boletos',
      'ConfiguracaoWhatsApp': 'integracao_whatsapp'
    };

    const keyName = map[evt.entity_name];
    if (!keyName) return Response.json({ ok: true, skipped: true });

    if (evt.type === 'delete') {
      // Preserve; we don't remove from ConfiguracaoSistema automatically
      return Response.json({ ok: true, action: 'ignored_delete' });
    }

    if (!data) return Response.json({ ok: false, error: 'No data' }, { status: 400 });

    const empresaId = data.empresa_id || null;
    const groupId = data.group_id || null;

    const chave = empresaId ? `integracoes_${empresaId}` : (groupId ? `integracoes_group_${groupId}` : null);
    if (!chave) return Response.json({ ok: false, error: 'Sem empresa_id ou group_id' }, { status: 400 });

    const existentes = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({ chave }, undefined, 1);

    const payloadCfg = { chave, categoria: 'Integracoes', [keyName]: data };

    if (existentes && existentes.length > 0) {
      await base44.asServiceRole.entities.ConfiguracaoSistema.update(existentes[0].id, payloadCfg);
      return Response.json({ ok: true, action: 'update', keyName });
    } else {
      await base44.asServiceRole.entities.ConfiguracaoSistema.create(payloadCfg);
      return Response.json({ ok: true, action: 'create', keyName });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});