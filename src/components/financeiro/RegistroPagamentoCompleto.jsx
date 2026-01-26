import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, Calendar, TrendingDown } from 'lucide-react';

/**
 * V22.0 ETAPA 4 - Registro Completo de Pagamento
 * Exibe todos os detalhes de um pagamento/recebimento
 */
export default function RegistroPagamentoCompleto({ conta }) {
  const detalhes = conta.detalhes_pagamento || {};
  const ehReceber = !!conta.cliente;

  return (
    <Card className="border-2 border-blue-400">
      <CardHeader className="bg-blue-50 pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          Detalhes Completos do {ehReceber ? 'Recebimento' : 'Pagamento'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {/* Forma de Pagamento */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <span className="text-sm text-slate-600">Forma de Pagamento</span>
          <Badge className="bg-blue-600 text-white">
            {conta.forma_recebimento || conta.forma_pagamento || 'Não definido'}
          </Badge>
        </div>

        {/* Bandeira (se cartão) */}
        {detalhes.bandeira_cartao && (
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-slate-600">Bandeira do Cartão</span>
            <span className="font-semibold text-slate-900">{detalhes.bandeira_cartao}</span>
          </div>
        )}

        {/* Autorização (se cartão) */}
        {detalhes.numero_autorizacao && (
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-slate-600">Nº Autorização</span>
            <span className="font-mono text-sm text-slate-900">{detalhes.numero_autorizacao}</span>
          </div>
        )}

        {/* Valores */}
        <div className="border-t pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Valor Bruto</span>
            <span className="font-bold text-slate-900">
              R$ {(detalhes.valor_bruto || conta.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          
          {detalhes.taxa_operadora > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                Taxa Operadora ({detalhes.taxa_operadora}%)
              </span>
              <span className="font-bold text-red-600">
                - R$ {((detalhes.valor_bruto || conta.valor || 0) * detalhes.taxa_operadora / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm font-bold text-slate-700">Valor Líquido</span>
            <span className="text-xl font-bold text-green-600">
              R$ {(detalhes.valor_liquido || conta.valor_recebido || conta.valor_pago || conta.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Estágios */}
        {detalhes.data_recebido_caixa && (
          <div className="border-t pt-3 space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-slate-700">Estágios de Recebimento</span>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-green-50 rounded">
              <span className="text-sm text-slate-600">Recebido no Caixa</span>
              <span className="text-sm font-semibold text-green-600">
                {new Date(detalhes.data_recebido_caixa).toLocaleDateString('pt-BR')}
              </span>
            </div>
            
            {detalhes.data_compensado_banco ? (
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                <span className="text-sm text-slate-600">Compensado no Banco</span>
                <span className="text-sm font-semibold text-blue-600">
                  {new Date(detalhes.data_compensado_banco).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                <span className="text-sm text-slate-600">Compensação Bancária</span>
                <Badge className="bg-orange-600 text-white">Aguardando</Badge>
              </div>
            )}
          </div>
        )}

        {/* Observações */}
        {detalhes.observacoes && (
          <div className="border-t pt-3">
            <p className="text-xs text-slate-600 mb-1">Observações</p>
            <p className="text-sm text-slate-700 p-2 bg-slate-50 rounded">{detalhes.observacoes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}