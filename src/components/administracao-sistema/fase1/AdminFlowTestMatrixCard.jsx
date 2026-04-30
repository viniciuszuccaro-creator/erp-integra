import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const FLOW_GROUPS = [
  { nome: 'Administração do Sistema', status: 'coberto' },
  { nome: 'IA', status: 'coberto' },
  { nome: 'Segurança', status: 'coberto' },
  { nome: 'Integrações', status: 'coberto' },
  { nome: 'Cadastros', status: 'pendente' },
  { nome: 'Financeiro', status: 'pendente' },
  { nome: 'Comercial', status: 'pendente' },
  { nome: 'Estoque', status: 'pendente' },
  { nome: 'Produção', status: 'pendente' },
  { nome: 'Expedição', status: 'pendente' },
];

const STATUS_BADGE = {
  coberto: 'bg-green-100 text-green-700',
  parcial: 'bg-amber-100 text-amber-700',
  pendente: 'bg-slate-100 text-slate-700',
};

export default function AdminFlowTestMatrixCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Matriz de testes por fluxo</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {FLOW_GROUPS.map((item) => (
          <div key={item.nome} className="rounded-xl border p-3 flex items-center justify-between gap-3">
            <div className="text-sm font-medium text-slate-800">{item.nome}</div>
            <Badge className={STATUS_BADGE[item.status]}>{item.status}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}