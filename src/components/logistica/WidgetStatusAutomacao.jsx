import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, CheckCircle2, Activity } from 'lucide-react';

/**
 * ETAPA 3: Widget Status Automação
 * Mostra status das automações ativas
 */

export default function WidgetStatusAutomacao() {
  const automacoes = [
    {
      nome: 'Baixa Estoque',
      descricao: 'Ao confirmar entrega',
      status: 'ativo',
      execucoes: 'Tempo real'
    },
    {
      nome: 'Custo Frete',
      descricao: 'ContaPagar automática',
      status: 'ativo',
      execucoes: 'Tempo real'
    },
    {
      nome: 'Notificação Cliente',
      descricao: 'Email/WhatsApp contextuais',
      status: 'ativo',
      execucoes: 'Tempo real'
    },
    {
      nome: 'Logística Reversa',
      descricao: 'Entrada + Bloqueio financeiro',
      status: 'ativo',
      execucoes: 'Sob demanda'
    },
    {
      nome: 'Real-time Push',
      descricao: 'WebSocket <1s',
      status: 'ativo',
      execucoes: 'Contínuo'
    }
  ];

  return (
    <Card className="w-full border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="w-5 h-5 text-green-600" />
          Automações Ativas
        </CardTitle>
        <p className="text-xs text-slate-600">ETAPA 3 • Tempo Real</p>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {automacoes.map((auto, idx) => (
          <div key={idx} className="flex items-start gap-2 p-2 bg-white rounded border">
            <Activity className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0 animate-pulse" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-sm text-slate-900">{auto.nome}</p>
                <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0" />
              </div>
              <p className="text-xs text-slate-600">{auto.descricao}</p>
              <p className="text-xs text-green-700 font-medium mt-0.5">{auto.execucoes}</p>
            </div>
          </div>
        ))}

        <div className="pt-2 border-t">
          <Badge className="bg-green-600 w-full justify-center">
            ✓ 5/5 Automações Ativas
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}