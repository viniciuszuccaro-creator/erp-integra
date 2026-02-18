import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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

    const { entityName, filter = {} } = await req.json();

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

    const mod = MODULE_BY_ENTITY[entityName] || 'Sistema';
    try {
      const guard = await base44.asServiceRole.functions.invoke('entityGuard', {
        module: mod,
        section: entityName,
        action: 'visualizar',
        empresa_id: filter?.empresa_id || filter?.empresa_alocada_id || filter?.empresa_dona_id || null,
        group_id: filter?.group_id || null,
      });
      if (!guard?.data?.allowed) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch (_) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!entityName) {
      return Response.json({ error: 'entityName é obrigatório' }, { status: 400 });
    }

    // ✅ CONTAGEM REAL COMPLETA - busca tudo até encontrar o total
    let totalCount = 0;
    const BATCH_SIZE = 500;
    let skip = 0;
    let hasMore = true;

    try {
      // Busca em lotes até obter todos os registros
      while (hasMore) {
        const batch = await base44.asServiceRole.entities[entityName].filter(expandedFilter, undefined, BATCH_SIZE, skip);
        
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

      return Response.json({
        count: totalCount,
        isEstimate: false,
        entityName,
        filter: expandedFilter
        });

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