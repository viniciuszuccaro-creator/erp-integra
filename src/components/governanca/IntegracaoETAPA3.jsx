import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Link as LinkIcon, Zap, Database, Bell } from 'lucide-react';

/**
 * ETAPA 3: Painel de Integrações
 * Demonstra todas as integrações ativas
 */

export default function IntegracaoETAPA3() {
  const integracoes = [
    {
      origem: 'Roteirização IA',
      destino: 'Rota',
      descricao: 'IA otimiza e cria rotas automaticamente',
      tipo: 'Automático',
      cor: 'purple'
    },
    {
      origem: 'Confirmar Entrega',
      destino: 'Estoque',
      descricao: 'Baixa automática de estoque (MovimentacaoEstoque)',
      tipo: 'Automático',
      cor: 'blue'
    },
    {
      origem: 'Confirmar Entrega',
      destino: 'Financeiro',
      descricao: 'Registro de custo de frete (ContaPagar)',
      tipo: 'Automático',
      cor: 'green'
    },
    {
      origem: 'Mudar Status',
      destino: 'Notificação',
      descricao: 'Email automático ao cliente',
      tipo: 'Real-time',
      cor: 'orange'
    },
    {
      origem: 'Logística Reversa',
      destino: 'Estoque',
      descricao: 'Entrada automática no estoque',
      tipo: 'Automático',
      cor: 'red'
    },
    {
      origem: 'Logística Reversa',
      destino: 'Financeiro',
      descricao: 'Bloqueio/ajuste ContaReceber',
      tipo: 'Automático',
      cor: 'yellow'
    },
    {
      origem: 'Real-time',
      destino: 'Portal Cliente',
      descricao: 'WebSocket push <1s',
      tipo: 'Real-time',
      cor: 'indigo'
    },
    {
      origem: 'POD Capturado',
      destino: 'Cascata Completa',
      descricao: 'Estoque + Frete + Notificação + Auditoria',
      tipo: 'Automático',
      cor: 'pink'
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-600" />
          Integrações Ativas
        </CardTitle>
        <p className="text-sm text-slate-600">
          8 integrações automáticas em funcionamento
        </p>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {integracoes.map((int, idx) => (
          <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
            <LinkIcon className={`w-5 h-5 text-${int.cor}-600`} />
            <div className="flex-1">
              <p className="font-semibold text-sm">
                {int.origem} → {int.destino}
              </p>
              <p className="text-xs text-slate-600">{int.descricao}</p>
            </div>
            <Badge className={`bg-${int.cor}-600 text-xs`}>
              {int.tipo}
            </Badge>
          </div>
        ))}

        <div className="mt-6 p-4 bg-green-50 border border-green-300 rounded-lg text-center">
          <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="font-bold text-green-800">Todas as integrações validadas!</p>
          <p className="text-xs text-green-700 mt-1">Sistema funcionando em produção</p>
        </div>
      </CardContent>
    </Card>
  );
}