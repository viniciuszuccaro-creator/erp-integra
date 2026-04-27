import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TOGGLE_MAP_DATA } from './toggleMapData';

export default function ToggleMapCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Mapa chave → função real</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {TOGGLE_MAP_DATA.map((item) => (
          <div key={item.chave} className="rounded-lg border p-3 bg-white space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{item.categoria}</Badge>
              <Badge className={item.status === 'conectado' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'}>
                {item.status}
              </Badge>
              <code className="text-xs px-2 py-1 rounded bg-slate-100">{item.chave}</code>
              {item.aliases?.map((alias) => (
                <code key={alias} className="text-xs px-2 py-1 rounded bg-slate-50 border">{alias}</code>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-700">
              <div><strong>Tela:</strong> {item.tela}</div>
              <div><strong>Função real:</strong> {item.funcao}</div>
              <div><strong>Efeito:</strong> {item.efeito}</div>
              <div><strong>Módulo:</strong> {item.modulo} • <strong>Escopo:</strong> {item.escopo}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}