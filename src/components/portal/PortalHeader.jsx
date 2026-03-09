import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function PortalHeader({ cliente, spotlight }) {
  return (
    <Card className="w-full">
      <CardContent className="p-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="text-sm text-muted-foreground">Portal do Cliente</div>
          <div className="text-xl font-semibold truncate">{cliente?.nome_fantasia || cliente?.nome || 'Cliente'}</div>
          <div className="text-xs text-muted-foreground truncate">Empresa: {cliente?.empresa_id || '—'} • Grupo: {cliente?.group_id || '—'}</div>
        </div>
        {spotlight && (
          <div className="mt-3 sm:mt-0 text-xs text-muted-foreground text-right">
            Link seguro ativo • expira em {spotlight.exp_minutes_remaining} min
          </div>
        )}
      </CardContent>
    </Card>
  );
}