/**
 * useEntityCounts V5 — contagem robusta multiempresa
 * - SIMPLE_CATALOG: contagem global (sem filtro de contexto)
 * - Entidades contextualizadas: filtro por empresa/grupo
 * - Cache em memória 2min
 * - Invalidação via subscribe
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useMemo, useEffect, useRef } from "react";

const CACHE_TTL = 120_000;
// Cache global fora do componente para persistir entre remontagens
const COUNT_CACHE = new Map();

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
  // Catálogos simples: sem filtro de contexto (globais)
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

  // Adicionar outras empresas do grupo
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

  if (orConds.length === 0) return null; // null = sem contexto, não buscar
  return { $or: orConds };
}

async function countEntityPages(entityName, filter, isSimple) {
  // Simples: asServiceRole (sem filtro); contextualizadas: base44.entities (Layout já injeta empresa/grupo)
  let api;
  if (isSimple) {
    api = base44.asServiceRole?.entities?.[entityName] || base44.entities?.[entityName];
  } else {
    api = base44.entities?.[entityName];
  }
  if (!api?.filter) return 0;
  let total = 0;
  const PAGE = 500;
  for (let p = 0; p < 4; p++) {
    try {
      const res = await api.filter(filter || {}, '-updated_date', PAGE, p * PAGE);
      const count = Array.isArray(res) ? res.length : 0;
      total += count;
      if (count < PAGE) break;
    } catch {
      break;
    }
  }
  return total;
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

  // Entidades simples sempre podem buscar; contextualizadas precisam de empresa ou grupo
  const canFetch = normalized.length > 0 && normalized.some(e => {
    if (SIMPLE_CATALOG.has(e)) return true;
    return !!(groupId || empresaId);
  });

  const { data: counts = {}, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!normalized.length) return {};
      const now = Date.now();
      const merged = {};
      const toFetch = [];

      for (const entityName of normalized) {
        const ck = `${entityName}|${groupId}|${empresaId}|${grupoEmpIdsKey}`;
        const cached = COUNT_CACHE.get(ck);
        if (cached && now - cached.ts < CACHE_TTL) {
          merged[entityName] = cached.count;
        } else {
          toFetch.push(entityName);
        }
      }

      if (toFetch.length === 0) return merged;

      const results = await Promise.allSettled(
        toFetch.map(async (entityName) => {
          const isSimple = SIMPLE_CATALOG.has(entityName);
          // Para entidades contextualizadas sem contexto: retorna 0
          if (!isSimple && !groupId && !empresaId) return { entityName, count: 0 };

          // Para catálogos simples: sem filtro
          // Para contextualizadas: base44.entities (o Layout já injeta empresa/grupo no filter)
          const filter = isSimple ? {} : {}; // Layout já cuida do scope via wrap

          const count = await countEntityPages(entityName, filter, isSimple);
          return { entityName, count };
        })
      );

      const allCounts = { ...merged };
      for (const result of results) {
        if (result.status === 'fulfilled') {
          const { entityName, count } = result.value;
          allCounts[entityName] = count;
          const ck = `${entityName}|${groupId}|${empresaId}|${grupoEmpIdsKey}`;
          COUNT_CACHE.set(ck, { count, ts: Date.now() });
        }
      }
      return allCounts;
    },
    staleTime: CACHE_TTL,
    gcTime: 300_000,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
    enabled: canFetch,
  });

  // Invalidar contagem quando registros mudam
  const entitiesKeyRef = useRef(entitiesKey);
  entitiesKeyRef.current = entitiesKey;
  useEffect(() => {
    if (!normalized.length) return;
    const unsubs = normalized.map(entity => {
      const api = base44.entities?.[entity];
      if (!api?.subscribe) return null;
      return api.subscribe(() => {
        // Limpar cache desta entidade
        for (const [key] of COUNT_CACHE.entries()) {
          if (key.startsWith(`${entity}|`)) COUNT_CACHE.delete(key);
        }
        queryClient.invalidateQueries({ queryKey: ['entityCounts_v5'] });
      });
    }).filter(Boolean);
    return () => { unsubs.forEach(u => { if (typeof u === 'function') u(); }); };
  }, [entitiesKey]); // eslint-disable-line

  const total = useMemo(
    () => normalized.reduce((acc, e) => acc + (Number(counts[e]) || 0), 0),
    [counts, normalized]
  );

  return { counts: counts || {}, total, isLoading };
}

export default useEntityCounts;