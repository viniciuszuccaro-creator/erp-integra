import React from "react";
import { Badge } from "@/components/ui/badge";
import useEntityCounts from "@/components/lib/useEntityCounts";

/**
 * CountBadgeSimplificado — badge de contagem para uma ou mais entidades
 * Usa useEntityCounts V5 (asServiceRole + filtro multiempresa correto)
 */
export default function CountBadgeSimplificado({ entities = [], className = "", precomputedTotal, allCounts }) {
  const list = Array.isArray(entities) ? entities.filter(Boolean) : [entities].filter(Boolean);
  // allCounts = mapa global { EntityName: number } passado pelo pai para evitar fetch extra
  const skip = precomputedTotal !== undefined || (allCounts && list.every(e => allCounts[e] !== undefined));
  const { total: fetched, isLoading } = useEntityCounts(skip ? [] : list);
  const total = precomputedTotal !== undefined
    ? precomputedTotal
    : (allCounts && skip ? list.reduce((s, e) => s + (allCounts[e] || 0), 0) : fetched);

  if (!list.length) return null;

  return (
    <Badge
      variant="outline"
      className={`ml-1 rounded-sm bg-slate-100 text-slate-600 border-slate-300 text-xs font-semibold tabular-nums shrink-0 ${className}`}
    >
      {isLoading && total === 0 ? (
        <span className="animate-pulse opacity-60">···</span>
      ) : (
        total.toLocaleString("pt-BR")
      )}
    </Badge>
  );
}