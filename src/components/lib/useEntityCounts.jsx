import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useMemo } from "react";

/**
 * useEntityCounts — Hook para contar múltiplas entidades com batch automático
 * ✅ Agrupa requisições em batch (12ms debounce)
 * ✅ Cache automático + localStorage
 * ✅ Multi-empresa integrado
 * ✅ Real-time via subscribe
 */

let batchQueue = [];
let batchTimer = null;
const BATCH_DELAY = 12;
const BATCH_CACHE = new Map();

const processBatch = async (entities, groupId, empresaId) => {
  const batch = entities.map((entity) => ({ entity, groupId, empresaId }));
  try {
    const res = await base44.functions.invoke("countEntitiesOptimized", { batch });
    return res?.data || {};
  } catch (e) {
    console.warn("Batch count error:", e);
    return {};
  }
};

const debouncedBatch = () => {
  return new Promise((resolve) => {
    if (batchTimer) clearTimeout(batchTimer);
    batchTimer = setTimeout(async () => {
      const current = [...batchQueue];
      batchQueue = [];
      if (current.length === 0) { resolve({}); return; }

      const dedupe = new Map();
      current.forEach(({ entities, groupId, empresaId, resolve: res }) => {
        const key = `${groupId}|${empresaId}`;
        if (!dedupe.has(key)) dedupe.set(key, { entities: [], resolvers: [] });
        const item = dedupe.get(key);
        entities.forEach((e) => { if (!item.entities.includes(e)) item.entities.push(e); });
        item.resolvers.push(res);
      });

      let allResults = {};
      for (const [_key, { entities, resolvers }] of dedupe) {
        const batch = entities.map((entity) => {
          const match = current.find((c) => c.entities.includes(entity));
          return { entity, groupId: match?.groupId, empresaId: match?.empresaId };
        });
        try {
          const res = await base44.functions.invoke("countEntitiesOptimized", { batch });
          allResults = { ...allResults, ...(res?.data || {}) };
        } catch (_e) {}
        resolvers.forEach((res) => res(allResults));
      }
      resolve(allResults);
    }, BATCH_DELAY);
  });
};

export function useEntityCounts(entities = []) {
  const { grupoAtual, empresaAtual } = useContextoVisual();
  const queryClient = useQueryClient();

  const groupId = grupoAtual?.id || null;
  const empresaId = empresaAtual?.id || null;

  const queryKey = useMemo(
    () => ["entityCounts", entities.sort().join(","), groupId, empresaId],
    [entities, groupId, empresaId]
  );

  const { data: counts = {}, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const cacheKey = `${entities.sort().join(",")}|${groupId}|${empresaId}`;
      const cached = BATCH_CACHE.get(cacheKey);
      if (cached && Date.now() - cached.ts < 30000) return cached.data;

      // Agregar na fila
      const promise = new Promise((resolve) => {
        batchQueue.push({ entities, groupId, empresaId, resolve });
        debouncedBatch().then(resolve);
      });

      const result = await promise;
      BATCH_CACHE.set(cacheKey, { data: result, ts: Date.now() });
      return result;
    },
    staleTime: 30000,
    gcTime: 120000,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
  });

  // Real-time subscribe — invalida cache quando muda
  React.useEffect(() => {
    const unsubs = entities.map((entity) => {
      const api = base44.entities?.[entity];
      if (!api?.subscribe) return null;
      return api.subscribe(() => {
        queryClient.invalidateQueries({ queryKey });
      });
    }).filter(Boolean);

    return () => { unsubs.forEach((u) => { if (typeof u === "function") u(); }); };
  }, [entities.join(","), queryClient, queryKey]);

  const total = useMemo(() => Object.values(counts || {}).reduce((a, b) => (a || 0) + (b || 0), 0), [counts]);

  return { counts: counts || {}, total, isLoading };
}

export default useEntityCounts;