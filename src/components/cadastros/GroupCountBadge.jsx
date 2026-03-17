import React from "react";
import { Badge } from "@/components/ui/badge";
import { useCountEntities } from "@/components/lib/useCountEntities";

// Soma totals de várias entidades respeitando multiempresa (usa useCountEntities de cada)
export default function GroupCountBadge({ entities = [] }) {
  const counts = entities.map((e) => useCountEntities(e, {}, { staleTime: 60000 })).map((r) => r.count || 0);
  const total = counts.reduce((a, b) => a + (Number(b) || 0), 0);
  return (
    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{total}</Badge>
  );
}