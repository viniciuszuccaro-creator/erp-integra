import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, TrendingUp } from 'lucide-react';

/**
 * V22.0 ETAPA 4 - Widget Estágios de Recebimento
 * Visualização compacta dos estágios: Caixa → Banco
 */
export default function EstagiosRecebimentoWidget({ conta }) {
  const detalhes = conta.detalhes_pagamento || {};
  const recebidoCaixa = !!detalhes.data_recebido_caixa;
  const compensadoBanco = !!detalhes.data_compensado_banco;

  return (
    <div className="flex items-center gap-2">
      {/* Estágio 1: Recebido no Caixa */}
      <div className="flex items-center gap-2">
        {recebidoCaixa ? (
          <CheckCircle className="w-4 h-4 text-green-600" />
        ) : (
          <Clock className="w-4 h-4 text-slate-400" />
        )}
        <div>
          <p className="text-xs font-semibold text-slate-700">Caixa</p>
          {recebidoCaixa && (
            <p className="text-xs text-slate-500">
              {new Date(detalhes.data_recebido_caixa).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
      </div>

      {/* Seta */}
      <TrendingUp className="w-4 h-4 text-slate-400" />

      {/* Estágio 2: Compensado no Banco */}
      <div className="flex items-center gap-2">
        {compensadoBanco ? (
          <CheckCircle className="w-4 h-4 text-blue-600" />
        ) : (
          <Clock className="w-4 h-4 text-slate-400" />
        )}
        <div>
          <p className="text-xs font-semibold text-slate-700">Banco</p>
          {compensadoBanco ? (
            <p className="text-xs text-slate-500">
              {new Date(detalhes.data_compensado_banco).toLocaleDateString('pt-BR')}
            </p>
          ) : (
            <p className="text-xs text-orange-600">Aguardando</p>
          )}
        </div>
      </div>

      {/* Badge de Status */}
      <Badge className={compensadoBanco ? 'bg-blue-600 text-white' : 'bg-orange-600 text-white'}>
        {detalhes.status_compensacao || 'Pendente'}
      </Badge>
    </div>
  );
}