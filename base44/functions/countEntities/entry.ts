import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const EXPAND_SET = new Set(['Cliente', 'Fornecedor', 'Transportadora', 'Colaborador']);

const SIMPLE_CATALOG = new Set([
  'Banco', 'FormaPagamento', 'TipoDespesa', 'MoedaIndice', 'TipoFrete',
  'UnidadeMedida', 'Departamento', 'Cargo', 'Turno', 'GrupoProduto', 'Marca',
  'SetorAtividade', 'LocalEstoque', 'TabelaFiscal', 'CentroResultado',
  'OperadorCaixa', 'RotaPadrao', 'ModeloDocumento', 'KitProduto', 'CatalogoWeb',
  'Servico', 'CondicaoComercial', 'TabelaPreco', 'PerfilAcesso',
  'ConfiguracaoNFe', 'ConfiguracaoBoletos', 'ConfiguracaoWhatsApp',
  'GatewayPagamento', 'ApiExterna', 'Webhook', 'ChatbotIntent', 'ChatbotCanal',
  'JobAgendado', 'EventoNotificacao', 'SegmentoCliente', 'RegiaoAtendimento',
  'ContatoB2B', 'CentroCusto', 'PlanoDeContas', 'PlanoContas',
  'Veiculo', 'Motorista', 'Representante', 'GrupoEmpresarial', 'Empresa',
  'TabelaPrecoItem', 'CentroOperacao', 'ConfiguracaoDespesaRecorrente',
]);

function normalizeSharedFilter(f) {
  if (!f || typeof f !== 'object') return f || {};
  let out = { ...f };
  if ('empresas_compartilhadas_ids' in out && typeof out.empresas_compartilhadas_ids === 'string') {
    out.empresas_compartilhadas_ids = { $in: [out.empresas_compartilhadas_ids] };
  }
  if (Array.isArray(out.$or)) {
    out.$or = out.$or.map(cond => {
      if (cond?.empresas_compartilhadas_ids && typeof cond.empresas_compartilhadas_ids === 'string') {
        return { ...cond, empresas_compartilhadas_ids: { $in: [cond.empresas_compartilhadas_ids] } };
      }
      return cond;
    });
  }
  return out;
}

async function expandGroupFilter(base44, entityName, f) {
  const ctxCampo = (entityName === 'Fornecedor' || entityName === 'Transportadora') ? 'empresa_dona_id'
    : (entityName === 'Colaborador' ? 'empresa_alocada_id' : 'empresa_id');

  // Caso 1: entidades do EXPAND_SET com empresa_id — inclui legados (empresa_id: null)
  if (EXPAND_SET.has(entityName) && f?.empresa_id && !f?.$or) {
    const { empresa_id, ...rest } = f;
    const orConds = [
      { [ctxCampo]: empresa_id },
      { empresas_compartilhadas_ids: { $in: [empresa_id] } },
      { empresa_id: null }, // registros legados sem empresa
    ];
    if (ctxCampo !== 'empresa_id') orConds.push({ empresa_id });
    return { ...rest, $or: orConds };
  }

  // Caso 2: demais entidades com empresa_id — inclui legados
  if (!EXPAND_SET.has(entityName) && f?.empresa_id && !f?.$or && !f?.group_id) {
    const { empresa_id, ...rest } = f;
    return { ...rest, $or: [{ empresa_id }, { empresa_id: null }] };
  }

  if (f?.$or && f?.group_id) {
    const { group_id, ...rest } = f;
    return { ...rest, $or: [...f.$or, { group_id }] };
  }

  if (f?.group_id && !f?.$or && !f?.empresa_id && !f?.empresa_dona_id && !f?.empresa_alocada_id) {
    try {
      const groupId = f.group_id;
      const empresas = await base44.asServiceRole.entities.Empresa.filter({ group_id: groupId }, '-id', 200);
      const empresasIds = (empresas || []).map(e => e.id).filter(Boolean);
      const rest = { ...f };
      delete rest.group_id;
      if (EXPAND_SET.has(entityName)) {
        return {
          ...rest,
          $or: [
            { [ctxCampo]: { $in: empresasIds } },
            ...(ctxCampo !== 'empresa_id' ? [{ empresa_id: { $in: empresasIds } }] : []),
            { empresas_compartilhadas_ids: { $in: empresasIds } },
            { group_id: groupId },
            { empresa_id: null }, // registros legados
          ]
        };
      }
      return { ...rest, $or: [{ [ctxCampo]: { $in: empresasIds } }, { group_id: groupId }, { empresa_id: null }] };
    } catch (_) { /* fallback */ }
  }
  return f;
}

