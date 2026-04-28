import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TOGGLE_MAP_DATA } from './toggleMapData';

const statusColors = {
  conectado: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  parcial: 'bg-amber-100 text-amber-700 border-amber-200',
  pendente: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function AdminControlCoverageCard() {
  const groups = TOGGLE_MAP_DATA.reduce((acc, item) => {
    const key = item.categoria || 'Outros';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Mapa chave → função real</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group} className="space-y-2">
            <div className="text-sm font-semibold text-slate-900">{group}</div>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.chave} className="rounded-lg border p-3 bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium text-slate-900">{item.chave}</div>
                      <div className="text-xs text-slate-500">{item.tela}</div>
                    </div>
                    <Badge className={statusColors[item.status] || statusColors.pendente}>{item.status || 'pendente'}</Badge>
                  </div>
                  <div className="mt-2 text-xs text-slate-600">{item.efeito}</div>
                  <div className="mt-1 text-xs text-slate-500">Função real: {item.funcao}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}