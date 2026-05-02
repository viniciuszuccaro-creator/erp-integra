import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ADMIN_CONTROL_INVENTORY } from './adminControlInventory';

const statusClass = {
  conectado: 'bg-green-100 text-green-700 border-green-200',
  parcial: 'bg-amber-100 text-amber-700 border-amber-200',
  pendente: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function AdminUnifiedControlMatrixCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Matriz única de controles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.values(ADMIN_CONTROL_INVENTORY).map((grupo) => (
          <div key={grupo.titulo} className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900">{grupo.titulo}</h3>
              <Badge variant="outline">{grupo.itens.length} itens</Badge>
            </div>
            <div className="grid gap-2">
              {grupo.itens.map((item) => (
                <div key={item.id} className="rounded-lg border p-3 bg-white">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge className={statusClass[item.status || 'conectado']}>{item.status || 'conectado'}</Badge>
                    <Badge variant="outline">{item.tipo}</Badge>
                    <span className="text-sm font-medium text-slate-900">{item.label}</span>
                  </div>
                  <div className="grid gap-1 text-xs text-slate-600 md:grid-cols-4">
                    <div><strong>Tela:</strong> {item.tela}</div>
                    <div><strong>Seção:</strong> {item.section}</div>
                    <div><strong>Escopo:</strong> {item.escopo}</div>
                    <div><strong>Chave/Função:</strong> {item.chave || item.funcao || 'n/a'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}