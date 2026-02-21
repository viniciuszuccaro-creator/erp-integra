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
        const response = await base44.functions.invoke('countEntities', {
          entityName,
          filter
        });

        // Expansão multiempresa genérica quando houver empresa e/ou grupo
        const hasGroup = !!filter?.group_id;
        const empresaId = filter?.empresa_id || filter?.empresa_dona_id || filter?.empresa_alocada_id;
        if ((entityName === 'Cliente' && filter?.empresa_id) || (hasGroup && empresaId)) {
          const rest = { ...filter };
          if ('empresa_id' in rest) delete rest.empresa_id;
          if ('empresa_dona_id' in rest) delete rest.empresa_dona_id;
          if ('empresa_alocada_id' in rest) delete rest.empresa_alocada_id;
          const groupId = rest.group_id; if (groupId) delete rest.group_id;

          let orConds = [];
          if (entityName === 'Cliente') {
            orConds = [
              { empresa_id: empresaId },
              { empresa_dona_id: empresaId },
              { empresas_compartilhadas_ids: { $in: [empresaId] } },
            ];
          } else if (entityName === 'Fornecedor' || entityName === 'Transportadora') {
            orConds = [
              { empresa_dona_id: empresaId },
              { empresas_compartilhadas_ids: { $in: [empresaId] } },
            ];
          } else if (entityName === 'Colaborador') {
            orConds = [ { empresa_alocada_id: empresaId } ];
          } else {
            // Padrão: usa o campo presente no filtro
            const ctxCampo = filter?.empresa_id ? 'empresa_id' : (filter?.empresa_dona_id ? 'empresa_dona_id' : (filter?.empresa_alocada_id ? 'empresa_alocada_id' : 'empresa_id'));
            orConds = [ { [ctxCampo]: empresaId } ];
          }
          if (groupId) orConds.push({ group_id: groupId });

          const alt = await base44.functions.invoke('countEntities', {
            entityName,
            filter: { ...rest, $or: orConds }
          });
          if (alt.data?.count !== undefined) return alt.data.count;
        }

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