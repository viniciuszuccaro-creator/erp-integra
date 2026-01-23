import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

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
  const { data: count = 0, isLoading, error, refetch } = useQuery({
    queryKey: [entityName, 'count', JSON.stringify(filter)],
    queryFn: async () => {
      try {
        // Tenta usar a função backend otimizada
        const response = await base44.functions.invoke('countEntities', {
          entityName,
          filter
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
    staleTime: options.staleTime || 60000, // 1 minuto de cache padrão
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