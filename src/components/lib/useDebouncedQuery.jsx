import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook que debounça queries para evitar múltiplas requisições simultâneas
 * Essencial para evitar rate limit
 */
export function useDebouncedQuery(
  queryKey,
  queryFn,
  searchTerm = '',
  options = {}
) {
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return useQuery({
    queryKey: [...queryKey, debouncedTerm],
    queryFn,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    enabled: options.enabled !== false && debouncedTerm.length >= 0,
    initialData: options.initialData ?? [],
    ...options
  });
}

export default useDebouncedQuery;