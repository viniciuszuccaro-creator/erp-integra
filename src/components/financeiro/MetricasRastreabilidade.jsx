import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Shield, CheckCircle, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * V22.0 ETAPA 4 - Métricas de Rastreabilidade
 * Mede o nível de rastreabilidade do sistema financeiro
 */
export default function MetricasRastreabilidade() {
  const { filterInContext } = useContextoVisual();

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['metricas-rastr-receber'],
    queryFn: () => filterInContext('ContaReceber', {}, '-created_date', 200),
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['metricas-rastr-pagar'],
    queryFn: () => filterInContext('ContaPagar', {}, '-created_date', 200),
  });

  // Calcular métricas
  const totalContas = contasReceber.length + contasPagar.length;
  const comDetalhes = [...contasReceber, ...contasPagar].filter(c => c.detalhes_pagamento).length;
  const comEstagios = [...contasReceber, ...contasPagar].filter(c => 
    c.detalhes_pagamento?.data_recebido_caixa
  ).length;
  const compensados = [...contasReceber, ...contasPagar].filter(c => 
    c.detalhes_pagamento?.data_compensado_banco
  ).length;
  const comCanal = [...contasReceber, ...contasPagar].filter(c => c.canal_origem).length;

  const scoreDetalhes = totalContas > 0 ? Math.round((comDetalhes / totalContas) * 100) : 0;
  const scoreEstagios = totalContas > 0 ? Math.round((comEstagios / totalContas) * 100) : 0;
  const scoreCompensacao = comEstagios > 0 ? Math.round((compensados / comEstagios) * 100) : 0;
  const scoreCanal = totalContas > 0 ? Math.round((comCanal / totalContas) * 100) : 0;

  const scoreGeral = Math.round((scoreDetalhes + scoreEstagios + scoreCompensacao + scoreCanal) / 4);

  return (
    <div className="w-full h-full flex flex-col space-y-4 overflow-auto p-4">
      {/* Score Geral */}
      <Card className="border-4 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="p-6 text-center">
          <Shield className="w-16 h-16 text-green-600 mx-auto mb-3" />
          <h3 className="text-3xl font-bold text-slate-900 mb-2">
            Score de Rastreabilidade
          </h3>
          <p className="text-6xl font-bold text-green-600 mb-3">{scoreGeral}%</p>
          <Badge className="bg-green-600 text-white text-lg px-6 py-2">
            {scoreGeral === 100 ? '🏆 Excelente' : scoreGeral >= 80 ? '✅ Muito Bom' : scoreGeral >= 60 ? '⚠️ Bom' : '❌ Precisa Melhorar'}
          </Badge>
        </CardContent>
      </Card>

      {/* Métricas Detalhadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-2 border-blue-300">
          <CardHeader className="bg-blue-50 pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Detalhes Completos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-600">Taxa de Preenchimento</span>
              <span className="text-3xl font-bold text-blue-600">{scoreDetalhes}%</span>
            </div>
            <div className="text-sm text-slate-600 space-y-1">
              <p>✅ {comDetalhes} de {totalContas} com detalhes_pagamento</p>
              <p className="text-xs">Forma, bandeira, taxa, autorização</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-300">
          <CardHeader className="bg-purple-50 pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Estágios de Recebimento
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-600">Taxa de Uso</span>
              <span className="text-3xl font-bold text-purple-600">{scoreEstagios}%</span>
            </div>
            <div className="text-sm text-slate-600 space-y-1">
              <p>✅ {comEstagios} de {totalContas} com data_recebido_caixa</p>
              <p className="text-xs">Primeiro estágio registrado</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-300">
          <CardHeader className="bg-green-50 pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Compensação Bancária
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-600">Taxa de Compensação</span>
              <span className="text-3xl font-bold text-green-600">{scoreCompensacao}%</span>
            </div>
            <div className="text-sm text-slate-600 space-y-1">
              <p>✅ {compensados} de {comEstagios} compensados</p>
              <p className="text-xs">Segundo estágio registrado</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-300">
          <CardHeader className="bg-orange-50 pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-600" />
              Origem Rastreável
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-600">Taxa de Rastreamento</span>
              <span className="text-3xl font-bold text-orange-600">{scoreCanal}%</span>
            </div>
            <div className="text-sm text-slate-600 space-y-1">
              <p>✅ {comCanal} de {totalContas} com canal_origem</p>
              <p className="text-xs">ERP, API, Portal, WhatsApp, etc</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💡 Recomendações para 100%</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-2">
          {scoreDetalhes < 100 && (
            <div className="p-3 border border-blue-300 rounded-lg bg-blue-50">
              <p className="text-sm font-semibold text-blue-900">
                📊 Preencher detalhes_pagamento em liquidações futuras
              </p>
            </div>
          )}
          {scoreEstagios < 100 && (
            <div className="p-3 border border-purple-300 rounded-lg bg-purple-50">
              <p className="text-sm font-semibold text-purple-900">
                📅 Registrar data_recebido_caixa em todos os recebimentos
              </p>
            </div>
          )}
          {scoreCompensacao < 100 && comEstagios > 0 && (
            <div className="p-3 border border-green-300 rounded-lg bg-green-50">
              <p className="text-sm font-semibold text-green-900">
                🏦 Atualizar data_compensado_banco após compensação
              </p>
            </div>
          )}
          {scoreCanal < 100 && (
            <div className="p-3 border border-orange-300 rounded-lg bg-orange-50">
              <p className="text-sm font-semibold text-orange-900">
                🌐 Definir canal_origem em novos lançamentos
              </p>
            </div>
          )}
          {scoreGeral === 100 && (
            <div className="p-4 border-2 border-green-500 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-green-900">
                🎉 Sistema 100% Rastreável!
              </p>
              <p className="text-sm text-green-700 mt-1">
                Todos os lançamentos possuem rastreabilidade completa
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Card>
  );
}