import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const sevCfg = {
  high: { text: 'Crítico', cls: 'bg-red-100 text-red-700' },
  medium: { text: 'Alto', cls: 'bg-amber-100 text-amber-700' },
  low: { text: 'Médio', cls: 'bg-blue-100 text-blue-700' }
};

export default function AlertsPanel({ entregas = [], rules, onSelectEntrega }) {
  const alerts = React.useMemo(() => {
    const res = [];
    const now = new Date();
    const toDate = (d) => d ? new Date(d) : null;

    // Atraso
    (entregas || []).forEach((e) => {
      const prev = toDate(e.data_previsao);
      if (prev && e.status !== 'Entregue' && prev < now) {
        const diffH = Math.round((now - prev) / 36e5);
        if (diffH >= (rules?.minAtrasoHoras ?? 1)) {
          res.push({
            id: `late-${e.id}`,
            sev: diffH > 6 ? 'high' : 'medium',
            title: `Atraso: ${e.cliente_nome}`,
            desc: `${diffH}h de atraso • Status: ${e.status}`,
            entrega: e,
          });
        }
      }
    });

    // Gargalo por rota (muitos prontos)
    const porRota = (entregas || []).reduce((a, e) => {
      if (e.status === 'Pronto para Expedir') {
        const k = e.rota_id || 'Sem Rota';
        a[k] = (a[k] || 0) + 1;
      }
      return a;
    }, {});
    Object.entries(porRota).forEach(([rota, count]) => {
      const thr = rules?.maxFilaRota ?? 8;
      if (count > thr) {
        res.push({ id: `rota-${rota}`, sev: 'medium', title: `Gargalo na rota ${rota}`, desc: `${count} entregas prontas`, entrega: null });
      }
    });

    // Em trânsito há muito tempo
    (entregas || []).forEach((e) => {
      if (e.status === 'Em Trânsito' || e.status === 'Saiu para Entrega') {
        const saida = toDate(e.data_saida);
        if (saida) {
          const diffH = Math.round((now - saida) / 36e5);
          if (diffH >= (rules?.maxTransitoHoras ?? 6)) {
            res.push({ id: `transito-${e.id}`, sev: 'low', title: `Transporte prolongado`, desc: `${diffH}h em trânsito • ${e.cliente_nome}`, entrega: e });
          }
        }
      }
    });

    // Ocorrências/Frustradas
    (entregas || []).forEach((e) => {
      if (e.status === 'Entrega Frustrada' || (e.entrega_frustrada && e.entrega_frustrada.motivo)) {
        res.push({ id: `frustrada-${e.id}`, sev: 'high', title: `Entrega frustrada`, desc: `${e.entrega_frustrada?.motivo || ''} • ${e.cliente_nome}`, entrega: e });
      }
    });

    return res;
  }, [entregas, rules]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Alertas Proativos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 overflow-auto max-h-[32vh]">
        {alerts.length === 0 && <div className="text-sm text-slate-500">Sem alertas no momento.</div>}
        {alerts.map((a) => (
          <button key={a.id} onClick={() => a.entrega && onSelectEntrega?.(a.entrega)} className="w-full text-left border rounded p-2 hover:bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm truncate">{a.title}</div>
              <Badge className={sevCfg[a.sev].cls}>{sevCfg[a.sev].text}</Badge>
            </div>
            <div className="text-xs text-slate-600 mt-1 truncate">{a.desc}</div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}