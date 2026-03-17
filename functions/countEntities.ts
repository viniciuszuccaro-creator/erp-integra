import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const MODULE_BY_ENTITY = {
  Cliente: 'CRM', Oportunidade: 'CRM', Interacao: 'CRM', Pedido: 'Comercial',
  NotaFiscal: 'Fiscal', Entrega: 'Expedição', Fornecedor: 'Compras',
  SolicitacaoCompra: 'Compras', OrdemCompra: 'Compras', Produto: 'Estoque',
  MovimentacaoEstoque: 'Estoque', ContaPagar: 'Financeiro', ContaReceber: 'Financeiro',
  CentroCusto: 'Financeiro', PlanoDeContas: 'Financeiro', PlanoContas: 'Financeiro', User: 'Sistema',
};

const EXPAND_SET = new Set(['Cliente', 'Fornecedor', 'Transportadora']);

function normalizeSharedFilter(entityName, f) {
  if (!f || typeof f !== 'object') return f || {};
  let out = { ...f };
  if ('empresas_compartilhadas_ids' in out && typeof out.empresas_compartilhadas_ids === 'string') {
    out = { ...out, empresas_compartilhadas_ids: { $in: [out.empresas_compartilhadas_ids] } };
  }
  if (Array.isArray(out.$or)) {
    out = {
      ...out,
      $or: out.$or.map(cond => {
        if (cond && typeof cond === 'object' && 'empresas_compartilhadas_ids' in cond) {
          const v = cond.empresas_compartilhadas_ids;
          if (typeof v === 'string') return { empresas_compartilhadas_ids: { $in: [v] } };
        }
        return cond;
      })
    };
  }
  return out;
}

async function expandByGroupIfNeeded(base44, entityName, f) {
  const ctxCampo = (entityName === 'Fornecedor' || entityName === 'Transportadora') ? 'empresa_dona_id'
    : (entityName === 'Colaborador' ? 'empresa_alocada_id' : 'empresa_id');

  if (EXPAND_SET.has(entityName) && f?.empresa_id && !f?.$or) {
    const { empresa_id, ...rest } = f;
    f = {
      ...rest,
      $or: [
        { empresa_id },
        { empresa_dona_id: empresa_id },
        { empresas_compartilhadas_ids: { $in: [empresa_id] } }
      ]
    };
  }

  if (f && f.$or && f.group_id) {
    const { group_id, ...rest } = f;
    f = { ...rest, $or: [...f.$or, { group_id }] };
  }

  if (f?.group_id && !f?.$or && !f?.empresa_id && !f?.empresa_dona_id && !f?.empresa_alocada_id) {
    try {
      const groupId = f.group_id;
      const empresas = await base44.asServiceRole.entities.Empresa.filter({ group_id: groupId }, undefined, 1000);
      const empresasIds = (empresas || []).map(e => e.id).filter(Boolean);
      const rest = { ...f };
      delete rest.group_id;
      if (EXPAND_SET.has(entityName)) {
        f = {
          ...rest,
          $or: [
            { [ctxCampo]: { $in: empresasIds } },
            ...(ctxCampo !== 'empresa_id' ? [{ empresa_id: { $in: empresasIds } }] : []),
            { empresas_compartilhadas_ids: { $in: empresasIds } },
            { group_id: groupId }
          ]
        };
      } else {
        f = { ...rest, $or: [{ [ctxCampo]: { $in: empresasIds } }, { group_id: groupId }] };
      }
    } catch (_) { }
  }
  return f;
}

// Contagem via cursor com retry exponencial
async function fastCount(base44, entityName, finalFilter) {
  let total = 0;
  const BATCH = 500;
  let skip = 0;
  while (true) {
    let attempt = 0;
    let batch;
    while (true) {
      try {
        batch = await base44.asServiceRole.entities[entityName].filter(finalFilter, undefined, BATCH, skip);
        break;
      } catch (err) {
        const status = err?.status || err?.response?.status;
        if (status === 429 && attempt < 3) {
          await new Promise(r => setTimeout(r, 600 * Math.pow(2, attempt) + Math.floor(Math.random() * 200)));
          attempt++;
          continue;
        }
        throw err;
      }
    }
    if (!batch || batch.length === 0) break;
    total += batch.length;
    if (batch.length < BATCH) break;
    skip += BATCH;
  }
  return total;
}

