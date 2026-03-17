/**
 * CountBadgeSimplificado — Badge de contagem para uma ou múltiplas entidades
 * ✅ Usa useEntityCounts centralizado
 * ✅ Não faz queries próprias — apenas lê do hook
 * ✅ Suporta múltiplas entidades (soma automática)
 * ✅ Loading state limpo
 */
import React from "react";
import useEntityCounts from "./hooks/useEntityCounts";

export default function CountBadgeSimplificado({
  entities = [],
  className = "",
}) {
  const normalized = Array.isArray(entities) ? entities : entities ? [entities] : [];
  const { counts, isLoading } = useEntityCounts(normalized);

  if (!normalized.length) return null;

  const total = normalized.reduce((sum, ent) => sum + (counts[ent] || 0), 0);

  return (
    <span
      className={`inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full text-xs font-semibold transition-all
        ${isLoading ? "bg-slate-200 text-slate-400 animate-pulse" : "bg-blue-100 text-blue-700 border border-blue-300"}
        ${className}`}
    >
      {isLoading ? "..." : total.toLocaleString("pt-BR")}
    </span>
  );
}