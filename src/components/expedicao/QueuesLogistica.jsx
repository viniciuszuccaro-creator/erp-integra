import React from "react";
import { Badge } from "@/components/ui/badge";

const lanes = [
  { key: "Aguardando Separação", label: "Aguardando", color: "bg-amber-50" },
  { key: "Em Separação", label: "Separação", color: "bg-blue-50" },
  { key: "Pronto para Expedir", label: "Pronto", color: "bg-emerald-50" },
  { key: "Saiu para Entrega", label: "Saiu", color: "bg-cyan-50" },
  { key: "Em Trânsito", label: "Trânsito", color: "bg-sky-50" },
  { key: "Entrega Frustrada", label: "Frustrada", color: "bg-red-50" },
];

export default function QueuesLogistica({ entregas = [] }) {
  const group = lanes.map(l => ({
    ...l,
    items: entregas.filter(e => (e.status === l.key) || (l.key === "Saiu para Entrega" && e.status === "Saiu para Entrega") || (l.key === "Em Trânsito" && e.status === "Em Trânsito"))
  }));

  return (
    <div className="w-full h-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 p-3 overflow-auto">
      {group.map(l => (
        <div key={l.key} className={`rounded-lg border ${l.color} p-3 min-h-[140px]`}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-slate-700">{l.label}</div>
            <Badge variant="secondary">{l.items.length}</Badge>
          </div>
          <div className="space-y-1 max-h-40 overflow-auto pr-1">
            {l.items.slice(0, 12).map((e) => (
              <div key={e.id} className="text-xs text-slate-700 flex items-center justify-between gap-2">
                <span className="truncate">{e.cliente_nome || e.numero_pedido || e.id}</span>
                <span className="text-slate-500">{e.endereco_entrega_completo?.cidade || "-"}</span>
              </div>
            ))}
            {l.items.length === 0 && (
              <div className="text-xs text-slate-500">Sem itens</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}