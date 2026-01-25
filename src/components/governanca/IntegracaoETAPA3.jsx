import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowRight } from 'lucide-react';

/**
 * ETAPA 3: Painel de Integração
 * Demonstra todas as integrações implementadas
 */

export default function IntegracaoETAPA3() {
  const integracoes = [
    {
      origem: 'Roteirização IA',
      destino: 'Rota Entity',
      descricao: 'Sequência otimizada gravada',
      status: 'Ativo'
    },
    {
      origem: 'Confirmar Entrega',
      destino: 'MovimentacaoEstoque',
      descricao: 'Saída automática de estoque',
      status: 'Ativo'
    },
    {
      origem: 'Confirmar Entrega',
      destino: 'ContaPagar',
      descricao: 'Registro de custo de frete',
      status: 'Ativo'
    },
    {
      origem: 'Mudar Status',
      destino: 'Email Cliente',
      descricao: 'Notificação automática',
      status: 'Ativo'
    },
    {
      origem: 'Logística Reversa',
      destino: 'MovimentacaoEstoque',
      descricao: 'Entrada de devolução',
      status: 'Ativo'
    },
    {
      origem: 'Logística Reversa',
      destino: 'ContaReceber',
      descricao: 'Bloqueio de cobrança',
      status: 'Ativo'
    },
    {
      origem: 'Entrega Entity',
      destino: 'Portal Cliente',
      descricao: 'Real-time via WebSocket',
      status: 'Ativo'
    },
    {
      origem: 'POD Capturado',
      destino: 'Todas Automações',
      descricao: 'Trigger completo',
      status: 'Ativo'
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          Integrações ETAPA 3
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {integracoes.map((int, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 bg-slate-50 rounded border hover:bg-slate-100 transition-colors"
          >
            <div className="flex-1 flex items-center gap-2 text-sm">
              <span className="font-medium text-blue-700">{int.origem}</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="font-medium text-green-700">{int.destino}</span>
            </div>
            <p className="text-xs text-slate-600 hidden md:block">{int.descricao}</p>
            <Badge className="bg-green-600 text-xs">✓</Badge>
          </div>
        ))}

        <div className="mt-4 pt-4 border-t text-center">
          <Badge className="bg-green-600">8/8 Integrações Ativas</Badge>
        </div>
      </CardContent>
    </Card>
  );
}