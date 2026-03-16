import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

// In-flight dedupe + tiny backoff for 429 on entityListSorted
const __elsInflight = (typeof window !== 'undefined' ? (window.__elsInflight || (window.__elsInflight = new Map())) : new Map());
const __elsCache = (typeof window !== 'undefined' ? (window.__elsCache || (window.__elsCache = new Map())) : new Map());
const __elsLastCallAt = (typeof window !== 'undefined' ? (window.__elsLastCallAt || (window.__elsLastCallAt = new Map())) : new Map());
const __elsCooldownUntil = (typeof window !== 'undefined' ? (window.__elsCooldownUntil || (window.__elsCooldownUntil = new Map())) : new Map());
const __elsEntityBusy = (typeof window !== 'undefined' ? (window.__elsEntityBusy || (window.__elsEntityBusy = new Map())) : new Map());
const __elsStrikeCount = (typeof window !== 'undefined' ? (window.__elsStrikeCount || (window.__elsStrikeCount = new Map())) : new Map());

// Stable stringify (sorted keys) to avoid cache misses when object key order changes
function stableStringify(value) {
  const seen = new WeakSet();
  const stringify = (val) => {
    if (val && typeof val === 'object') {
      if (seen.has(val)) return '"[circular]"';
      seen.add(val);
      if (Array.isArray(val)) return '[' + val.map(stringify).join(',') + ']';
      const keys = Object.keys(val).sort();
      return '{' + keys.map(k => JSON.stringify(k) + ':' + stringify(val[k])).join(',') + '}';
    }
    return JSON.stringify(val);
  };
  return stringify(value);
}

