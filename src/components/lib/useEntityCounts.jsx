/**
 * useEntityCounts — Hook correto para contar entidades via countEntities backend
 * ✅ Payload correto: { entities: [{entityName, filter}] }
 * ✅ Multiempresa: injeta empresa_id/group_id no filtro
 * ✅ Retorna { counts, total, isLoading }
 * ✅ Real-time via subscribe
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useMemo, useEffect } from "react";

// Cache singleton para evitar chamadas duplicadas
const COUNT_CACHE = new Map();
const CACHE_TTL = 45_000;

// Fila de batching global
let _batchQueue = [];
let _batchTimer = null;

function flushBatch() {
  return new Promise((resolve) => {
    if (_batchTimer) clearTimeout(_batchTimer);
    _batchTimer = setTimeout(async () => {
      const current = [..._batchQueue];
      _batchQueue = [];
      _batchTimer = null;

      if (!current.length) { resolve({}); return; }

      // Dedup entities únicas mantendo groupId/empresaId do primeiro item
      const entitiesMap = new Map();
      current.forEach(({ entityName, groupId, empresaId }) => {
        if (!entitiesMap.has(entityName)) {
          entitiesMap.set(entityName, { groupId, empresaId });
        }
      });

      const entities = [];
      entitiesMap.forEach(({ groupId, empresaId }, entityName => {
        const filter = {};
        if (groupId) filter.group_id = groupId;
        else if (empresaId) filter.empresa_id = empresaId;
        entities.push({ entityName, filter });
      });

      let result = {};
      try {
        const res = await base44.functions.invoke("countEntities", { entities });
        const data = res?.data?.counts || {};
        entitiesMap.forEach((_, entityName) => {
          result[entityName] = data[entityName] ?? 0;
        });
      } catch (_e) {
        // Retorna zeros em caso de erro
        entitiesMap.forEach((_, entityName) => { result[entityName] = 0; });
      }

      // Cachear resultado
      entitiesMap.forEach(({ groupId, empresaId }, entityName) => {
        const ck = `${entityName}|${groupId}|${empresaId}`;
        COUNT_CACHE.set(ck, { count: result[entityName] ?? 0, ts: Date.now() });
      });

      // Resolve todas as promises pendentes da fila com o resultado
      current.forEach(({ resolve: res }) => res(result));
      resolve(result);
    }, 20);
  });
}

export function useEntityCounts(entities = []) {
  const { grupoAtual, empresaAtual } = useContextoVisual();
  const queryClient = useQueryClient();

  const groupId = grupoAtual?.id || null;
  const empresaId = empresaAtual?.id || null;

  const normalized = useMemo(() =>
    (Array.isArray(entities) ? entities : [entities]).filter(Boolean),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entities.join(",")]
  );

  const queryKey = useMemo(
    () => ["entityCounts_v2", normalized.sort().join(","), groupId, empresaId],
    [normalized, groupId, empresaId]
  );

  const { data: counts = {}, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!normalized.length) return {};
      if (!groupId && !empresaId) return {};

      // Verificar cache
      const allCached = normalized.every(entityName => {
        const ck = `${entityName}|${groupId}|${empresaId}`;
        const cached = COUNT_CACHE.get(ck);
        return cached && (Date.now() - cached.ts < CACHE_TTL);
      });
      if (allCached) {
        const result = {};
        normalized.forEach(entityName => {
          const ck = `${entityName}|${groupId}|${empresaId}`;
          result[entityName] = COUNT_CACHE.get(ck)?.count ?? 0;
        });
        return result;
      }

      // Enfileirar no batch
      return new Promise((resolve) => {
        normalized.forEach(entityName => {
          _batchQueue.push({ entityName, groupId, empresaId, resolve });
        });
        flushBatch();
      });
    },
    staleTime: CACHE_TTL,
    gcTime: 180_000,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
    enabled: !!(groupId || empresaId) && normalized.length > 0,
  });

  // Real-time subscribe
  useEffect(() => {
    if (!normalized.length) return;
    const unsubs = normalized.map((entity) => {
      const api = base44.entities?.[entity];
      if (!api?.subscribe) return null;
      return api.subscribe(() => {
        // Invalida cache em memória
        normalized.forEach(e => {
          const ck = `${e}|${groupId}|${empresaId}`;
          COUNT_CACHE.delete(ck);
        });
        queryClient.invalidateQueries({ queryKey });
      });
    }).filter(Boolean);
    return () => { unsubs.forEach((u) => { if (typeof u === "function") u(); }); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalized.join(","), groupId, empresaId, queryClient]);

  const total = useMemo(
    () => Object.values(counts || {}).reduce((a, b) => (a || 0) + (b || 0), 0),
    [counts]
  );

  return { counts: counts || {}, total, isLoading };
}

export default useEntityCounts;