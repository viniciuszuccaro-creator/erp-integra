/**
 * GroupCountBadge — Fase 2
 * Uma única chamada batch para somar totais de múltiplas entidades.
 * Anteriormente fazia N chamadas separadas (uma por entidade).
 */
import React from "react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

function stableKey(obj) {
  try {
    const s = (v) => {
      if (v && typeof v === 'object') {
        if (Array.isArray(v)) return '[' + v.map(s).join(',') + ']';
        return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + s(v[k])).join(',') + '}';
      }
      return JSON.stringify(v);
    };
    return s(obj);
  } catch { return JSON.stringify(obj); }
}

export default function GroupCountBadge({ entities = [] }) {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const empresaId = empresaAtual?.id;
  const groupId = grupoAtual?.id;

  // Uma única chamada batch para todas as entidades
  const { data: total = 0 } = useQuery({
    queryKey: ['GroupCountBadge', entities.join(','), empresaId || null, groupId || null],
    queryFn: async () => {
      if (!empresaId && !groupId) return 0;
      const ctxFilter = groupId ? { group_id: groupId } : { empresa_id: empresaId };
      const batch = entities.map(entityName => ({
        entityName,
        filter: ctxFilter,
        withGroupTotal: false,
      }));
      try {
        const res = await base44.functions.invoke('countEntities', { entities: batch });
        const counts = res?.data?.counts || {};
        return entities.reduce((sum, e) => sum + (Number(counts[e]) || 0), 0);
      } catch (_) { return 0; }
    },
    staleTime: 120_000,
    gcTime: 300_000,
    keepPreviousData: true,
    placeholderData: (prev) => prev ?? 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: !!(empresaId || groupId) && entities.length > 0,
  });

  return (
    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
      {total}
    </Badge>
  );
}