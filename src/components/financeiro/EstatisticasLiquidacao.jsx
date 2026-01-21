import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * V22.0 ETAPA 4 - Estatísticas de Liquidação
 * KPIs e métricas de desempenho do processo de liquidação
 */
export default function EstatisticasLiquidacao() {
  const { filterInContext } = useContextoVisual();

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['stats-receber'],
    queryFn: () => filterInContext('ContaReceber', {}, '-created_date', 300),
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['stats-pagar'],
    queryFn: () => filterInContext('ContaPagar', {}, '-created_date', 300),
  });

  // Calcular estatísticas
  const totalLiquidacoes = [...contasReceber, ...contasPagar].filter(c => 
    c.status === 'Recebido' || c.status === 'Pago'
  ).length;

  const comDetalhes = [...contasReceber, ...contasPagar].filter(c => 
    c.detalhes_pagamento && Object.keys(c.detalhes_pagamento).length > 0
  ).length;

  const comEstagios = [...contasReceber, ...contasPagar].filter(c => 
    c.detalhes_pagamento?.data_recebido_caixa
  ).length;

  const compensados = [...contasReceber, ...contasPagar].filter(c => 
    c.detalhes_pagamento?.data_compensado_banco
  ).length;

  const pendentes = [...contasReceber, ...contasPagar].filter(c => 
    c.status === 'Pendente'
  ).length;

  const atrasados = [...contasReceber, ...contasPagar].filter(c => 
    c.status === 'Atrasado' || c.dias_atraso > 0
  ).length;

  const taxaDetalhamento = totalLiquidacoes > 0 ? Math.round((comDetalhes / totalLiquidacoes) * 100) : 0;
  const taxaEstagios = totalLiquidacoes > 0 ? Math.round((comEstagios / totalLiquidacoes) * 100) : 0;
  const taxaCompensacao = comEstagios > 0 ? Math.round((compensados / comEstagios) * 100) : 0;

  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            Total Liquidado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-green-600">{totalLiquidacoes}</p>
          <p className="text-xs text-slate-600 mt-1">Títulos processados</p>
        </CardContent>
      </Card>

      <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Taxa Detalhamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-blue-600">{taxaDetalhamento}%</p>
          <p className="text-xs text-slate-600 mt-1">{comDetalhes} com detalhes completos</p>
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600" />
            Taxa Estágios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-purple-600">{taxaEstagios}%</p>
          <p className="text-xs text-slate-600 mt-1">{comEstagios} com data_recebido_caixa</p>
        </CardContent>
      </Card>

      <Card className="border-2 border-cyan-300 bg-gradient-to-br from-cyan-50 to-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-cyan-600" />
            Taxa Compensação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-cyan-600">{taxaCompensacao}%</p>
          <p className="text-xs text-slate-600 mt-1">{compensados} compensados no banco</p>
        </CardContent>
      </Card>

      <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-600" />
            Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-orange-600">{pendentes}</p>
          <p className="text-xs text-slate-600 mt-1">Aguardando liquidação</p>
        </CardContent>
      </Card>

      <Card className="border-2 border-red-300 bg-gradient-to-br from-red-50 to-pink-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            Atrasados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-red-600">{atrasados}</p>
          <p className="text-xs text-slate-600 mt-1">Requerem atenção</p>
        </CardContent>
      </Card>

      {/* Score Geral */}
      <Card className="md:col-span-2 lg:col-span-3 border-4 border-green-500 bg-gradient-to-br from-green-100 to-emerald-100">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-bold text-slate-900 mb-3">Score de Qualidade Financeira</h3>
          <div className="flex items-center justify-center gap-6">
            <div>
              <p className="text-6xl font-bold text-green-600">
                {Math.round((taxaDetalhamento + taxaEstagios + taxaCompensacao) / 3)}%
              </p>
              <p className="text-sm text-slate-600 mt-2">Índice Geral</p>
            </div>
            <div className="text-left space-y-1 text-sm">
              <p className="text-green-700">✅ Detalhamento: {taxaDetalhamento}%</p>
              <p className="text-purple-700">✅ Estágios: {taxaEstagios}%</p>
              <p className="text-cyan-700">✅ Compensação: {taxaCompensacao}%</p>
            </div>
          </div>
          {Math.round((taxaDetalhamento + taxaEstagios + taxaCompensacao) / 3) === 100 && (
            <Badge className="bg-green-600 text-white text-lg px-6 py-2 mt-4">
              🏆 Sistema 100% Rastreável!
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}