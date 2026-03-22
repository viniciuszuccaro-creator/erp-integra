import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import useEntityCounts from "@/components/lib/useEntityCounts";

/**
 * GroupCountBadge — badge de contagem para grupos de entidades (soma total)
 * Ideal para o header de cada bloco de Cadastros
 */
export default function GroupCountBadge({ entities = [], badgeClassName = "", colorClass = "bg-blue-50 text-blue-700 border-blue-200" }) {
  const list = Array.isArray(entities) ? entities.filter(Boolean) : [];
  const { total, isLoading } = useEntityCounts(list);

  return (
    <Badge
      variant="outline"
      className={cn("text-xs rounded-sm tabular-nums shrink-0 font-semibold", colorClass, badgeClassName)}
    >
      {isLoading && total === 0 ? (
        <span className="animate-pulse opacity-60">···</span>
      ) : (
        total.toLocaleString("pt-BR")
      )}
    </Badge>
  );
}