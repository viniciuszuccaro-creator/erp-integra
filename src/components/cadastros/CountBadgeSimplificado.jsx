/**
 * CountBadgeSimplificado — Badge de contagem usando useEntityCounts (V5)
 * ✅ Usa asServiceRole diretamente (sem wrapper, sem functions.invoke)
 * ✅ Batch automático + cache 2min
 * ✅ Real-time via subscribe
 */
import React from "react";
import { Badge } from "@/components/ui/badge";
import useEntityCounts from "@/components/lib/useEntityCounts.js";

export default function CountBadgeSimplificado({ entities = [] }) {
  const list = Array.isArray(entities) ? entities : [entities];
  const { total, isLoading } = useEntityCounts(list.filter(Boolean));

  if (!list.length) return null;

  return (
    <Badge
      variant="outline"
      className="ml-1 rounded-sm bg-slate-100 text-slate-700 border-slate-300 text-xs font-semibold tabular-nums"
    >
      {isLoading ? <span className="animate-pulse">···</span> : total.toLocaleString('pt-BR')}
    </Badge>
  );
}