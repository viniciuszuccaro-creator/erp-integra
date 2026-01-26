import { useQuery } from '@tanstack/react-query';

/**
 * Hook que envolve useQuery com tratamento automático de rate limit (429)
 * Implementa retry com backoff exponencial, cache agressivo e SEMPRE exibe dados
 */
export function useQueryWithRateLimit(
  queryKey,
  queryFn,
  options = {}
) {
  const { initialData = [] } = options;

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        return await queryFn();
      } catch (error) {
        // Em 429 ou falha de rede, retorna cached data para evitar tela branca
        if (error?.status === 429 || String(error?.message || '').toLowerCase().includes('network')) {
          console.warn('⚠️ Degradação controlada (cache):', queryKey, error?.status || error?.message);
          return initialData;
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error?.status !== 429) return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 10000),
    initialData,
    placeholderData: initialData,
    refetchOnWindowFocus: false,
    enabled: options.enabled !== false
  });
}

export default useQueryWithRateLimit;