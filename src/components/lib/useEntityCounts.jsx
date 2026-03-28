/**
 * useEntityCounts V6 — contagem robusta multiempresa
 * - SEM cache em memória (COUNT_CACHE removido — causava contagens stale após mutações)
 * - Usa batch API do countEntities (1 request para N entidades)
 * - React Query com staleTime=30s controla a frequência de re-fetch
 * - Invalidação automática via subscribe por entidade
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useMemo, useEffect } from "react";

// Entidades que NÃO precisam de filtro de empresa/grupo (catálogos globais)
export const SIMPLE_CATALOG = new Set([
  'Banco','FormaPagamento','TipoDespesa','MoedaIndice','TipoFrete',
  'UnidadeMedida','Departamento','Cargo','Turno','GrupoProduto','Marca',
  'SetorAtividade','LocalEstoque','TabelaFiscal','CentroResultado',
  'OperadorCaixa','RotaPadrao','ModeloDocumento','KitProduto','CatalogoWeb',
  'Servico','CondicaoComercial','TabelaPreco','PerfilAcesso',
  'ConfiguracaoNFe','ConfiguracaoBoletos','ConfiguracaoWhatsApp',
  'GatewayPagamento','ApiExterna','Webhook','ChatbotIntent','ChatbotCanal',
  'JobAgendado','EventoNotificacao','SegmentoCliente','RegiaoAtendimento',
  'ContatoB2B','CentroCusto','PlanoDeContas','PlanoContas',
  'Veiculo','Motorista','Representante','GrupoEmpresarial','Empresa',
  'ConfiguracaoDespesaRecorrente',
]);

const CAMPO_CTX = {
  Fornecedor: 'empresa_dona_id',
  Transportadora: 'empresa_dona_id',
  Colaborador: 'empresa_alocada_id',
};

const SHARED = new Set(['Cliente', 'Fornecedor', 'Transportadora']);

export function buildContextFilter(entityName, empresaId, groupId, empresasDoGrupo) {
  if (SIMPLE_CATALOG.has(entityName)) return {};

  const campo = CAMPO_CTX[entityName] || 'empresa_id';
  const orConds = [];
  const grupoEmpIds = Array.isArray(empresasDoGrupo)
    ? empresasDoGrupo.map(e => e.id).filter(Boolean)
    : [];

  if (groupId) orConds.push({ group_id: groupId });

  if (empresaId) {
    if (entityName === 'Cliente') {
      orConds.push({ empresa_id: empresaId }, { empresa_dona_id: empresaId });
    } else {
      orConds.push({ [campo]: empresaId });
    }
    if (SHARED.has(entityName)) {
      orConds.push({ empresas_compartilhadas_ids: { $in: [empresaId] } });
    }
  }

  const otherIds = empresaId ? grupoEmpIds.filter(id => id !== empresaId) : grupoEmpIds;
  if (otherIds.length > 0) {
    if (entityName === 'Cliente') {
      orConds.push({ empresa_id: { $in: otherIds } }, { empresa_dona_id: { $in: otherIds } });
    } else if (SHARED.has(entityName)) {
      orConds.push({ [campo]: { $in: otherIds } }, { empresas_compartilhadas_ids: { $in: otherIds } });
    } else {
      orConds.push({ [campo]: { $in: otherIds } });
    }
  }

  if (orConds.length === 0) return null;
  return { $or: orConds };
}

// Fallback: contagem individual via countEntities (single mode)
async function countSingle(entityName, filter) {
  try {
    const res = await base44.functions.invoke('countEntities', {
      entityName,
      filter: filter || {},
    });
    const d = res?.data;
    if (typeof d?.count === 'number') return d.count;
  } catch (_) {}
  // Fallback via listagem
  try {
    const res = await base44.functions.invoke('entityListSorted', {
      entityName,
      filter: filter || {},
      sortField: 'id',
      sortDirection: 'asc',
      limit: 2000,
    });
    return Array.isArray(res?.data) ? res.data.length : 0;
  } catch (_) {}
  return 0;
}

export function useEntityCounts(entities = []) {
  const { grupoAtual, empresaAtual, empresasDoGrupo } = useContextoVisual();
  const queryClient = useQueryClient();

  const groupId = grupoAtual?.id || null;
  const empresaId = empresaAtual?.id || null;

  const normalized = useMemo(() => {
    const arr = Array.isArray(entities) ? entities : [entities];
    return arr.filter(Boolean);
  }, [entities.join ? entities.join(',') : JSON.stringify(entities)]); // eslint-disable-line

  const entitiesKey = useMemo(() => [...normalized].sort().join(','), [normalized]);

  const grupoEmpIdsKey = useMemo(
    () => (Array.isArray(empresasDoGrupo) ? empresasDoGrupo.map(e => e.id).filter(Boolean).sort().join(',') : ''),
    [empresasDoGrupo]
  );

  const queryKey = ['entityCounts_v5', entitiesKey, groupId, empresaId, grupoEmpIdsKey];

  const canFetch = normalized.length > 0 && normalized.some(e => {
    if (SIMPLE_CATALOG.has(e)) return true;
    return !!(groupId || empresaId);
  });

  const { data: counts = {}, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!normalized.length) return {};

      const batchPayload = [];
      const fixed = {}; // entidades com resultado imediato (sem escopo)

      for (const entityName of normalized) {
        const isSimple = SIMPLE_CATALOG.has(entityName);
        if (!isSimple && !groupId && !empresaId) {
          fixed[entityName] = 0;
          continue;
        }
        const filter = isSimple
          ? {}
          : (buildContextFilter(entityName, empresaId, groupId, empresasDoGrupo) || {});
        if (filter === null) {
          fixed[entityName] = 0;
          continue;
        }
        batchPayload.push({ entityName, filter });
      }

      if (!batchPayload.length) return fixed;

      // Batch API — 1 request para todas as entidades
      try {
        const res = await base44.functions.invoke('countEntities', {
          entities: batchPayload,
        });
        const d = res?.data;
        if (d?.counts && typeof d.counts === 'object') {
          return { ...fixed, ...d.counts };
        }
      } catch (_) {}

      // Fallback sequencial (evita 429)
      const result = { ...fixed };
      for (const { entityName, filter } of batchPayload) {
        result[entityName] = await countSingle(entityName, filter);
      }
      return result;
    },
    staleTime: 30_000,   // 30s — expira rápido para refletir mutações
    gcTime: 300_000,
    placeholderData: prev => prev,
    refetchOnWindowFocus: false,
    enabled: canFetch,
  });

  // Invalidar quando registros mudam
  useEffect(() => {
    if (!normalized.length) return;
    const unsubs = normalized.map(entity => {
      const api = base44.entities?.[entity];
      if (!api?.subscribe) return null;
      return api.subscribe(() => {
        queryClient.invalidateQueries({ queryKey: ['entityCounts_v5'] });
      });
    }).filter(Boolean);
    return () => { unsubs.forEach(u => { if (typeof u === 'function') u(); }); };
  }, [entitiesKey, queryClient]); // eslint-disable-line

  const total = useMemo(
    () => normalized.reduce((acc, e) => acc + (Number(counts[e]) || 0), 0),
    [counts, normalized]
  );

  return { counts: counts || {}, total, isLoading };
}

export default useEntityCounts;