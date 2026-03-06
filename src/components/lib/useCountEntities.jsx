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
  const { data: count = 0, isLoading, error, refetch } = useQuery({
    queryKey: [entityName, 'count', JSON.stringify(filter), empresaAtual?.id || null, grupoAtual?.id || null],
    queryFn: async () => {
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
          return response.data.count;
        }

        // Fallback: contagem local com limite
        console.warn(`Função countEntities falhou para ${entityName}, usando fallback`);
        const allData = await base44.entities[entityName].filter(filter, undefined, 5000);
        return allData.length;
      } catch (err) {
        console.error(`Erro ao contar ${entityName}:`, err);
        
        // Último fallback
        try {
          const allData = await base44.entities[entityName].filter(filter, undefined, 1000);
          return allData.length;
        } catch (fallbackErr) {
          console.error(`Fallback final falhou para ${entityName}:`, fallbackErr);
          return 0;
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