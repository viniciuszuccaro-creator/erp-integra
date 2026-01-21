import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, CheckCircle } from 'lucide-react';

/**
 * V22.0 ETAPA 4 - Widget Resumo de Liquidação
 * Card compacto mostrando status de uma liquidação
 */
export default function WidgetResumoLiquidacao({ conta }) {
  const detalhes = conta.detalhes_pagamento || {};
  const ehReceber = !!conta.cliente;

  return (
    <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg ${ehReceber ? 'bg-green-600' : 'bg-red-600'} flex items-center justify-center`}>
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 truncate">{conta.descricao}</p>
            <p className="text-sm text-slate-600">{conta.cliente || conta.fornecedor}</p>
            
            {/* Valor */}
            <div className="flex items-center gap-2 mt-2">
              <Badge className={ehReceber ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
                R$ {(conta.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Badge>
              {detalhes.valor_liquido && detalhes.valor_liquido !== conta.valor && (
                <Badge variant="outline" className="text-xs">
                  Líq: R$ {detalhes.valor_liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Badge>
              )}
            </div>

            {/* Detalhes */}
            {detalhes.forma_pagamento && (
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="outline" className="text-xs">
                  {detalhes.forma_pagamento}
                </Badge>
                {detalhes.bandeira_cartao && (
                  <Badge variant="outline" className="text-xs">
                    {detalhes.bandeira_cartao}
                  </Badge>
                )}
                {detalhes.taxa_operadora > 0 && (
                  <Badge variant="outline" className="text-xs">
                    Taxa: {detalhes.taxa_operadora}%
                  </Badge>
                )}
              </div>
            )}

            {/* Estágios */}
            {detalhes.data_recebido_caixa && (
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-slate-600">
                  Caixa: {new Date(detalhes.data_recebido_caixa).toLocaleDateString('pt-BR')}
                </span>
                {detalhes.data_compensado_banco && (
                  <>
                    <TrendingUp className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-600">
                      Banco: {new Date(detalhes.data_compensado_banco).toLocaleDateString('pt-BR')}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Status */}
            <Badge className={`mt-2 ${
              detalhes.status_compensacao === 'Conciliado' ? 'bg-blue-600 text-white' :
              detalhes.status_compensacao === 'Compensado' ? 'bg-cyan-600 text-white' :
              'bg-orange-600 text-white'
            }`}>
              {detalhes.status_compensacao || conta.status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}