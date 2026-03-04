import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const ALL_STATUSES = [
  'Aguardando Separação', 'Em Separação', 'Pronto para Expedir', 'Saiu para Entrega', 'Em Trânsito', 'Entregue', 'Entrega Frustrada'
];

export default function ControlsBar({ filters, setFilters, rules, onSaveRules, loadingRules }) {
  const [open, setOpen] = React.useState(false);
  const [local, setLocal] = React.useState(rules || {});

  React.useEffect(() => setLocal(rules || {}), [rules]);

  const toggleStatus = (s) => {
    const curr = new Set(filters.statuses || []);
    if (curr.has(s)) curr.delete(s); else curr.add(s);
    setFilters({ ...filters, statuses: Array.from(curr) });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input placeholder="Buscar cliente, pedido..." value={filters.q || ''} onChange={(e) => setFilters({ ...filters, q: e.target.value })} className="w-[220px]" />
      <div className="flex flex-wrap gap-1">
        {ALL_STATUSES.map((s) => (
          <button key={s} onClick={() => toggleStatus(s)} className={`text-xs px-2 py-1 rounded border ${filters.statuses?.includes(s) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 hover:bg-slate-50'}`}>{s}</button>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Badge variant="outline" className="text-xs">Regras: atraso≥{local.minAtrasoHoras ?? 1}h • filaRota>{local.maxFilaRota ?? 8} • trânsito≥{local.maxTransitoHoras ?? 6}h</Badge>
        <Button variant="outline" onClick={() => setOpen(true)}>Configurar Regras</Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <div className="space-y-3">
            <div>
              <label className="text-sm">Atraso mínimo (horas)</label>
              <Input type="number" value={local.minAtrasoHoras ?? 1} onChange={(e) => setLocal({ ...local, minAtrasoHoras: Number(e.target.value)||1 })} />
            </div>
            <div>
              <label className="text-sm">Máx. fila por rota</label>
              <Input type="number" value={local.maxFilaRota ?? 8} onChange={(e) => setLocal({ ...local, maxFilaRota: Number(e.target.value)||8 })} />
            </div>
            <div>
              <label className="text-sm">Máx. horas em trânsito</label>
              <Input type="number" value={local.maxTransitoHoras ?? 6} onChange={(e) => setLocal({ ...local, maxTransitoHoras: Number(e.target.value)||6 })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={() => { onSaveRules?.(local); setOpen(false); }} disabled={loadingRules}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}