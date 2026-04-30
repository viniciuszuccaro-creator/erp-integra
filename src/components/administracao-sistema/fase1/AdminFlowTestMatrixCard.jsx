import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const FLOW_GROUPS = [
  { nome: 'Administração do Sistema', status: 'coberto', detalhe: 'inventário, guard, auditoria e ações conectadas' },
  { nome: 'IA', status: 'coberto', detalhe: 'toggles e leitura central já ativos' },
  { nome: 'Segurança', status: 'coberto', detalhe: 'MFA, auditoria e IA de segurança governados' },
  { nome: 'Integrações', status: 'coberto', detalhe: 'webhooks, estrutura base e testes rápidos' },
  { nome: 'Cadastros', status: 'parcial', detalhe: 'RBAC e contexto existem, faltam gates finos por ação' },
  { nome: 'Financeiro', status: 'parcial', detalhe: 'funções reais mapeadas, falta cobertura total de UI' },
  { nome: 'Comercial', status: 'parcial', detalhe: 'ações críticas mapeadas, falta fechar 100% dos botões' },
  { nome: 'Estoque', status: 'parcial', detalhe: 'ajustes e movimentos mapeados, falta auditoria de superfície' },
  { nome: 'Produção', status: 'parcial', detalhe: 'otimização ligada ao inventário, falta conexão total da UI' },
  { nome: 'Expedição', status: 'parcial', detalhe: 'entregas e notificações mapeadas, falta fechamento visual total' },
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
          <div key={item.nome} className="rounded-xl border p-3 flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-slate-800">{item.nome}</div>
              <div className="text-xs text-slate-500 mt-1">{item.detalhe}</div>
            </div>
            <Badge className={STATUS_BADGE[item.status]}>{item.status}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}