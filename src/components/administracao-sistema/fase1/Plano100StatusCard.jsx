import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TOGGLE_MAP_DATA } from './toggleMapData';

export default function Plano100StatusCard() {
  const total = TOGGLE_MAP_DATA.length;
  const conectados = TOGGLE_MAP_DATA.filter((item) => item.status === 'conectado').length;
  const pendentes = total - conectados;
  const percentual = total ? Math.round((conectados / total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3 text-base">
          <span>Plano de fechamento 100%</span>
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">{percentual}% conectado</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <div className="rounded-lg border p-3 bg-white">
          <div className="text-slate-500">Controles mapeados</div>
          <div className="text-2xl font-semibold text-slate-900">{total}</div>
        </div>
        <div className="rounded-lg border p-3 bg-green-50">
          <div className="text-green-700">Já conectados</div>
          <div className="text-2xl font-semibold text-green-800">{conectados}</div>
        </div>
        <div className="rounded-lg border p-3 bg-amber-50">
          <div className="text-amber-700">Pendentes</div>
          <div className="text-2xl font-semibold text-amber-800">{pendentes}</div>
        </div>
      </CardContent>
    </Card>
  );
}