import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAdminControlsByModule, getAdminCoverageSummary, getAdminExecutionMatrix } from './adminControlRegistry';
import { getAdminControlStatus } from './adminControlRuntime';

const statusColors = {
  conectado: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  parcial: 'bg-amber-100 text-amber-700 border-amber-200',
  pendente: 'bg-slate-100 text-slate-600 border-slate-200',
  aba: 'bg-blue-100 text-blue-700 border-blue-200',
};

export default function AdminControlCoverageCard() {
  const groups = getAdminControlsByModule();
  const summary = getAdminCoverageSummary();
  const executionMatrix = getAdminExecutionMatrix();

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">Mapa chave → função real</CardTitle>
          <Badge variant="outline">{summary.percentualConectado}% conectado • {summary.percentualMapeado}% mapeado</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="rounded-lg border bg-slate-50 px-3 py-2 text-sm">Total: <strong>{summary.total}</strong></div>
          <div className="rounded-lg border bg-emerald-50 px-3 py-2 text-sm">Conectados: <strong>{summary.conectado}</strong></div>
          <div className="rounded-lg border bg-amber-50 px-3 py-2 text-sm">Parciais: <strong>{summary.parcial}</strong></div>
          <div className="rounded-lg border bg-blue-50 px-3 py-2 text-sm">Abas: <strong>{summary.aba}</strong></div>
          <div className="rounded-lg border bg-slate-50 px-3 py-2 text-sm">Pendentes: <strong>{summary.pendente}</strong></div>
        </div>

        <div className="rounded-xl border bg-slate-50 p-3">
          <div className="text-sm font-semibold text-slate-900">Matriz de execução</div>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {executionMatrix.slice(0, 10).map((item) => (
              <div key={`${item.id}-${item.status_execucao || 'status'}`} className="rounded-lg border bg-white px-3 py-2">
                <div className="text-sm font-medium text-slate-900">{item.label || item.chave || item.id}</div>
                <div className="text-xs text-slate-500">{item.status_execucao}</div>
              </div>
            ))}
          </div>
        </div>

        {Object.entries(groups).map(([group, items]) => (
          <div key={group} className="space-y-2">
            <div className="text-sm font-semibold text-slate-900">{group}</div>
            <div className="space-y-2">
              {items.map((item) => {
                const status = getAdminControlStatus(item);
                return (
                  <div key={`${group}-${item.id || item.chave}-${item.tela || 'sem-tela'}`} className="rounded-lg border p-3 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{item.chave || item.label || item.id}</div>
                        <div className="text-xs text-slate-500">{item.tela} • escopo {item.escopo || 'não definido'}</div>
                      </div>
                      <Badge className={statusColors[status] || statusColors.pendente}>{status}</Badge>
                    </div>
                    <div className="mt-2 text-xs text-slate-600">{item.efeito || item.label || 'Controle inventariado e pronto para conexão.'}</div>
                    <div className="mt-1 text-xs text-slate-500">Função real: {item.funcao || 'dependente do componente/tela'}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}