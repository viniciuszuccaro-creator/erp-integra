import React from "react";
import { Badge } from "@/components/ui/badge";
import useEntityCounts from "@/components/lib/useEntityCounts";

/**
 * CountBadgeSimplificado — badge de contagem para uma ou mais entidades
 * Usa useEntityCounts V5 (asServiceRole + filtro multiempresa correto)
 */
export default function CountBadgeSimplificado({ entities = [], className = "" }) {
  const list = Array.isArray(entities) ? entities.filter(Boolean) : [entities].filter(Boolean);
  const { total, isLoading } = useEntityCounts(list);

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