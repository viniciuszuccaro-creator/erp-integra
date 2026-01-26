import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

/**
 * useQueryWithRateLimit
 * Wrapper leve sobre useQuery que aplica um "rate limit" simples via staleTime.
 *
 * - Evita refetchs frequentes usando staleTime >= rateLimitMs
 * - Mantém opções do React Query, mas com padrões seguros
 *
 * Exemplo:
 * const { data } = useQueryWithRateLimit({
 *   queryKey: ["produtos"],
 *   queryFn: () => base44.entities.Produto.list(),
 *   rateLimitMs: 5000,
 * });
 */
export default function useQueryWithRateLimit({
  queryKey,
  queryFn,
  rateLimitMs = 5000,
  staleTime,
  refetchOnWindowFocus = false,
  refetchInterval = false,
  enabled = true,
  ...rest
}) {
  const finalStaleTime = useMemo(() => {
    const st = typeof staleTime === "number" ? staleTime : 0;
    return Math.max(st, rateLimitMs);
  }, [staleTime, rateLimitMs]);

  return useQuery({
    queryKey,
    queryFn,
    enabled,
    staleTime: finalStaleTime,
    refetchOnWindowFocus,
    refetchInterval,
    ...rest,
  });
}