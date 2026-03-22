/**
 * GroupCountBadge V2 — Soma totais de múltiplas entidades via asServiceRole (bypassa wrapper)
 * ✅ Usa useEntityCounts diretamente (sem functions.invoke)
 */
import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import useEntityCounts from "@/components/lib/useEntityCounts.js";

export default function GroupCountBadge({ entities = [], badgeClassName }) {
  const list = Array.isArray(entities) ? entities.filter(Boolean) : [];
  const { total, isLoading } = useEntityCounts(list);

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs rounded-sm tabular-nums shrink-0",
        badgeClassName || "bg-blue-50 text-blue-700 border-blue-200"
      )}
    >
      {isLoading && total === 0 ? '···' : total.toLocaleString('pt-BR')}
    </Badge>
  );
}