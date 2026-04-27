import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const grupos = [
  { nome: 'Administração do Sistema', status: 'feito' },
  { nome: 'IA', status: 'parcial' },
  { nome: 'Segurança', status: 'feito' },
  { nome: 'Integrações', status: 'parcial' },
  { nome: 'Cadastros', status: 'pendente' },
  { nome: 'Financeiro', status: 'pendente' },
  { nome: 'Comercial', status: 'pendente' },
  { nome: 'Estoque', status: 'pendente' },
  { nome: 'Produção', status: 'pendente' },
  { nome: 'Expedição', status: 'pendente' },
];

const badgeClass = {
  feito: 'bg-green-100 text-green-700 border-green-200',
  parcial: 'bg-blue-100 text-blue-700 border-blue-200',
  pendente: 'bg-amber-100 text-amber-700 border-amber-200',
};

export default function CoberturaFluxosCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cobertura por fluxo</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {grupos.map((grupo) => (
          <div key={grupo.nome} className="rounded-lg border p-3 bg-white flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-slate-800">{grupo.nome}</span>
            <Badge className={badgeClass[grupo.status]}>{grupo.status}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}