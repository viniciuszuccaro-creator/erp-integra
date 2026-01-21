import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, ArrowRight } from 'lucide-react';

/**
 * V22.0 ETAPA 4 - Timeline de Liquidação
 * Visualização visual do processo de liquidação
 */
export default function TimelineLiquidacao({ conta }) {
  const detalhes = conta.detalhes_pagamento || {};
  
  const etapas = [
    {
      nome: 'Lançamento',
      data: conta.data_emissao || conta.created_date,
      concluido: true,
      icone: CheckCircle,
      cor: 'text-blue-600'
    },
    {
      nome: 'Vencimento',
      data: conta.data_vencimento,
      concluido: true,
      icone: Clock,
      cor: 'text-purple-600'
    },
    {
      nome: 'Recebido Caixa',
      data: detalhes.data_recebido_caixa || conta.data_recebimento || conta.data_pagamento,
      concluido: !!(detalhes.data_recebido_caixa || conta.data_recebimento || conta.data_pagamento),
      icone: CheckCircle,
      cor: 'text-green-600'
    },
    {
      nome: 'Compensado Banco',
      data: detalhes.data_compensado_banco,
      concluido: !!detalhes.data_compensado_banco,
      icone: detalhes.data_compensado_banco ? CheckCircle : Clock,
      cor: detalhes.data_compensado_banco ? 'text-cyan-600' : 'text-slate-400'
    }
  ];

  return (
    <Card className="border-2 border-blue-300 bg-blue-50">
      <CardContent className="p-4">
        <h3 className="font-semibold text-slate-900 mb-3">Timeline de Liquidação</h3>
        <div className="flex items-center justify-between">
          {etapas.map((etapa, idx) => {
            const Icone = etapa.icone;
            return (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full ${etapa.concluido ? 'bg-white' : 'bg-slate-100'} border-2 ${etapa.concluido ? 'border-green-500' : 'border-slate-300'} flex items-center justify-center`}>
                    <Icone className={`w-5 h-5 ${etapa.cor}`} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-slate-700">{etapa.nome}</p>
                    {etapa.data && (
                      <p className="text-xs text-slate-500">
                        {new Date(etapa.data).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                    {!etapa.data && etapa.concluido && (
                      <Badge className="bg-slate-400 text-white text-xs mt-1">N/D</Badge>
                    )}
                  </div>
                </div>
                {idx < etapas.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}