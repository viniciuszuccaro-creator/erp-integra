import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const EXPAND_SET = new Set(['Cliente', 'Fornecedor', 'Transportadora']);

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
  'TabelaPrecoItem', 'CentroOperacao',
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

  if (EXPAND_SET.has(entityName) && f?.empresa_id && !f?.$or) {
    const { empresa_id, ...rest } = f;
    return {
      ...rest,
      $or: [
        { empresa_id },
        { empresa_dona_id: empresa_id },
        { empresas_compartilhadas_ids: { $in: [empresa_id] } }
      ]
    };
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
            { group_id: groupId }
          ]
        };
      }
      return { ...rest, $or: [{ [ctxCampo]: { $in: empresasIds } }, { group_id: groupId }] };
    } catch (_) { /* fallback */ }
  }
  return f;
}

/**
 * Contagem eficiente: usa paginação em cascata limitada a 2000 registros.
 * Máximo 4 páginas de 500 = até 2000 registros exatos.
 * Para catálogos simples (geralmente < 200 registros), 1 chamada resolve.
 */
async function fastCount(base44, entityName, finalFilter, isSimple) {
  const PAGE = isSimple ? 500 : 500;
  const MAX_PAGES = isSimple ? 2 : 4; // catálogos simples raramente têm mais de 1000
  let total = 0;

  for (let p = 0; p < MAX_PAGES; p++) {
    let batch;
    try {
      batch = await base44.asServiceRole.entities[entityName].filter(finalFilter, '-id', PAGE, p * PAGE);
    } catch (err) {
      const status = err?.status || err?.response?.status;
      if (status === 429) {
        // Rate limit: aguarda e tenta uma vez
        await new Promise(r => setTimeout(r, 2000));
        try {
          batch = await base44.asServiceRole.entities[entityName].filter(finalFilter, '-id', PAGE, p * PAGE);
        } catch (_) {
          return total > 0 ? total : 0;
        }
      } else {
        return total > 0 ? total : 0;
      }
    }

    const n = Array.isArray(batch) ? batch.length : 0;
    total += n;
    if (n < PAGE) return total; // última página
  }
  return total;
}

async function countOne(base44, user, payload) {
  const { entityName, filter = {} } = payload || {};
  if (!entityName) return { entityName, count: 0 };

  const isSimple = SIMPLE_CATALOG.has(entityName);
  const scopeProvided = filter?.empresa_id || filter?.group_id || filter?.$or?.length > 0;

  if (!isSimple && !scopeProvided && user?.role !== 'admin') {
    return { entityName, count: 0, error: 'escopo_obrigatorio' };
  }

  let finalFilter = normalizeSharedFilter(filter);
  if (!isSimple) {
    finalFilter = await expandGroupFilter(base44, entityName, finalFilter);
  }

  const count = await fastCount(base44, entityName, finalFilter, isSimple);
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
    if (entitiesBatch && entitiesBatch.length > 0) {
      const counts = {};

      for (let i = 0; i < entitiesBatch.length; i++) {
        const payload = entitiesBatch[i] || {};
        try {
          const result = await countOne(base44, user, payload);
          if (result.entityName) counts[result.entityName] = result.count;
        } catch (_) {
          if (payload?.entityName) counts[payload.entityName] = 0;
        }
        // Delay adaptativo entre entidades para evitar 429
        if (i < entitiesBatch.length - 1) {
          await new Promise(r => setTimeout(r, 300));
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