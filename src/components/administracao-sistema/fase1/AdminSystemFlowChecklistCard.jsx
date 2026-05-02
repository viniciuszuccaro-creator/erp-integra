import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const items = [
  { nome: 'Administração do Sistema', status: '100%', detalhe: 'inventário, mapa, guard, auditoria e feedback visual fechados' },
  { nome: 'IA', status: '100%', detalhe: 'toggles reais e leitura central conectados' },
  { nome: 'Segurança', status: '100%', detalhe: 'MFA, auditoria detalhada e IA de segurança governados' },
  { nome: 'Integrações', status: '100%', detalhe: 'estrutura base, webhooks e testes rápidos ligados aos gates' },
  { nome: 'Cadastros', status: 'próximo', detalhe: 'próxima frente recomendada para cobertura fina por ação' },
  { nome: 'Financeiro', status: 'próximo', detalhe: 'precisa fechar superfície completa de botões e execuções' },
  { nome: 'Comercial', status: 'próximo', detalhe: 'precisa fechar fluxo de ações críticas na UI' },
  { nome: 'Estoque', status: 'próximo', detalhe: 'precisa fechar gating e feedback total dos comandos' },
  { nome: 'Produção', status: 'próximo', detalhe: 'precisa fechar cobertura total da interface operacional' },
  { nome: 'Expedição', status: 'próximo', detalhe: 'precisa fechar ações e status finais na superfície visual' },
];

const badgeClass = {
  '100%': 'bg-green-100 text-green-700 border-green-200',
  proximo: 'bg-blue-100 text-blue-700 border-blue-200',
};

export default function AdminSystemFlowChecklistCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Checklist por fluxo</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.nome} className="rounded-lg border p-3 bg-white space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-slate-900">{item.nome}</span>
              <Badge className={badgeClass[item.status] || badgeClass.proximo}>{item.status}</Badge>
            </div>
            <p className="text-xs text-slate-600">{item.detalhe}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}