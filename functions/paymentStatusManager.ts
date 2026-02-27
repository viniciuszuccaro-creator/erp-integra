import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission, audit } from './_lib/guard.js';
import { computeUpdatesForContaPagar, computeUpdatesForContaReceber } from './_lib/paymentStatusUtils.js';


// Helpers Financeiro Profissional
function isCR(entity){ return entity==='ContaReceber'; }
function isCP(entity){ return entity==='ContaPagar'; }
function normalizePagamento(p){
  const v = Number(p?.valor)||0;
  return {
    meio: p?.meio || 'PIX',
    valor: v,
    data: p?.data || new Date().toISOString().slice(0,10),
    parcelas: Array.isArray(p?.parcelas)? p.parcelas : [],
    multiplos_meios: Array.isArray(p?.multiplos_meios)? p.multiplos_meios : [],
    obra_id: p?.obra_id || null,
    fornecedor_id: p?.fornecedor_id || null,
  };
}

async function conciliarExtrato(base44, ctx, conc){
  if (!conc?.file_url) return { ok:false, error:'file_url obrigatório' };
  const toleranciaDias = Number(conc?.tolerancia_dias)||2;
  const tolerancia = Number(conc?.tolerancia_centavos)||1; // até 1 centavo
  const filtroBase = {};
  if (conc?.empresa_id) filtroBase.empresa_id = conc.empresa_id;
  if (conc?.group_id) filtroBase.group_id = conc.group_id;

  const parsed = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
    file_url: conc.file_url,
    json_schema: { type:'object', additionalProperties:true }
  });
  const linhas = Array.isArray(parsed?.output) ? parsed.output : [];

  const abrirCR = await base44.asServiceRole.entities.ContaReceber.filter({ status: 'Pendente', ...filtroBase }, '-data_vencimento', 500);
  const abrirCP = await base44.asServiceRole.entities.ContaPagar.filter({ status: 'Pendente', ...filtroBase }, '-data_vencimento', 500);

  let conciliados = 0; const divergencias = [];
  const toAbs = (n)=>Math.round(Math.abs(Number(n)||0)*100);

  for (const l of linhas){
    const valor = Number(l.valor ?? l.amount ?? l.valor_transacao ?? 0);
    const dataStr = (l.data || l.date || '').slice(0,10);
    const alvoCR = valor>0; // crédito => receber, débito => pagar
    const pool = alvoCR ? abrirCR : abrirCP;
    const valAbs = toAbs(valor);

    // match por valor exato +- tolerancia e data próxima a vencimento
    let melhor = null; let melhorGap = 9999;
    for (const r of pool){
      const alvo = toAbs(r.valor);
      if (Math.abs(alvo - valAbs) <= tolerancia){
        const venc = r.data_vencimento ? new Date(r.data_vencimento) : null;
        const mov = dataStr ? new Date(dataStr) : null;
        const gap = (venc && mov) ? Math.abs((mov - venc)/(1000*60*60*24)) : 0;
        if (gap <= toleranciaDias && gap < melhorGap){ melhor = r; melhorGap = gap; }
      }
    }

    if (!melhor){
      divergencias.push({ descricao: 'Sem correspondência', valor, data: dataStr, tipo: alvoCR?'CR':'CP' });
      continue;
    }

    try{
      if (alvoCR){
        const novoReceb = Number(melhor.valor_recebido||0) + Math.abs(valor);
        const quitado = novoReceb + 0.005 >= Number(melhor.valor||0);
        await base44.asServiceRole.entities.ContaReceber.update(melhor.id, {
          valor_recebido: novoReceb,
          data_recebimento: new Date().toISOString().slice(0,10),
          status: quitado ? 'Recebido' : 'Parcial',
          detalhes_pagamento: { ...(melhor.detalhes_pagamento||{}), forma_pagamento: 'Conciliação', valor_liquido: novoReceb, status_compensacao: 'Conciliado' }
        });
      } else {
        const novoPago = Number(melhor.valor_pago||0) + Math.abs(valor);
        const quitado = novoPago + 0.005 >= Number(melhor.valor||0);
        await base44.asServiceRole.entities.ContaPagar.update(melhor.id, {
          valor_pago: novoPago,
          data_pagamento: new Date().toISOString().slice(0,10),
          status: quitado ? 'Pago' : 'Parcelado',
          detalhes_pagamento: { ...(melhor.detalhes_pagamento||{}), forma_pagamento: 'Conciliação', valor_liquido: novoPago, status_compensacao: 'Conciliado' }
        });
      }
      conciliados++;
    } catch (e){
      divergencias.push({ descricao: 'Falha ao atualizar', erro: String(e?.message||e), registro_id: melhor?.id, tipo: alvoCR?'CR':'CP' });
    }
  }

  // Análise inteligente de divergências via IA Financeira
  try{
    if (divergencias.length){
      await base44.asServiceRole.functions.invoke('iaFinanceAnomalyScan', { filtros: filtroBase, origem: 'conciliacao', divergencias });
    }
  } catch(_){/* não bloquear conciliação */}

  return { ok:true, conciliados, divergencias };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);
    const user = ctx.user;
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { entity, id, ids, action, justificativa, pagamento: pagamentoIn, conciliacao } = body || {};
    const internalToken = body?.internal_token || req.headers.get('x-internal-token') || null;
    const trustedInternal = !!(internalToken && Deno.env.get('DEPLOY_AUDIT_TOKEN') && internalToken === Deno.env.get('DEPLOY_AUDIT_TOKEN'));

    // Automação por evento (Entity Automation): lembretes de cobrança ao criar/atualizar CR perto do vencimento
    if (body?.event?.entity_name === 'ContaReceber' && (body.event.type === 'create' || body.event.type === 'update') && body?.data) {
      const cr = body.data;
      const empresaId = cr.empresa_id || null;
      const groupId = cr.group_id || null;
      const status = String(cr.status || '').toLowerCase();
      if (!empresaId || !cr.data_vencimento || !['pendente','atrasado','parcial'].includes(status)) {
        return Response.json({ ok: true, skipped: true });
      }
      const onlyDate = (d) => new Date(new Date(d).toISOString().slice(0,10));
      const diffDays = Math.floor((onlyDate(cr.data_vencimento).getTime() - onlyDate(new Date()).getTime()) / (1000*60*60*24));
      if (![3,0,-3].includes(diffDays)) {
        return Response.json({ ok: true, skipped: true, diffDays });
      }
      const valorFmt = Number(cr.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
      let mensagem = '';
      if (diffDays === 3) mensagem = `Lembrete: sua cobrança ${cr.numero_documento || cr.id} vence em 3 dias (R$ ${valorFmt}).`;
      if (diffDays === 0) mensagem = `Hoje vence sua cobrança ${cr.numero_documento || cr.id} (R$ ${valorFmt}).`;
      if (diffDays === -3) mensagem = `Aviso: sua cobrança ${cr.numero_documento || cr.id} venceu há 3 dias (R$ ${valorFmt}).`;
      try {
        await base44.asServiceRole.functions.invoke('whatsappSend', { action: 'sendText', empresaId, groupId, clienteId: cr.cliente_id || null, mensagem, internal_token: Deno.env.get('DEPLOY_AUDIT_TOKEN') || '' });
        await audit(base44, { id: 'Service' }, { acao: 'Criação', modulo: 'Financeiro', entidade: 'ContaReceber', registro_id: cr.id, descricao: 'Lembrete de cobrança enviado (automação)', empresa_id: empresaId, group_id: groupId, dados_novos: { diffDays } });
      } catch (_) {}
      return Response.json({ ok: true, reminder: true, diffDays });
    }

    // Execução agendada/service: varredura de CR e envio de lembretes (requer internal_token)
    if (action === 'lembretes_cobranca' && (trustedInternal || !user)) {
      const empresaIdIn = body.empresa_id || null;
      const groupIdIn = body.group_id || null;
      const empresas = [];
      if (groupIdIn) {
        const emps = await base44.asServiceRole.entities.Empresa.filter({ group_id: groupIdIn }, undefined, 200);
        (emps || []).forEach(e => empresas.push(e.id));
      } else if (empresaIdIn) {
        empresas.push(empresaIdIn);
      }
      let enviados = 0;
      const onlyDate = (d) => new Date(new Date(d).toISOString().slice(0,10));
      for (const eid of empresas) {
        const lista = await base44.asServiceRole.entities.ContaReceber.filter({ empresa_id: eid }, '-data_vencimento', 1000);
        for (const r of (lista || [])) {
          const st = String(r.status || '').toLowerCase();
          if (!r.data_vencimento || !['pendente','atrasado','parcial'].includes(st)) continue;
          const diff = Math.floor((onlyDate(r.data_vencimento).getTime() - onlyDate(new Date()).getTime()) / (1000*60*60*24));
          if (![3,0,-3].includes(diff)) continue;
          const valorFmt = Number(r.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
          let msg = '';
          if (diff === 3) msg = `Lembrete: sua cobrança ${r.numero_documento || r.id} vence em 3 dias (R$ ${valorFmt}).`;
          if (diff === 0) msg = `Hoje vence sua cobrança ${r.numero_documento || r.id} (R$ ${valorFmt}).`;
          if (diff === -3) msg = `Aviso: sua cobrança ${r.numero_documento || r.id} venceu há 3 dias (R$ ${valorFmt}).`;
          try {
            await base44.asServiceRole.functions.invoke('whatsappSend', { action: 'sendText', empresaId: eid, groupId: groupIdIn || r.group_id || null, clienteId: r.cliente_id || null, mensagem: msg, internal_token: Deno.env.get('DEPLOY_AUDIT_TOKEN') || '' });
            await audit(base44, { id: 'Service' }, { acao: 'Criação', modulo: 'Financeiro', entidade: 'ContaReceber', registro_id: r.id, descricao: 'Lembrete de cobrança enviado (varredura)', empresa_id: eid, group_id: groupIdIn || r.group_id || null, dados_novos: { diffDays: diff } });
            enviados++;
          } catch (_) {}
        }
      }
      return Response.json({ ok: true, enviados });
    }

    if (action === 'conciliar_extrato') {
      // validaremos adiante
    } else if (!['ContaPagar','ContaReceber'].includes(entity) || (!id && (!ids || !Array.isArray(ids) || ids.length === 0))) {
      return Response.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }

    // RBAC por módulo Financeiro
    const entityForPerm = action === 'conciliar_extrato' ? 'ContaReceber' : entity;
    const perm = await assertPermission(base44, ctx, 'Financeiro', entityForPerm, 'editar');
    if (perm) return perm;

    // Conciliação automática por extrato bancário
    if (action === 'conciliar_extrato') {
      const result = await conciliarExtrato(base44, ctx, conciliacao);
      await audit(base44, user, { acao:'Edição', modulo:'Financeiro', entidade:'Conciliação', registro_id: null, descricao: `Conciliação automática executada (${result.conciliados} itens)`, empresa_id: conciliacao?.empresa_id || null, dados_novos: { ...result, origem:'paymentStatusManager' } });
      return Response.json(result);
    }

    const api = base44.asServiceRole.entities[entity];
    const idsList = (ids && Array.isArray(ids) && ids.length) ? ids : [id];
    const pagamento = normalizePagamento(pagamentoIn);
    const extraFromMulti = Array.isArray(pagamento.multiplos_meios) ? pagamento.multiplos_meios.reduce((s,m)=> s + (Number(m?.valor)||0), 0) : 0;
    const valorTotal = (Number(pagamento.valor)||0) + extraFromMulti;

    const resultados = [];
    for (const alvoId of idsList){
      const registro = await api.get(alvoId);
      let updates = {};
      if (isCP(entity)) {
        updates = computeUpdatesForContaPagar(action, justificativa, registro) || {};
        if (valorTotal>0) {
          const novo = Number(registro.valor_pago||0) + valorTotal;
          const quitado = novo + 0.005 >= Number(registro.valor||0);
          updates.valor_pago = novo;
          updates.data_pagamento = new Date().toISOString().slice(0,10);
          updates.status = quitado ? 'Pago' : 'Parcelado';
          updates.detalhes_pagamento = { ...(registro.detalhes_pagamento||{}), forma_pagamento: pagamento.meio, valor_liquido: novo, multimeios: pagamento.multiplos_meios, parcelas: pagamento.parcelas };
          if (pagamento.fornecedor_id && !registro.fornecedor_id) updates.fornecedor_id = pagamento.fornecedor_id;
        }
      } else if (isCR(entity)) {
        updates = computeUpdatesForContaReceber(action, justificativa, registro) || {};
        if (valorTotal>0) {
          const novo = Number(registro.valor_recebido||0) + valorTotal;
          const quitado = novo + 0.005 >= Number(registro.valor||0);
          updates.valor_recebido = novo;
          updates.data_recebimento = new Date().toISOString().slice(0,10);
          updates.status = quitado ? 'Recebido' : 'Parcial';
          updates.detalhes_pagamento = { ...(registro.detalhes_pagamento||{}), forma_pagamento: pagamento.meio, valor_liquido: novo, multimeios: pagamento.multiplos_meios, parcelas: pagamento.parcelas };
          if (pagamento.obra_id && !registro.projeto_obra) updates.projeto_obra = pagamento.obra_id;
        }
      }

      const updated = await api.update(alvoId, updates);

      await audit(base44, user, {
        acao: 'Edição', modulo: 'Financeiro', entidade: entity, registro_id: alvoId,
        descricao: idsList.length>1 ? `Baixa em lote: ${action}` : `Transição pagamento: ${action}`,
        empresa_id: registro?.empresa_id || null,
        dados_anteriores: registro,
        dados_novos: { ...updates, __justificativa: justificativa || null, __pagamento: pagamento }
      });

      resultados.push({ id: alvoId, ok: true });
    }

    return Response.json({ ok: true, processados: resultados.length, resultados });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});