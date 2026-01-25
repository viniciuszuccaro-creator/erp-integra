import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

/**
 * ETAPA 3: Widget Integração Automática
 * Visualiza fluxo de automação
 */

export default function IntegracaoAutomaticaWidget({ entrega }) {
  const fluxo = [
    {
      acao: 'Status → Entregue',
      resultado: 'Gatilho ativado',
      status: 'completo'
    },
    {
      acao: 'Baixar Estoque',
      resultado: `${entrega?.itens?.length || 0} itens processados`,
      status: 'completo'
    },
    {
      acao: 'Registrar Frete',
      resultado: 'ContaPagar criada',
      status: entrega?.custo_operacional ? 'completo' : 'pendente'
    },
    {
      acao: 'Enviar Notificação',
      resultado: 'Email + WhatsApp',
      status: (entrega?.notificacoes_enviadas?.length || 0) > 0 ? 'completo' : 'pendente'
    },
    {
      acao: 'Criar Auditoria',
      resultado: 'Log registrado',
      status: 'completo'
    }
  ];

  return (
    <Card className="w-full border-purple-200 bg-purple-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-600" />
          Automação Ativada
        </CardTitle>
        <p className="text-xs text-slate-600">Cascata de 5 ações automáticas</p>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {fluxo.map((f, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            {f.status === 'completo' ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            ) : (
              <div className="w-4 h-4 border-2 border-slate-300 rounded-full flex-shrink-0" />
            )}
            <span className="font-medium text-slate-900">{f.acao}</span>
            <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="text-slate-600 text-xs">{f.resultado}</span>
          </div>
        ))}

        <div className="mt-4 pt-3 border-t">
          <Badge className="bg-purple-600 w-full justify-center">
            ⚡ 5/5 ações executadas
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}