import React from "react";
import { Badge } from "@/components/ui/badge";
import useEntityCounts from "@/components/lib/useEntityCounts";

/**
 * CountBadgeSimplificado — Badge de contagem com hook centralizado
 * ✅ Sem queries próprias (usa useEntityCounts)
 * ✅ Batch automático + cache
 * ✅ Real-time instantâneo
 */
export default function CountBadgeSimplificado({ entities = [] }) {
  const { total, isLoading } = useEntityCounts(Array.isArray(entities) ? entities : [entities]);

  if (!entities || entities.length === 0) return null;

  return (
    <Badge
      variant="outline"
      className="ml-2 rounded-sm bg-slate-100 text-slate-700 border-slate-300 text-xs font-semibold"
    >
      {isLoading ? <span className="animate-pulse">•••</span> : total}
    </Badge>
  );
}