async function countOne(base44, user, payload) {
  const { entityName, filter = {}, withGroupTotal = false } = payload || {};
  if (!entityName) return { entityName, count: 0, isEstimate: true };

  const scopeProvided = !!filter?.empresa_id || !!filter?.group_id
    || (!!filter?.$or && Array.isArray(filter.$or) && filter.$or.some(c => c?.empresa_id || c?.empresa_dona_id || c?.empresa_alocada_id || c?.group_id));
  if (user.role !== 'admin' && !scopeProvided) {
    return { entityName, error: 'escopo_multiempresa_obrigatorio', count: 0, isEstimate: true };
  }

  const normalized = normalizeSharedFilter(entityName, filter);
  const finalFilter = await expandByGroupIfNeeded(base44, entityName, normalized);

  const totalCount = await fastCount(base44, entityName, finalFilter);
  const result = { entityName, count: totalCount, isEstimate: false };

  if (withGroupTotal && (filter?.group_id || finalFilter?.group_id)) {
    try {
      const groupId = filter?.group_id || finalFilter?.group_id;
      const empresas = await base44.asServiceRole.entities.Empresa.filter({ group_id: groupId }, undefined, 1000);
      const empresasIds = (empresas || []).map(e => e.id).filter(Boolean);
      const ctxCampo = (entityName === 'Fornecedor' || entityName === 'Transportadora') ? 'empresa_dona_id'
        : (entityName === 'Colaborador' ? 'empresa_alocada_id' : 'empresa_id');

      let gf;
      if (EXPAND_SET.has(entityName)) {
        gf = {
          $or: [
            { [ctxCampo]: { $in: empresasIds } },
            ...(ctxCampo !== 'empresa_id' ? [{ empresa_id: { $in: empresasIds } }] : []),
            { empresas_compartilhadas_ids: { $in: empresasIds } },
            { group_id: groupId }
          ]
        };
      } else {
        gf = { $or: [{ [ctxCampo]: { $in: empresasIds } }, { group_id: groupId }] };
      }

      result.group_total = await fastCount(base44, entityName, gf);
    } catch (_) { }
  }

  return result;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let body = {};
    try { body = await req.json(); } catch (_) { }

    const entitiesBatch = Array.isArray(body?.entities) ? body.entities : null;

    // MODO LOTE: { entities: [{ entityName, filter, withGroupTotal? }, ...] }
    if (entitiesBatch && entitiesBatch.length > 0) {
      const MAX_CONCURRENCY = 2; // reduzido para evitar 429 em cascata
      const results = new Array(entitiesBatch.length);
      let idx = 0;

      async function worker() {
        while (idx < entitiesBatch.length) {
          const mine = idx++;
          const payload = entitiesBatch[mine] || {};
          try {
            results[mine] = await countOne(base44, user, payload);
          } catch (err) {
            results[mine] = { entityName: payload?.entityName, count: 0, isEstimate: true, error: String(err?.message || err) };
          }
        }
      }

      const ws = Array.from({ length: Math.min(MAX_CONCURRENCY, entitiesBatch.length) }, () => worker());
      await Promise.all(ws);

      const counts = {};
      const group_totals = {};
      for (const r of results) {
        if (!r) continue;
        if (r.entityName != null && typeof r.count === 'number') counts[r.entityName] = r.count;
        if (r.entityName != null && typeof r.group_total === 'number') group_totals[r.entityName] = r.group_total;
      }
      const out = { counts };
      if (Object.keys(group_totals).length > 0) out.group_totals = group_totals;
      return Response.json(out);
    }

    // MODO SINGLE (retrocompatível)
    const single = await countOne(base44, user, {
      entityName: body?.entityName,
      filter: body?.filter || {},
      withGroupTotal: !!body?.withGroupTotal
    });
    if (single.error) {
      return Response.json(single, { status: single.error === 'escopo_multiempresa_obrigatorio' ? 400 : 500 });
    }
    return Response.json({
      count: single.count,
      isEstimate: single.isEstimate,
      entityName: single.entityName,
      filter: body?.filter || {},
      group_total: single.group_total
    });

  } catch (error) {
    console.error('Erro na função countEntities:', error);
    return Response.json({ error: 'Erro interno do servidor', details: error.message }, { status: 500 });
  }
});