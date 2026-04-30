import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ADMIN_CONTROL_GROUPS } from './adminControlInventory';

export default function InventarioControlesCompletudeCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Inventário completo de controles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {ADMIN_CONTROL_GROUPS.map((grupo) => (
          <div key={grupo.titulo} className="rounded-lg border p-3 bg-white">
            <div className="flex items-center justify-between gap-3 mb-2">
              <h3 className="text-sm font-semibold text-slate-900">{grupo.titulo}</h3>
              <Badge variant="outline">{grupo.itens.length} itens</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {grupo.itens.map((item) => (
                <div key={item.id} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-slate-900">{item.label}</div>
                    <Badge variant="outline">{item.status || (item.funcao ? 'conectado' : item.tipo === 'aba' ? 'aba' : 'parcial')}</Badge>
                  </div>
                  <div>{item.tipo} • {item.tela}</div>
                  <div>{item.modulo} / {item.section}</div>
                  <div className="text-slate-500">Escopo: {item.escopo || 'não definido'}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}