/**
 * fastCount V2 — contagem eficiente com retry automático em 429
 * Estratégia: páginas de 500 com delay progressivo.
 * Primeira page: sem delay. Pages seguintes: delay crescente.
 */
async function fastCount(base44, entityName, finalFilter) {
  const PAGE = 500;
  const MAX_PAGES = 20; // cap em 10.000 registros
  let total = 0;

  for (let page = 0; page < MAX_PAGES; page++) {
    if (page > 0) await new Promise(r => setTimeout(r, 400 + page * 100));

    let batch = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        batch = await base44.asServiceRole.entities[entityName].filter(finalFilter, '-id', PAGE, page * PAGE);
        break;
      } catch (err) {
        const status = err?.status || err?.response?.status;
        if (status === 429) {
          await new Promise(r => setTimeout(r, 1500 * Math.pow(2, attempt)));
        } else {
          batch = [];
          break;
        }
      }
    }

    const n = Array.isArray(batch) ? batch.length : 0;
    total += n;
    if (n < PAGE) break;
  }

  return total;
}

async function countOne(base44, user, payload) {
  const { entityName, filter = {} } = payload || {};
  if (!entityName) return { entityName, count: 0 };

  const isSimple = SIMPLE_CATALOG.has(entityName);
  const hasOr = Array.isArray(filter?.$or) && filter.$or.length > 0;
  const scopeProvided = filter?.empresa_id || filter?.group_id || filter?.empresa_dona_id || filter?.empresa_alocada_id || hasOr;

  // Entidades simples (catálogos) não precisam de escopo — retorna contagem total
  if (isSimple) {
    const simpleCount = await fastCount(base44, entityName, {});
    return { entityName, count: simpleCount };
  }

  // Sem escopo → conta total global (badges indicativos); dados protegidos via entityListSorted
  if (!scopeProvided) {
    const totalCount = await fastCount(base44, entityName, {});
    return { entityName, count: totalCount };
  }

  let finalFilter = normalizeSharedFilter({ ...filter });

  // Expande group_id mesmo quando $or já foi enviado (garante expansão de empresas)
  if (!isSimple) {
    finalFilter = await expandGroupFilter(base44, entityName, finalFilter);
  }

  const count = await fastCount(base44, entityName, finalFilter);
  return { entityName, count };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let body = {};
    try { body = await req.json(); } catch (_) { }

    const entitiesBatch = Array.isArray(body?.entities) ? body.entities : null;

    // MODO LOTE: { entities: [{ entityName, filter }, ...] }
    // Processa em janelas de 5 paralelas com delay de 200ms entre janelas
    if (entitiesBatch && entitiesBatch.length > 0) {
      const counts = {};
      // 2 paralelas com delay maior — evita burst de 429s
      const WINDOW = 2;
      const DELAY_BETWEEN_WINDOWS = 500;

      for (let i = 0; i < entitiesBatch.length; i += WINDOW) {
        const slice = entitiesBatch.slice(i, i + WINDOW);
        const results = await Promise.allSettled(
          slice.map(payload => countOne(base44, user, payload || {}))
        );
        results.forEach((r, idx) => {
          const payload = slice[idx] || {};
          if (r.status === 'fulfilled' && r.value?.entityName != null) {
            counts[r.value.entityName] = r.value.count;
          } else if (payload?.entityName) {
            counts[payload.entityName] = 0;
          }
        });
        if (i + WINDOW < entitiesBatch.length) {
          await new Promise(r => setTimeout(r, DELAY_BETWEEN_WINDOWS));
        }
      }

      return Response.json({ counts });
    }

    // MODO SINGLE
    const single = await countOne(base44, user, {
      entityName: body?.entityName,
      filter: body?.filter || {}
    });

    if (single.error) {
      return Response.json(single, { status: single.error === 'escopo_obrigatorio' ? 400 : 500 });
    }
    return Response.json({ count: single.count, entityName: single.entityName });

  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});