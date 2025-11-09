import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { TrendingUp, DollarSign, Clock, Target, Download } from "lucide-react";

/**
 * V21.2 - Relatórios de Produção
 * COM: Eficiência, OEE, Custo Real vs Orçado
 */
export default function RelatoriosProducao({ empresaId }) {
  const [periodo, setPeriodo] = useState('30dias');

  const { data: ops = [] } = useQuery({
    queryKey: ['ops-relatorios', empresaId, periodo],
    queryFn: async () => {
      const todasOps = await base44.entities.OrdemProducao.filter({
        empresa_id: empresaId,
        status: 'Finalizada'
      }, '-data_conclusao_real', 100);

      const diasFiltro = periodo === '7dias' ? 7 : periodo === '30dias' ? 30 : 90;
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - diasFiltro);

      return todasOps.filter(op => 
        op.data_conclusao_real && new Date(op.data_conclusao_real) >= dataLimite
      );
    }
  });

  // Análise de Eficiência
  const analisarEficiencia = () => {
    const opsComTempo = ops.filter(op => op.tempo_real_horas && op.tempo_estimado_horas);
    const eficienciaMedia = opsComTempo.length > 0
      ? opsComTempo.reduce((sum, op) => sum + (op.eficiencia_percentual || 0), 0) / opsComTempo.length
      : 0;

    const opsNoPrazo = ops.filter(op => !op.dias_atraso || op.dias_atraso <= 0).length;
    const percentualNoPrazo = ops.length > 0 ? (opsNoPrazo / ops.length) * 100 : 0;

    return {
      eficienciaMedia,
      percentualNoPrazo,
      totalOPs: ops.length,
      opsNoPrazo
    };
  };

  // Análise OEE
  const analisarOEE = () => {
    const opsComOEE = ops.filter(op => op.oee_calculado?.oee_total);
    
    if (opsComOEE.length === 0) return null;

    const oeeMedia = opsComOEE.reduce((sum, op) => 
      sum + op.oee_calculado.oee_total, 0
    ) / opsComOEE.length;

    const disponibilidadeMedia = opsComOEE.reduce((sum, op) => 
      sum + op.oee_calculado.disponibilidade, 0
    ) / opsComOEE.length;

    const performanceMedia = opsComOEE.reduce((sum, op) => 
      sum + op.oee_calculado.performance, 0
    ) / opsComOEE.length;

    const qualidadeMedia = opsComOEE.reduce((sum, op) => 
      sum + op.oee_calculado.qualidade, 0
    ) / opsComOEE.length;

    return {
      oeeMedia,
      disponibilidadeMedia,
      performanceMedia,
      qualidadeMedia,
      totalAmostras: opsComOEE.length
    };
  };

  // Custo Real vs Orçado
  const analisarCustos = () => {
    const opsComCusto = ops.filter(op => 
      op.custos_reais?.total && op.custos_previstos?.total
    );

    const custoRealTotal = opsComCusto.reduce((sum, op) => sum + op.custos_reais.total, 0);
    const custoOrçadoTotal = opsComCusto.reduce((sum, op) => sum + op.custos_previstos.total, 0);
    const variacaoTotal = custoRealTotal - custoOrçadoTotal;
    const variacaoPercentual = custoOrçadoTotal > 0 
      ? (variacaoTotal / custoOrçadoTotal) * 100 
      : 0;

    return {
      custoRealTotal,
      custoOrçadoTotal,
      variacaoTotal,
      variacaoPercentual
    };
  };

  const eficiencia = analisarEficiencia();
  const oee = analisarOEE();
  const custos = analisarCustos();

  // Dados para gráfico de tendência
  const dadosTendencia = ops.slice(0, 10).reverse().map(op => ({
    op: op.numero_op.substring(0, 10),
    eficiencia: op.eficiencia_percentual || 0,
    oee: op.oee_calculado?.oee_total || 0,
    refugo: op.perda_percentual_real || 0
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-blue-300 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-blue-900">Relatórios de Produção</h2>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="p-2 border rounded-lg bg-white"
            >
              <option value="7dias">Últimos 7 dias</option>
              <option value="30dias">Últimos 30 dias</option>
              <option value="90dias">Últimos 90 dias</option>
            </select>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-lg border-2 border-green-200">
              <Target className="w-5 h-5 text-green-600 mb-2" />
              <p className="text-xs text-green-700 mb-1">Eficiência Média</p>
              <p className="text-3xl font-bold text-green-600">
                {eficiencia.eficienciaMedia.toFixed(1)}%
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border-2 border-blue-200">
              <Clock className="w-5 h-5 text-blue-600 mb-2" />
              <p className="text-xs text-blue-700 mb-1">No Prazo</p>
              <p className="text-3xl font-bold text-blue-600">
                {eficiencia.percentualNoPrazo.toFixed(0)}%
              </p>
            </div>

            {oee && (
              <div className="p-4 bg-white rounded-lg border-2 border-purple-200">
                <TrendingUp className="w-5 h-5 text-purple-600 mb-2" />
                <p className="text-xs text-purple-700 mb-1">OEE Médio</p>
                <p className="text-3xl font-bold text-purple-600">
                  {oee.oeeMedia.toFixed(1)}%
                </p>
              </div>
            )}

            <div className="p-4 bg-white rounded-lg border-2 border-orange-200">
              <DollarSign className="w-5 h-5 text-orange-600 mb-2" />
              <p className="text-xs text-orange-700 mb-1">Variação Custo</p>
              <p className={`text-3xl font-bold ${
                custos.variacaoPercentual > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {custos.variacaoPercentual > 0 ? '+' : ''}{custos.variacaoPercentual.toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tendencia">
        <TabsList>
          <TabsTrigger value="tendencia">Tendência</TabsTrigger>
          <TabsTrigger value="oee">OEE Detalhado</TabsTrigger>
          <TabsTrigger value="custos">Custos</TabsTrigger>
        </TabsList>

        <TabsContent value="tendencia">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tendência de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosTendencia}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="op" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="eficiencia" stroke="#10b981" name="Eficiência %" />
                  <Line type="monotone" dataKey="oee" stroke="#8b5cf6" name="OEE %" />
                  <Line type="monotone" dataKey="refugo" stroke="#ef4444" name="Refugo %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="oee">
          {oee ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">OEE - Overall Equipment Effectiveness</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border">
                    <p className="text-xs text-blue-700 mb-1">Disponibilidade</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {oee.disponibilidadeMedia.toFixed(1)}%
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Tempo produtivo / planejado</p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border">
                    <p className="text-xs text-purple-700 mb-1">Performance</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {oee.performanceMedia.toFixed(1)}%
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Produção real / ideal</p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border">
                    <p className="text-xs text-green-700 mb-1">Qualidade</p>
                    <p className="text-2xl font-bold text-green-600">
                      {oee.qualidadeMedia.toFixed(1)}%
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Peças boas / total</p>
                  </div>
                </div>

                <div className="p-4 bg-purple-100 rounded-lg border-2 border-purple-300">
                  <p className="text-sm text-purple-700 mb-2">OEE Total (Multiplicação)</p>
                  <p className="text-4xl font-bold text-purple-600 text-center">
                    {oee.oeeMedia.toFixed(1)}%
                  </p>
                  <p className="text-xs text-center text-purple-700 mt-2">
                    ({oee.totalAmostras} OPs analisadas)
                  </p>
                </div>

                {oee.oeeMedia < 75 && (
                  <Alert className="border-orange-300 bg-orange-50">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <AlertDescription className="text-sm text-orange-800">
                      <strong>OEE abaixo do ideal (75%):</strong> Revisar processos de setup, manutenção preventiva e treinamento.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-slate-400">
                <p>Nenhuma OP com OEE calculado no período</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="custos">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Análise de Custos (Real vs Orçado)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border">
                  <p className="text-xs text-blue-700 mb-1">Custo Orçado</p>
                  <p className="text-xl font-bold text-blue-600">
                    R$ {custos.custoOrçadoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg border">
                  <p className="text-xs text-orange-700 mb-1">Custo Real</p>
                  <p className="text-xl font-bold text-orange-600">
                    R$ {custos.custoRealTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className={`p-4 rounded-lg border ${
                  custos.variacaoTotal > 0 ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'
                }`}>
                  <p className="text-xs mb-1">Variação</p>
                  <p className={`text-xl font-bold ${
                    custos.variacaoTotal > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {custos.variacaoTotal > 0 ? '+' : ''}R$ {custos.variacaoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs mt-1">
                    ({custos.variacaoPercentual > 0 ? '+' : ''}{custos.variacaoPercentual.toFixed(1)}%)
                  </p>
                </div>
              </div>

              {/* Lista de OPs com maior estouro */}
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-900 mb-2">OPs com Maior Estouro de Custo:</p>
                {ops
                  .filter(op => op.variacao_custo > 0)
                  .sort((a, b) => b.variacao_custo - a.variacao_custo)
                  .slice(0, 5)
                  .map((op, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div>
                        <p className="font-bold text-sm">{op.numero_op}</p>
                        <p className="text-xs text-slate-600">{op.cliente_nome}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">
                          +R$ {op.variacao_custo.toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500">
                          +{((op.variacao_custo / op.custos_previstos?.total) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button className="bg-green-600 hover:bg-green-700">
          <Download className="w-4 h-4 mr-2" />
          Exportar Relatório (Excel)
        </Button>
      </div>
    </div>
  );
}