import { useQuery } from '@tanstack/react-query';

/**
 * Hook que envolve useQuery com tratamento automático de rate limit (429)
 * Implementa retry com backoff exponencial e cache agressivo
 */
export function useQueryWithRateLimit(
  queryKey,
  queryFn,
  options = {}
) {
  return useQuery({
    ...options,
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000, // 5 min cache agressivo
    gcTime: 10 * 60 * 1000, // 10 min garbage collection
    retry: (failureCount, error) => {
      // Não retry se não for rate limit
      if (error?.status !== 429) return false;
      // Máx 3 tentativas com backoff exponencial
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => {
      // Backoff exponencial: 1s, 2s, 4s
      return Math.min(1000 * Math.pow(2, attemptIndex), 10000);
    },
    // Se falhar, usar initialData ou array vazio
    initialData: options.initialData ?? [],
    enabled: options.enabled !== false
  });
}

export default useQueryWithRateLimit;