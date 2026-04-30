import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ADMIN_CONTROL_CONNECTION_MAP, getConnectionStatusSummary } from './adminControlConnectionMap';

const STATUS_CLASS = {
  conectado: 'bg-green-100 text-green-700',
  parcial: 'bg-amber-100 text-amber-700',
  pendente: 'bg-slate-100 text-slate-700',
};

export default function AdminExecutionConnectionCard() {
  const summary = getConnectionStatusSummary();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa chave → função real</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border p-3"><div className="text-xs text-slate-500">Total</div><div className="text-2xl font-semibold">{summary.total}</div></div>
          <div className="rounded-lg border p-3"><div className="text-xs text-slate-500">Conectados</div><div className="text-2xl font-semibold text-green-700">{summary.conectado}</div></div>
          <div className="rounded-lg border p-3"><div className="text-xs text-slate-500">Parciais</div><div className="text-2xl font-semibold text-amber-700">{summary.parcial}</div></div>
          <div className="rounded-lg border p-3"><div className="text-xs text-slate-500">Pendentes</div><div className="text-2xl font-semibold text-slate-700">{summary.pendente}</div></div>
        </div>

        <div className="space-y-3">
          {ADMIN_CONTROL_CONNECTION_MAP.map((item) => (
            <div key={item.id} className="rounded-xl border p-3 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="font-medium text-slate-900">{item.label}</div>
                <Badge className={STATUS_CLASS[item.status] || STATUS_CLASS.pendente}>{item.status}</Badge>
                <Badge variant="outline">{item.escopo}</Badge>
                <Badge variant="outline">{item.tela}</Badge>
              </div>
              <div className="grid gap-2 md:grid-cols-2 text-sm">
                <div><span className="text-slate-500">Chave:</span> <span className="font-mono">{item.chave}</span></div>
                <div><span className="text-slate-500">Função real:</span> <span className="font-mono">{item.funcao}</span></div>
                <div><span className="text-slate-500">Lida antes de:</span> <span className="font-mono">{item.gateBefore}</span></div>
                <div><span className="text-slate-500">Módulo:</span> {item.modulo} • {item.section}</div>
              </div>
              <div className="text-sm text-slate-600">{item.efeito}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}