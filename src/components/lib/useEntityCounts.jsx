/**
 * useEntityCounts — Hook para contar entidades via countEntities backend
 * ✅ Batch de 5 entidades por vez (evita timeout/rate limit)
 * ✅ Cache em memória de 2 min por entidade+contexto
 * ✅ Multiempresa: injeta empresa_id/group_id no filtro
 * ✅ Real-time via subscribe
 * ✅ Retorna { counts, total, isLoading }
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useMemo, useEffect } from "react";

const CACHE_TTL = 120_000; // 2 min
const COUNT_CACHE = new Map();

// Entidades que não precisam de filtro empresa/grupo
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

// Campo de contexto por entidade
const CAMPO_CTX = {
  Fornecedor: 'empresa_dona_id',
  Transportadora: 'empresa_dona_id',
  Colaborador: 'empresa_alocada_id',
};

// Entidades com empresas_compartilhadas_ids
const SHARED = new Set(['Cliente', 'Fornecedor', 'Transportadora']);

/**
 * Monta filtro $or completo para o backend, considerando empresa E grupo.
 * O backend `expandGroupFilter` só funciona bem se receber já o $or pronto.
 */
function buildFilter(entityName, empresaId, groupId, empresasDoGrupo) {
  if (SIMPLE_CATALOG.has(entityName)) return {};

  const campo = CAMPO_CTX[entityName] || 'empresa_id';
  const orConds = [];

  // IDs de todas as empresas do grupo
  const grupoEmpIds = Array.isArray(empresasDoGrupo)
    ? empresasDoGrupo.map(e => e.id).filter(Boolean)
    : [];

  // Empresa específica selecionada
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

  // Empresas do grupo
  if (grupoEmpIds.length > 0) {
    if (entityName === 'Cliente') {
      orConds.push(
        { empresa_id: { $in: grupoEmpIds } },
        { empresa_dona_id: { $in: grupoEmpIds } }
      );
    } else {
      orConds.push({ [campo]: { $in: grupoEmpIds } });
    }
    if (SHARED.has(entityName)) {
      orConds.push({ empresas_compartilhadas_ids: { $in: grupoEmpIds } });
    }
  }

  // group_id direto
  if (groupId) {
    orConds.push({ group_id: groupId });
  }

  if (orConds.length === 0) return {};
  return { $or: orConds };
}

export function buildContextFilter(entityName, empresaId, groupId, empresasDoGrupo) {
  return buildFilter(entityName, empresaId, groupId, empresasDoGrupo);
}

function chunk(arr, n) {
  const result = [];
  for (let i = 0; i < arr.length; i += n) result.push(arr.slice(i, i + n));
  return result;
}

export function useEntityCounts(entities = []) {
  const { grupoAtual, empresaAtual, empresasDoGrupo } = useContextoVisual();
  const queryClient = useQueryClient();

  const groupId = grupoAtual?.id || null;
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

  const entitiesKey = useMemo(() => normalized.sort().join(','), [normalized]);

  const queryKey = useMemo(
    () => ['entityCounts_v4', entitiesKey, groupId, empresaId, grupoEmpIdsKey],
    [entitiesKey, groupId, empresaId, grupoEmpIdsKey]
  );

  const hasAnyContext = !!(groupId || empresaId);
  const allSimple = normalized.length > 0 && normalized.every(e => SIMPLE_CATALOG.has(e));
  const canFetch = normalized.length > 0 && (hasAnyContext || allSimple);

  const { data: counts = {}, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!normalized.length) return {};
      if (!hasAnyContext && !allSimple) return {};

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

      // Monta batch com filtros corretos (filtro $or completo por entidade)
      const batchItems = toFetch.map(entityName => {
        const filter = buildFilter(entityName, empresaId, groupId, empresasDoGrupo);
        return { entityName, filter };
      });

      // Divide em chunks de 5 para evitar timeout
      const chunks = chunk(batchItems, 5);
      const allCounts = {};

      for (let i = 0; i < chunks.length; i++) {
        try {
          const res = await base44.functions.invoke('countEntities', { entities: chunks[i] });
          const result = res?.data?.counts || {};
          Object.assign(allCounts, result);
          // Cachear resultados
          for (const { entityName } of chunks[i]) {
            const ck = `${entityName}|${groupId}|${empresaId}`;
            COUNT_CACHE.set(ck, { count: allCounts[entityName] ?? 0, ts: Date.now() });
          }
        } catch (_) {
          // Em erro, registra 0 para não bloquear
          for (const { entityName } of chunks[i]) {
            allCounts[entityName] = 0;
          }
        }
        if (i < chunks.length - 1) await new Promise(r => setTimeout(r, 100));
      }

      return { ...merged, ...allCounts };
    },
    staleTime: CACHE_TTL,
    gcTime: 300_000,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
    enabled: canFetch,
  });

  // Real-time subscribe
  useEffect(() => {
    if (!normalized.length) return;
    const unsubs = normalized.map(entity => {
      const api = base44.entities?.[entity];
      if (!api?.subscribe) return null;
      return api.subscribe(() => {
        // Invalida cache em memória
        normalized.forEach(e => {
          COUNT_CACHE.delete(`${e}|${groupId}|${empresaId}`);
        });
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