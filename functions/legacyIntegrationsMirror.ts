import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const evt = payload?.event || {};
    const data = payload?.data || null;

    // API-First genérica (app/portal/site): actions internas com RBAC/token e escopo multiempresa
    if (payload?.action && !payload?.provider) {
      const action = String(payload.action || '').toLowerCase();
      const empresa_id = payload.empresa_id || payload.company_id || null;
      const group_id = payload.group_id || null;
      const internal_token = payload.internal_token || null;
      const trustedInternal = internal_token && Deno.env.get('DEPLOY_AUDIT_TOKEN') && internal_token === Deno.env.get('DEPLOY_AUDIT_TOKEN');

      let user = null; try { user = await base44.auth.me(); } catch { user = null; }
      if (!trustedInternal && !user) { return Response.json({ error: 'Unauthorized' }, { status: 401 }); }
      if (!empresa_id && !group_id) { return Response.json({ error: 'escopo_multiempresa_obrigatorio' }, { status: 400 }); }

      // RBAC quando houver usuário (actions sensíveis exigem executar)
      if (user) {
        try {
          const guard = await base44.asServiceRole.functions.invoke('entityGuard', {
            module: 'Integrações', section: 'API', action: 'executar', empresa_id, group_id
          });
          if (!guard?.data?.allowed) return Response.json({ error: 'Forbidden' }, { status: 403 });
        } catch { return Response.json({ error: 'Forbidden' }, { status: 403 }); }
      }

      if (action === 'status_pedido') {
        const pedido_id = payload.pedido_id || null;
        const numero_pedido = payload.numero_pedido || null;
        let q = { empresa_id }; if (numero_pedido) q.numero_pedido = numero_pedido; if (pedido_id) q.id = pedido_id;
        const ped = await base44.asServiceRole.entities.Pedido.filter(q, undefined, 1).then(r => r?.[0] || null);
        if (!ped) return Response.json({ ok: false, error: 'pedido_nao_encontrado' }, { status: 404 });
        const resumo = { id: ped.id, numero_pedido: ped.numero_pedido, status: ped.status, data_prevista_entrega: ped.data_prevista_entrega, cliente: ped.cliente_nome };
        try { await base44.asServiceRole.entities.AuditLog.create({ usuario: user?.full_name || 'Service', acao: 'Visualização', modulo: 'Comercial', tipo_auditoria: 'integracao', entidade: 'status_pedido', descricao: 'Consulta status pedido (API)', empresa_id, group_id, dados_novos: { pedido_id: resumo.id }, data_hora: new Date().toISOString() }); } catch {}
        return Response.json({ ok: true, pedido: resumo });
      }

      if (action === 'cotar_aco') {
        const filtro = { empresa_id };
        const prods = await base44.asServiceRole.entities.Produto.filter(filtro, '-updated_date', 50).then(arr => (arr || []).filter(p => p.eh_bitola === true));
        const itens = prods.map(p => ({ id: p.id, descricao: p.descricao, tipo_aco: p.tipo_aco, bitola_mm: p.bitola_diametro_mm, preco_venda: p.preco_venda, estoque_disponivel: (p.estoque_disponivel ?? (p.estoque_atual - (p.estoque_reservado || 0))) }));
        try { await base44.asServiceRole.entities.AuditLog.create({ usuario: user?.full_name || 'Service', acao: 'Visualização', modulo: 'Comercial', tipo_auditoria: 'integracao', entidade: 'cotar_aco', descricao: 'Cotação via API', empresa_id, group_id, dados_novos: { itens: itens.slice(0, 5) }, data_hora: new Date().toISOString() }); } catch {}
        return Response.json({ ok: true, itens });
      }

      return Response.json({ ok: false, error: 'action_nao_suportada' }, { status: 400 });
    }

    // Webhooks Pagamentos e Fiscal (Asaas, Juno, eNotas, NFe.io)
  if (payload?.provider && ['asaas','juno','enotas','nfe_io'].includes(String(payload.provider).toLowerCase())) {
    const prov = String(payload.provider).toLowerCase();
    const hdrToken = req.headers.get('x-internal-token') || req.headers.get('x-webhook-token') || null;
    const expected = Deno.env.get('DEPLOY_AUDIT_TOKEN') || null;
    const trusted = !!(expected && hdrToken === expected);
    const empresa_id = payload.empresa_id || payload.company_id || null;
    const group_id = payload.group_id || null;
    try { await base44.asServiceRole.entities.AuditLog.create({ usuario: 'Webhook', acao: 'Criação', modulo: 'Integrações', tipo_auditoria: 'integracao', entidade: prov, descricao: `Webhook recebido`, empresa_id, group_id, dados_novos: { payload, trusted }, data_hora: new Date().toISOString(), sucesso: true }); } catch {}

    if (prov === 'asaas') {
      const p = payload?.payment || payload?.data || payload || {};
      const extId = p?.id || payload?.id || null;
      if (extId) {
        const crList = await base44.asServiceRole.entities.ContaReceber.filter({ id_cobranca_externa: extId }, undefined, 1);
        const cr = crList?.[0] || null;
        if (cr) {
          const statusRaw = (p?.status || payload?.event || '').toString().toUpperCase();
          const pago = /RECEIVED|CONFIRMED|RECEIVED_IN_CASH|PAID/.test(statusRaw);
          const updates = {
            status_cobranca: statusRaw.toLowerCase(),
            data_retorno_pagamento: new Date().toISOString()
          };
          if (pago) {
            updates.status = 'Recebido';
            updates.valor_recebido = Number(cr.valor_recebido||0) + Number(p?.value || p?.netValue || cr.valor || 0);
            const d = (p?.confirmedDate || p?.paymentDate || '').toString().slice(0,10) || new Date().toISOString().slice(0,10);
            updates.data_recebimento = d;
            updates.detalhes_pagamento = { ...(cr.detalhes_pagamento||{}), forma_pagamento: 'Boleto/PIX', numero_autorizacao: p?.transactionReceipt || null, status_compensacao: 'Conciliado' };
          }
          await base44.asServiceRole.entities.ContaReceber.update(cr.id, updates);
          try { await base44.asServiceRole.entities.AuditLog.create({ usuario: 'Webhook', acao: 'Edição', modulo: 'Financeiro', tipo_auditoria: 'integracao', entidade: 'Asaas', descricao: `Atualização cobrança ${extId}`, empresa_id, group_id, dados_novos: updates, data_hora: new Date().toISOString(), sucesso: true }); } catch {}
        }
      }
      return Response.json({ ok: true, action: 'asaas_webhook_processed' });
    }

    if (prov === 'juno') {
      const ch = payload?.data?.charge || payload?.charge || payload || {};
      const extId = ch?.id || payload?.id || null;
      if (extId) {
        const crList = await base44.asServiceRole.entities.ContaReceber.filter({ id_cobranca_externa: extId }, undefined, 1);
        const cr = crList?.[0] || null;
        if (cr) {
          const statusRaw = (ch?.status || payload?.event || '').toString().toUpperCase();
          const pago = /PAID|CONFIRMED|COMPLETED/.test(statusRaw);
          const updates = {
            status_cobranca: statusRaw.toLowerCase(),
            data_retorno_pagamento: new Date().toISOString()
          };
          if (pago) {
            updates.status = 'Recebido';
            updates.valor_recebido = Number(cr.valor_recebido||0) + Number(ch?.amount || cr.valor || 0);
            const d = (ch?.date || '').toString().slice(0,10) || new Date().toISOString().slice(0,10);
            updates.data_recebimento = d;
            updates.detalhes_pagamento = { ...(cr.detalhes_pagamento||{}), forma_pagamento: 'Boleto', status_compensacao: 'Conciliado' };
          }
          await base44.asServiceRole.entities.ContaReceber.update(cr.id, updates);
          try { await base44.asServiceRole.entities.AuditLog.create({ usuario: 'Webhook', acao: 'Edição', modulo: 'Financeiro', tipo_auditoria: 'integracao', entidade: 'Juno', descricao: `Atualização cobrança ${extId}`, empresa_id, group_id, dados_novos: updates, data_hora: new Date().toISOString(), sucesso: true }); } catch {}
        }
      }
      return Response.json({ ok: true, action: 'juno_webhook_processed' });
    }

    if (prov === 'enotas' || prov === 'nfe_io') {
      const nfId = payload?.nfeId || payload?.id || payload?.nota_id || null;
      const status = (payload?.status || payload?.evento || '').toString();
      if (nfId) {
        const map = { autorizada: 'Autorizada', autorizadauso: 'Autorizada', cancelada: 'Cancelada', denegada: 'Denegada', rejeitada: 'Rejeitada' };
        const statusKey = status.toLowerCase().replace(/\s/g,'');
        const nfStatus = map[statusKey] || status;
        await base44.asServiceRole.entities.NotaFiscal.update(nfId, { status: nfStatus, mensagem_sefaz: payload?.mensagem || null, codigo_status_sefaz: String(payload?.codigo || payload?.statusCode || ''), xml_nfe: payload?.xmlUrl || payload?.xml || null, pdf_danfe: payload?.pdfUrl || payload?.danfeUrl || null, chave_acesso: payload?.chave || payload?.chaveAcesso || null });
        if (/autorizad/i.test(nfStatus)) {
          try { await base44.asServiceRole.functions.invoke('onNotaFiscalAuthorized', { nota_fiscal_id: nfId, empresa_id }); } catch(_) {}
        }
        try { await base44.asServiceRole.entities.AuditLog.create({ usuario: 'Webhook', acao: 'Edição', modulo: 'Fiscal', tipo_auditoria: 'integracao', entidade: prov, descricao: `Atualização NF-e ${nfId}`, empresa_id, group_id, dados_novos: { status: nfStatus }, data_hora: new Date().toISOString(), sucesso: true }); } catch {}
      }
      return Response.json({ ok: true, action: 'nfe_webhook_processed' });
    }
  }

  // Webhooks Marketplaces
    if (payload?.provider && (payload.provider === 'mercado_livre' || payload.provider === 'amazon' || payload.provider === 'ecommerce_site')) {
      const empresa_id = payload.empresa_id || payload.company_id || null;
      const group_id = payload.group_id || null;
      try { await base44.asServiceRole.entities.AuditLog.create({ usuario: 'Webhook', acao: 'Criação', modulo: 'Integrações', tipo_auditoria: 'integracao', entidade: payload.provider, descricao: `Webhook recebido: ${payload.event || 'evento'}`, empresa_id, group_id, dados_novos: payload, data_hora: new Date().toISOString(), sucesso: true }); } catch {}
      if (Array.isArray(payload?.ajustes_estoque) && empresa_id) {
        try { await base44.asServiceRole.functions.invoke('applyInventoryAdjustments', { empresa_id, ajustes: payload.ajustes_estoque }); } catch (_) {}
      }
      if (Array.isArray(payload?.pricing_updates) && empresa_id) {
        try {
          for (const upd of payload.pricing_updates) {
            const pid = upd.produto_id;
            if (!pid) continue;
            const patch = {};
            if (upd.preco_venda != null) patch.preco_venda = Number(upd.preco_venda);
            if (upd.custo_medio != null) patch.custo_medio = Number(upd.custo_medio);
            if (Object.keys(patch).length) {
              await base44.asServiceRole.entities.Produto.update(pid, patch);
            }
          }
          await base44.asServiceRole.entities.AuditLog.create({ usuario: 'Webhook', acao: 'Edição', modulo: 'Integrações', tipo_auditoria: 'integracao', entidade: payload.provider, descricao: 'Atualização de preços aplicada', empresa_id, group_id, dados_novos: { count: payload.pricing_updates.length }, data_hora: new Date().toISOString(), sucesso: true });
        } catch (_) {}
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