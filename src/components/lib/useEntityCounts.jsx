/**
 * useEntityCounts V5 — Contagem via asServiceRole (bypassa wrapper Layout)
 * ✅ NUNCA usa base44.functions.invoke (que passa pelo wrapper e tem rate limit)
 * ✅ Usa asServiceRole.entities diretamente (mais confiável e rápido)
 * ✅ Cache em memória 2 min
 * ✅ Batch com Promise.all (paralelo)
 * ✅ Real-time via subscribe
 * ✅ Suporta entidades simples (sem contexto) e com contexto multiempresa
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useMemo, useEffect } from "react";

const CACHE_TTL  = 120_000; // 2 min
const COUNT_CACHE = new Map();

// Entidades que não precisam de filtro empresa/grupo
const SIMPLE_CATALOG = new Set([
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
]);

// Campo de contexto por entidade
const CAMPO_CTX = {
  Fornecedor: 'empresa_dona_id',
  Transportadora: 'empresa_dona_id',
  Colaborador: 'empresa_alocada_id',
};

const SHARED = new Set(['Cliente', 'Fornecedor', 'Transportadora']);

/**
 * Monta filtro $or para contagem de entidade com contexto multiempresa.
 */
function buildFilter(entityName, empresaId, groupId, empresasDoGrupo) {
  if (SIMPLE_CATALOG.has(entityName)) return {};

  const campo = CAMPO_CTX[entityName] || 'empresa_id';
  const orConds = [];
  const grupoEmpIds = Array.isArray(empresasDoGrupo)
    ? empresasDoGrupo.map(e => e.id).filter(Boolean)
    : [];

  if (groupId)    orConds.push({ group_id: groupId });
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
  if (grupoEmpIds.length > 0) {
    const ids = empresaId ? grupoEmpIds.filter(id => id !== empresaId) : grupoEmpIds;
    if (ids.length > 0) {
      if (entityName === 'Cliente') {
        orConds.push({ empresa_id: { $in: ids } }, { empresa_dona_id: { $in: ids } });
      } else {
        orConds.push({ [campo]: { $in: ids } });
      }
      if (SHARED.has(entityName)) {
        orConds.push({ empresas_compartilhadas_ids: { $in: ids } });
      }
    }
  }

  if (orConds.length === 0) return {};
  return { $or: orConds };
}

// Exporta buildContextFilter para uso externo (VisualizadorUniversalEntidadeV24)
export function buildContextFilter(entityName, empresaId, groupId, empresasDoGrupo) {
  return buildFilter(entityName, empresaId, groupId, empresasDoGrupo);
}

/**
 * Conta uma entidade via asServiceRole.filter (máx. 2 páginas de 500 para evitar timeout)
 */
async function countEntity(entityName, filter) {
  const api = base44.asServiceRole?.entities?.[entityName];
  if (!api?.filter) return 0;

  try {
    const page1 = await api.filter(filter, '-updated_date', 500, 0);
    const count1 = Array.isArray(page1) ? page1.length : 0;
    if (count1 < 500) return count1;

    // Pode ter mais: busca 2ª página
    const page2 = await api.filter(filter, '-updated_date', 500, 500);
    const count2 = Array.isArray(page2) ? page2.length : 0;
    return count1 + count2;
  } catch {
    return 0;
  }
}

export function useEntityCounts(entities = []) {
  const { grupoAtual, empresaAtual, empresasDoGrupo } = useContextoVisual();
  const queryClient = useQueryClient();

  const groupId   = grupoAtual?.id  || null;
  const empresaId = empresaAtual?.id || null;
  const grupoEmpIdsKey = useMemo(
    () => (Array.isArray(empresasDoGrupo) ? empresasDoGrupo.map(e => e.id).filter(Boolean).sort().join(',') : ''),
    [empresasDoGrupo]
  );

  const normalized = useMemo(() => {
    const arr = Array.isArray(entities) ? entities : [entities];
    return arr.filter(Boolean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(entities)]);

  const entitiesKey = useMemo(() => [...normalized].sort().join(','), [normalized]);

  const queryKey = useMemo(
    () => ['entityCounts_v4', entitiesKey, groupId, empresaId, grupoEmpIdsKey],
    [entitiesKey, groupId, empresaId, grupoEmpIdsKey]
  );

  const canFetch = normalized.length > 0 && (
    normalized.some(e => SIMPLE_CATALOG.has(e)) || !!(groupId || empresaId)
  );

  const { data: counts = {}, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!normalized.length) return {};

      // Verifica cache
      const now = Date.now();
      const merged = {};
      const toFetch = [];

      for (const entityName of normalized) {
        const ck = `${entityName}|${groupId}|${empresaId}`;
        const cached = COUNT_CACHE.get(ck);
        if (cached && now - cached.ts < CACHE_TTL) {
          merged[entityName] = cached.count;
        } else {
          toFetch.push(entityName);
        }
      }

      if (toFetch.length === 0) return merged;

      // Conta todas em paralelo via asServiceRole (bypassa wrapper completamente)
      const results = await Promise.all(
        toFetch.map(async (entityName) => {
          const isSimple = SIMPLE_CATALOG.has(entityName);
          // Entidades de contexto sem empresa/grupo → 0
          if (!isSimple && !groupId && !empresaId) {
            return { entityName, count: 0 };
          }
          const filter = buildFilter(entityName, empresaId, groupId, empresasDoGrupo);
          const count  = await countEntity(entityName, filter);
          return { entityName, count };
        })
      );

      const allCounts = { ...merged };
      for (const { entityName, count } of results) {
        allCounts[entityName] = count;
        const ck = `${entityName}|${groupId}|${empresaId}`;
        COUNT_CACHE.set(ck, { count, ts: Date.now() });
      }

      return allCounts;
    },
    staleTime: CACHE_TTL,
    gcTime: 300_000,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
    enabled: canFetch,
  });

  // Real-time subscribe — invalida cache ao mudar
  useEffect(() => {
    if (!normalized.length) return;
    const unsubs = normalized.map(entity => {
      const api = base44.entities?.[entity];
      if (!api?.subscribe) return null;
      return api.subscribe(() => {
        // Limpa cache em memória
        normalized.forEach(e => COUNT_CACHE.delete(`${e}|${groupId}|${empresaId}`));
        queryClient.invalidateQueries({ queryKey });
      });
    }).filter(Boolean);
    return () => { unsubs.forEach(u => { if (typeof u === 'function') u(); }); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entitiesKey, groupId, empresaId]);

  const total = useMemo(
    () => normalized.reduce((acc, e) => acc + (Number(counts[e]) || 0), 0),
    [counts, normalized]
  );

  return { counts: counts || {}, total, isLoading };
}

export default useEntityCounts;