export default function useEntityListSorted(entityName, criterios = {}, options = {}) {
  const { getFiltroContexto } = useContextoVisual();
  const {
    sortField = undefined,
    sortDirection = undefined,
    limit = undefined,
    campo = "empresa_id",
    page = 1,
    pageSize = 100,
  } = options || {};

  const filtroContextOutside = getFiltroContexto(campo, true);

  // Best default sort: last user choice -> per-entity default -> updated_date desc
  const DEFAULT_SORTS = {
    Produto: { field: 'descricao', direction: 'asc' },
    Cliente: { field: 'nome', direction: 'asc' },
    Fornecedor: { field: 'nome', direction: 'asc' },
    Pedido: { field: 'data_pedido', direction: 'desc' },
    ContaPagar: { field: 'data_vencimento', direction: 'asc' },
    ContaReceber: { field: 'data_vencimento', direction: 'asc' },
    OrdemCompra: { field: 'data_solicitacao', direction: 'desc' },
    CentroCusto: { field: 'codigo', direction: 'asc' },
    PlanoDeContas: { field: 'codigo', direction: 'asc' },
    PlanoContas: { field: 'codigo', direction: 'asc' },
    User: { field: 'full_name', direction: 'asc' }
  };

  let finalSortField = sortField;
  let finalSortDirection = sortDirection;
  if (!finalSortField || !finalSortDirection) {
    try {
      const last = JSON.parse(localStorage.getItem(`sort_${entityName}`) || 'null');
      const sf = last?.sortField ?? last?.field;
      const sd = last?.sortDirection ?? last?.direction;
      if (sf && sd) {
        finalSortField = sf;
        finalSortDirection = sd;
      }
    } catch (_) {}
    if (!finalSortField || !finalSortDirection) {
      finalSortField = DEFAULT_SORTS[entityName]?.field || 'updated_date';
      finalSortDirection = DEFAULT_SORTS[entityName]?.direction || 'desc';
    }
  }

  // Decide filtro final sem "estreitar" o $or vindo do caller (evita AND indevido)
  const hasOr = !!(criterios && criterios.$or && Array.isArray(criterios.$or) && criterios.$or.length);
  const hasCtxInCriterios = Boolean(
    (criterios && (criterios.group_id || criterios[campo])) || hasOr
  );
  const filtroFinal = hasCtxInCriterios ? { ...criterios } : { ...criterios, ...filtroContextOutside };
  const enabledFlag = Boolean(
    (filtroFinal && (filtroFinal.group_id || filtroFinal[campo] || filtroFinal.$or)) ||
    (filtroContextOutside && (filtroContextOutside.group_id || filtroContextOutside[campo]))
  );

  return useQuery({
    queryKey: ["entityListSorted", entityName, stableStringify(filtroFinal || {}), finalSortField, finalSortDirection, limit, page, pageSize],
    queryFn: async () => {
      const filtro = filtroFinal;
      // Permitir listagem mesmo sem contexto explícito (limite e ordenação controlados no backend)

      const key = stableStringify({ entityName, filtro, finalSortField, finalSortDirection, limit: (typeof limit === 'number' && limit > 0) ? limit : pageSize, skip: (typeof page === 'number' && typeof pageSize === 'number') ? Math.max(0, (Math.max(1, page) - 1) * pageSize) : undefined });
      if (__elsInflight.has(key)) {
        return __elsInflight.get(key);
      }

      const exec = async () => {
        // Serialize per-entity to prevent concurrent bursts across different keys
        if (__elsEntityBusy.get(entityName) === true) {
          const startWait = Date.now();
          while (__elsEntityBusy.get(entityName) === true && Date.now() - startWait < 1500) {
            await new Promise(r => setTimeout(r, 80));
          }
        }
        __elsEntityBusy.set(entityName, true);
        // Throttle per-entity to prevent burst
        const now = Date.now();
        const last = __elsLastCallAt.get(entityName) || 0;
        const since = now - last;
        const minGap = 700; // ms throttle between calls per entity
        const cooldown = __elsCooldownUntil.get(entityName) || 0;
        const waitMs = Math.max(0, cooldown - now, since < minGap ? (minGap - since) : 0);
        if (waitMs > 0) {
          await new Promise(r => setTimeout(r, waitMs));
        }
        let attempt = 0;
        while (true) {
          try {
            const res = await base44.functions.invoke("entityListSorted", {
              entityName,
              filter: filtro,
              sortField: finalSortField,
              sortDirection: finalSortDirection,
              limit: (typeof limit === 'number' && limit > 0) ? limit : pageSize,
              skip: (typeof page === 'number' && typeof pageSize === 'number') ? Math.max(0, (Math.max(1, page) - 1) * pageSize) : undefined,
            });
            const out = Array.isArray(res?.data) ? res.data : [];
            __elsCache.set(key, out);
            __elsLastCallAt.set(entityName, Date.now());
            return out;
          } catch (err) {
            const status = err?.response?.status || err?.status;
            if (status === 429) {
              const strikes = (__elsStrikeCount.get(entityName) || 0) + 1;
              __elsStrikeCount.set(entityName, strikes);
              if (attempt < 5) {
                const base = 800; // ms
                const jitter = Math.floor(Math.random() * 300);
                const sleep = base * (attempt + 1) + jitter;
                __elsCooldownUntil.set(entityName, Date.now() + Math.max(1200, sleep));
                await new Promise(r => setTimeout(r, sleep));
                attempt++;
                continue;
              }
              // Circuit breaker: após várias tentativas em curto intervalo, serve cache e entra em cooldown
              if (__elsCache.has(key)) {
                __elsCooldownUntil.set(entityName, Date.now() + 3000);
                return __elsCache.get(key);
              }
            }
            // Fallback a cache se existir (evita travar UI)
            if (__elsCache.has(key)) {
              return __elsCache.get(key);
            }
            throw err;
          }
        }
      };

      const p = exec().finally(() => { __elsInflight.delete(key); __elsEntityBusy.set(entityName, false); });
      __elsInflight.set(key, p);
      return p;
    },
    staleTime: 120_000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    enabled: enabledFlag,
  });
}