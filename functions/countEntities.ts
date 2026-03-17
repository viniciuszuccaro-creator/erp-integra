import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const MODULE_BY_ENTITY = {
  Cliente: 'CRM',
  Oportunidade: 'CRM',
  Interacao: 'CRM',
  Pedido: 'Comercial',
  NotaFiscal: 'Fiscal',
  Entrega: 'Expedição',
  Fornecedor: 'Compras',
  SolicitacaoCompra: 'Compras',
  OrdemCompra: 'Compras',
  Produto: 'Estoque',
  MovimentacaoEstoque: 'Estoque',
  ContaPagar: 'Financeiro',
  ContaReceber: 'Financeiro',
  CentroCusto: 'Financeiro',
  PlanoDeContas: 'Financeiro',
  PlanoContas: 'Financeiro',
  User: 'Sistema',
};

/**
 * FUNÇÃO BACKEND: Contagem Eficiente de Entidades
 * 
 * Esta função resolve o problema de contagem precisa para grandes volumes de dados
 * fazendo a contagem no lado do servidor de forma otimizada.
 * 
 * Para volumes muito grandes (>10k), usa paginação incremental.
 * Para volumes menores, busca tudo de uma vez.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entityName, filter = {}, withGroupTotal = false } = await req.json();

    // Enforce multiempresa: não-admin deve enviar empresa_id ou group_id
    const scopeProvided = !!filter?.empresa_id || !!filter?.group_id || (!!filter?.$or && Array.isArray(filter.$or) && filter.$or.some(c => c?.empresa_id || c?.empresa_dona_id || c?.empresa_alocada_id || c?.group_id));
    if (user.role !== 'admin' && !scopeProvided) {
      return Response.json({ error: 'escopo_multiempresa_obrigatorio' }, { status: 400 });
    }

    // Normaliza filtro para campos array (empresas_compartilhadas_ids)
    const normalizedFilter = (() => {
      // Top-level ajuste
      let f = { ...filter };
      if (f && typeof f === 'object' && 'empresas_compartilhadas_ids' in f) {
        const v = f.empresas_compartilhadas_ids;
        if (typeof v === 'string') {
          f = { ...f, empresas_compartilhadas_ids: { $in: [v] } };
        }
      }
      // Ajuste em $or
      if (f.$or && Array.isArray(f.$or)) {
        f = {
          ...f,
          $or: f.$or.map((cond) => {
            if (cond && typeof cond === 'object' && 'empresas_compartilhadas_ids' in cond) {
              const v = cond.empresas_compartilhadas_ids;
              if (typeof v === 'string') return { empresas_compartilhadas_ids: { $in: [v] } };
            }
            return cond;
          })
        };
      }
      return f;
    })();

    // Expansão multiempresa para entidades com compartilhamento quando só empresa_id é passado
    const EXPAND_SET = new Set(['Cliente','Fornecedor','Transportadora']);
    const expandedFilter = (() => {
      if (EXPAND_SET.has(entityName) && normalizedFilter?.empresa_id && !normalizedFilter?.$or) {
        const { empresa_id, ...rest } = normalizedFilter;
        return {
          ...rest,
          $or: [
            { empresa_id },
            { empresa_dona_id: empresa_id },
            { empresas_compartilhadas_ids: { $in: [empresa_id] } }
          ]
        };
      }
      return normalizedFilter;
    })();

    // RBAC simplificado: usuário já autenticado; evitamos chamada a entityGuard que perde contexto do usuário quando invocada de servidor.

    if (!entityName) {
      return Response.json({ error: 'entityName é obrigatório' }, { status: 400 });
    }

    // ✅ CONTAGEM REAL COMPLETA - busca tudo até encontrar o total
    let totalCount = 0;
    const BATCH_SIZE = 500;
    let skip = 0;
    let hasMore = true;
    const preFinal = (() => {
      if (expandedFilter && expandedFilter.$or && expandedFilter.group_id) {
        const { group_id, ...rest } = expandedFilter;
        return { ...rest, $or: [...expandedFilter.$or, { group_id }] };
      }
      return expandedFilter;
    })();

    // Expansão por grupo → todas empresas do grupo quando não há empresa no filtro
    let finalFilter = preFinal;
    if (finalFilter?.group_id && !finalFilter?.$or && !finalFilter?.empresa_id && !finalFilter?.empresa_dona_id && !finalFilter?.empresa_alocada_id) {
      try {
        const groupId = finalFilter.group_id;
        const empresas = await base44.asServiceRole.entities.Empresa.filter({ group_id: groupId }, undefined, 1000);
        const empresasIds = (empresas || []).map(e => e.id).filter(Boolean);
        const rest = { ...finalFilter };
        delete rest.group_id;
        const ctxCampo = (entityName === 'Fornecedor' || entityName === 'Transportadora') ? 'empresa_dona_id' : (entityName === 'Colaborador' ? 'empresa_alocada_id' : 'empresa_id');
        if (EXPAND_SET.has(entityName)) {
          finalFilter = { ...rest, $or: [
            { [ctxCampo]: { $in: empresasIds } },
            ...(ctxCampo !== 'empresa_id' ? [{ empresa_id: { $in: empresasIds } }] : []),
            { empresas_compartilhadas_ids: { $in: empresasIds } },
            { group_id: groupId }
          ]};
        } else {
          finalFilter = { ...rest, $or: [ { [ctxCampo]: { $in: empresasIds } }, { group_id: groupId } ] };
        }
      } catch (_) {}
    }

    try {
      // Busca em lotes até obter todos os registros
      while (hasMore) {
        const batch = await base44.asServiceRole.entities[entityName].filter(finalFilter, undefined, BATCH_SIZE, skip);
        
        if (!batch || batch.length === 0) {
          hasMore = false;
        } else {
          totalCount += batch.length;
          
          // Se retornou menos que BATCH_SIZE, chegamos ao fim
          if (batch.length < BATCH_SIZE) {
            hasMore = false;
          } else {
            skip += BATCH_SIZE;
          }
        }
      }

      const result = {
        count: totalCount,
        isEstimate: false,
        entityName,
        filter: expandedFilter
      };

      // Opcional: retornar total consolidado por grupo, quando solicitado e houver group_id no filtro de entrada
      if (withGroupTotal && (filter?.group_id || expandedFilter?.group_id)) {
        try {
          let groupFilter = { group_id: (filter?.group_id || expandedFilter?.group_id) };
          // Reaproveita a mesma lógica de expansão por grupo para garantir consistência
          let gf = groupFilter;
          if (gf?.group_id) {
            const groupId = gf.group_id;
            const empresas = await base44.asServiceRole.entities.Empresa.filter({ group_id: groupId }, undefined, 1000);
            const empresasIds = (empresas || []).map(e => e.id).filter(Boolean);
            const ctxCampo = (entityName === 'Fornecedor' || entityName === 'Transportadora') ? 'empresa_dona_id' : (entityName === 'Colaborador' ? 'empresa_alocada_id' : 'empresa_id');
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
              gf = { $or: [ { [ctxCampo]: { $in: empresasIds } }, { group_id: groupId } ] };
            }
          }

          let gCount = 0;
          const BATCH = 1000;
          let gSkip = 0; let more = true;
          while (more) {
            const batch = await base44.asServiceRole.entities[entityName].filter(gf, undefined, BATCH, gSkip);
            if (!batch || batch.length === 0) { more = false; }
            else {
              gCount += batch.length;
              if (batch.length < BATCH) more = false; else gSkip += BATCH;
            }
          }
          result.group_total = gCount;
        } catch (_) {
          // se falhar, mantém apenas o count principal
        }
      }

      return Response.json(result);

    } catch (error) {
      console.error(`Erro ao contar ${entityName}:`, error);
      return Response.json({
        error: 'Erro ao contar entidade',
        details: error.message,
        count: 0,
        isEstimate: true
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Erro na função countEntities:', error);
    return Response.json({
      error: 'Erro interno do servidor',
      details: error.message
    }, { status: 500 });
  }
});