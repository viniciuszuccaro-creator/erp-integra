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
import { useMemo, useEffect, useRef } from "react";

const CACHE_TTL = 60_000;
const COUNT_CACHE = new Map();

// Entidades que não precisam de filtro empresa/grupo
const SIMPLE_CATALOG_ENTITIES = new Set([
  'Banco', 'FormaPagamento', 'TipoDespesa', 'MoedaIndice', 'TipoFrete',
  'UnidadeMedida', 'Departamento', 'Cargo', 'Turno', 'GrupoProduto', 'Marca',
  'SetorAtividade', 'LocalEstoque', 'TabelaFiscal', 'CentroResultado',
  'OperadorCaixa', 'RotaPadrao', 'ModeloDocumento', 'KitProduto', 'CatalogoWeb',
  'Servico', 'CondicaoComercial', 'TabelaPreco', 'PerfilAcesso',
  'ConfiguracaoNFe', 'ConfiguracaoBoletos', 'ConfiguracaoWhatsApp',
  'GatewayPagamento', 'ApiExterna', 'Webhook', 'ChatbotIntent', 'JobAgendado',
  'EventoNotificacao', 'SegmentoCliente', 'RegiaoAtendimento', 'ContatoB2B',
]);

// Fila global para batching — cada item tem resolve/reject próprio
let _batchQueue = [];
let _batchTimer = null;

async function runBatch() {
  const current = [..._batchQueue];
  _batchQueue = [];
  _batchTimer = null;

  if (!current.length) return;

  // Agrupar por (groupId, empresaId) e dedup entityName
  const byKey = new Map(); // key = "groupId|empresaId"
  current.forEach((item) => {
    const key = `${item.groupId || ""}|${item.empresaId || ""}`;
    if (!byKey.has(key)) byKey.set(key, { groupId: item.groupId, empresaId: item.empresaId, entities: new Set(), resolvers: [] });
    byKey.get(key).entities.add(item.entityName);
    byKey.get(key).resolvers.push({ entityName: item.entityName, resolve: item.resolve, reject: item.reject });
  });

  for (const [, ctx] of byKey) {
    const { groupId, empresaId, entities, resolvers } = ctx;
    const entityList = Array.from(entities).map((entityName) => {
      const filter = {};
      // Entidades simples: sem filtro de contexto (sem empresa_id/group_id)
      if (!SIMPLE_CATALOG_ENTITIES.has(entityName)) {
        if (groupId) filter.group_id = groupId;
        else if (empresaId) filter.empresa_id = empresaId;
      }
      return { entityName, filter };
    });

    let resultMap = {};
    try {
      const res = await base44.functions.invoke("countEntities", { entities: entityList });
      resultMap = res?.data?.counts || {};
      // Cachear
      entityList.forEach(({ entityName }) => {
        const ck = `${entityName}|${groupId}|${empresaId}`;
        COUNT_CACHE.set(ck, { count: resultMap[entityName] ?? 0, ts: Date.now() });
      });
    } catch (_e) {
      // fallback zeros
      entityList.forEach(({ entityName }) => { resultMap[entityName] = 0; });
    }

    // Resolver cada promise
    resolvers.forEach(({ entityName, resolve }) => {
      resolve({ [entityName]: resultMap[entityName] ?? 0 });
    });
  }
}

function scheduleBatch() {
  if (_batchTimer) return;
  _batchTimer = setTimeout(runBatch, 30);
}

function enqueue(entityName, groupId, empresaId) {
  // Verificar cache primeiro
  const ck = `${entityName}|${groupId}|${empresaId}`;
  const cached = COUNT_CACHE.get(ck);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return Promise.resolve({ [entityName]: cached.count });
  }

  return new Promise((resolve, reject) => {
    _batchQueue.push({ entityName, groupId, empresaId, resolve, reject });
    scheduleBatch();
  });
}

export function useEntityCounts(entities = []) {
  const { grupoAtual, empresaAtual } = useContextoVisual();
  const queryClient = useQueryClient();

  const groupId = grupoAtual?.id || null;
  const empresaId = empresaAtual?.id || null;

  const entitiesKey = useMemo(
    () => (Array.isArray(entities) ? entities : [entities]).filter(Boolean).sort().join(","),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(entities)]
  );

  const normalized = useMemo(
    () => entitiesKey ? entitiesKey.split(",") : [],
    [entitiesKey]
  );

  const queryKey = useMemo(
    () => ["entityCounts_v3", entitiesKey, groupId, empresaId],
    [entitiesKey, groupId, empresaId]
  );

  const { data: counts = {}, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!normalized.length) return {};
      if (!groupId && !empresaId) return {};

      // Enfileirar todas as entidades e aguardar todas as respostas
      const promises = normalized.map((entityName) => enqueue(entityName, groupId, empresaId));
      const results = await Promise.all(promises);

      // Merge todos os resultados em um único objeto
      const merged = {};
      results.forEach((r) => { Object.assign(merged, r); });
      return merged;
    },
    staleTime: CACHE_TTL,
    gcTime: 300_000,
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
        // Invalida cache em memória para estas entidades
        normalized.forEach((e) => {
          const ck = `${e}|${groupId}|${empresaId}`;
          COUNT_CACHE.delete(ck);
        });
        queryClient.invalidateQueries({ queryKey });
      });
    }).filter(Boolean);
    return () => { unsubs.forEach((u) => { if (typeof u === "function") u(); }); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entitiesKey, groupId, empresaId]);

  const total = useMemo(
    () => normalized.reduce((acc, e) => acc + (counts[e] || 0), 0),
    [counts, normalized]
  );

  return { counts: counts || {}, total, isLoading };
}

export default useEntityCounts;