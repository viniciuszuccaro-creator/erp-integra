import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * Hook customizado para contagem eficiente de entidades
 * Usa função backend otimizada para grandes volumes (25k+ registros)
 * 
 * @param {string} entityName - Nome da entidade
 * @param {object} filter - Filtro a ser aplicado
 * @param {object} options - Opções adicionais do useQuery
 * @returns {object} { count, isLoading, error, refetch }
 */
export function useCountEntities(entityName, filter = {}, options = {}) {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  // Dedupe + cooldown global para 429
  const key = `${entityName}|${JSON.stringify(filter)}|${empresaAtual?.id || ''}|${grupoAtual?.id || ''}`;
  const win = typeof window !== 'undefined' ? window : {};
  const inflight = win.__countInflight || (win.__countInflight = new Map());
  const cooldown = win.__countCooldown || (win.__countCooldown = new Map());
  const cache = win.__countCache || (win.__countCache = new Map());

  const { data: count = 0, isLoading, error, refetch } = useQuery({
    queryKey: [entityName, 'count', JSON.stringify(filter), empresaAtual?.id || null, grupoAtual?.id || null],
    queryFn: async () => {
      try {
        const cd = cooldown.get(entityName) || 0;
        if (Date.now() < cd && cache.has(key)) return cache.get(key);
        if (inflight.has(key)) return await inflight.get(key);
        const p = (async () => {
          try {
        // Tenta usar a função backend otimizada
        // Filtro de contexto multiempresa obrigatório para contagens estáveis
        const ctxCampoMap = { Fornecedor: 'empresa_dona_id', Transportadora: 'empresa_dona_id', Colaborador: 'empresa_alocada_id' };
        const campoEmpresa = ctxCampoMap[entityName] || 'empresa_id';
        const empresaId = empresaAtual?.id;
        const groupId = grupoAtual?.id;
        let finalFilter = { ...(filter || {}) };
        if (!finalFilter.$or && !finalFilter[campoEmpresa] && !finalFilter.group_id && (empresaId || groupId)) {
          const orConds = [];
          if (empresaId) {
            if (entityName === 'Cliente') {
              orConds.push({ empresa_id: empresaId }, { empresa_dona_id: empresaId }, { empresas_compartilhadas_ids: { $in: [empresaId] } });
            } else if (entityName === 'Fornecedor' || entityName === 'Transportadora') {
              orConds.push({ empresa_dona_id: empresaId }, { empresas_compartilhadas_ids: { $in: [empresaId] } });
            } else if (entityName === 'Colaborador') {
              orConds.push({ empresa_alocada_id: empresaId });
            } else {
              orConds.push({ [campoEmpresa]: empresaId });
            }
          }
          if (groupId) orConds.push({ group_id: groupId });
          if (orConds.length) finalFilter = { ...finalFilter, $or: orConds };
        }

        const response = await base44.functions.invoke('countEntities', {
          entityName,
          filter: finalFilter
        });
        if (response.data?.count !== undefined) {
          cache.set(key, response.data.count);
          try { localStorage.setItem(`count_cache_${key}`, String(response.data.count)); } catch {}
          return response.data.count;
        }

        // Fallback: contagem local com limite
        console.warn(`Função countEntities falhou para ${entityName}, usando fallback`);
        const allData = await base44.entities[entityName].filter(filter, undefined, 5000);
        return allData.length;
          } finally {
            inflight.delete(key);
          }
        })();
        inflight.set(key, p);
        return await p;
      } catch (err) {
        console.error(`Erro ao contar ${entityName}:`, err);
        const status = err?.response?.status || err?.status;
        if (status === 429) {
          cooldown.set(entityName, Date.now() + 3000);
          const cached = cache.get(key) || Number(localStorage.getItem(`count_cache_${key}`) || 0);
          if (cached) return cached;
        }
        // Último fallback leve: tenta apenas pegar alguns itens e estimar
        try {
          const sample = await base44.entities[entityName].filter(filter, undefined, 50);
          const approx = sample.length;
          cache.set(key, approx);
          return approx;
        } catch (fallbackErr) {
          console.error(`Fallback final falhou para ${entityName}:`, fallbackErr);
          return cache.get(key) || 0;
        }
      }
    },
    staleTime: options.staleTime || 120000, // 2 minutos de cache padrão (listas estáveis)
    gcTime: options.gcTime || 120000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    enabled: !!grupoAtual?.id || !!empresaAtual?.id,
    keepPreviousData: true,
    placeholderData: (prev) => prev ?? 0,
    ...options
  });

  return {
    count,
    isLoading,
    error,
    refetch
  };
}

export default useCountEntities;