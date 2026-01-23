import { useState, useEffect } from 'react';

/**
 * Hook para debounce em campos de busca
 * Melhora performance em listagens grandes e reduz re-renders
 * 
 * @param {string} initialValue - Valor inicial
 * @param {number} delay - Delay em ms (padrão: 300ms)
 * @returns {[string, string, function]} [debouncedValue, immediateValue, setValue]
 * 
 * Exemplo:
 * const [searchDebounced, searchImmediate, setSearch] = useSearchDebounce('', 300);
 * 
 * <Input value={searchImmediate} onChange={(e) => setSearch(e.target.value)} />
 * // Use searchDebounced para filtros/queries
 */
export function useSearchDebounce(initialValue = '', delay = 300) {
  const [immediateValue, setImmediateValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(immediateValue);
    }, delay);

    return () => clearTimeout(handler);
  }, [immediateValue, delay]);

  return [debouncedValue, immediateValue, setImmediateValue];
}