import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Workflow } from 'lucide-react';
import { criticalAutomationMap } from './criticalCompletionData';

const criticalityClass = {
  Crítica: 'bg-red-50 text-red-700 border-red-200',
  Alta: 'bg-amber-50 text-amber-700 border-amber-200'
};

export default function CriticalAutomationMap() {
  return (
    <Card className="h-full w-full border-purple-100 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
          <Workflow className="h-5 w-5 text-purple-600" /> Mapa de automações críticas
        </CardTitle>
        <p className="text-sm text-slate-500">Fluxos automáticos que sustentam pedido, estoque, caixa, fiscal e segurança.</p>
      </CardHeader>
      <CardContent className="grid gap-3 lg:grid-cols-2">
        {criticalAutomationMap.map((item) => (
          <div key={`${item.trigger}-${item.functionName}`} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{item.trigger}</p>
                <p className="mt-1 text-xs text-slate-500">{item.entity}</p>
              </div>
              <Badge variant="outline" className={criticalityClass[item.criticality] || criticalityClass.Alta}>{item.criticality}</Badge>
            </div>
            <div className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-600">{item.functionName}</div>
            <p className="mt-2 text-sm text-slate-600">{item.impact}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}