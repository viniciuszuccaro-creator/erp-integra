import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ADMIN_CONTROL_ITEMS } from './adminControlInventory';
import { TOGGLE_MAP_DATA } from './toggleMapData';

const toggleKeys = new Set(TOGGLE_MAP_DATA.map((item) => item.chave));

export default function AdminControlsStatusCard() {
  const total = ADMIN_CONTROL_ITEMS.length;
  const mapeados = ADMIN_CONTROL_ITEMS.filter((item) => item.funcao || toggleKeys.has(item.id)).length;
  const percentual = total ? Math.round((mapeados / total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3 text-base">
          <span>Status dos controles administrativos</span>
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">{percentual}% mapeado</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <div className="rounded-lg border p-3 bg-white">
          <div className="text-slate-500">Controles inventariados</div>
          <div className="text-2xl font-semibold text-slate-900">{total}</div>
        </div>
        <div className="rounded-lg border p-3 bg-emerald-50">
          <div className="text-emerald-700">Mapeados</div>
          <div className="text-2xl font-semibold text-emerald-800">{mapeados}</div>
        </div>
        <div className="rounded-lg border p-3 bg-slate-50">
          <div className="text-slate-600">Fonte única</div>
          <div className="text-sm font-semibold text-slate-900 mt-1">useConfiguracaoSistema</div>
        </div>
      </CardContent>
    </Card>
  );
}