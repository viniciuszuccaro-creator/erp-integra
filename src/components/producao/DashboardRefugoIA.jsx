import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  BarChart3,
  PieChart,
  Brain
} from "lucide-react";
import { BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

/**
 * V21.2 - Dashboard de Refugo IA
 * COM: Análise de Causa Raiz, Custo Financeiro, Tendências
 */
export default function DashboardRefugoIA({ empresaId }) {
  const [periodo, setPeriodo] = useState('30dias');

  const { data: ops = [] } = useQuery({
    queryKey: ['ops-refugo', empresaId, periodo],
    queryFn: async () => {
      const todasOps = await base44.entities.OrdemProducao.filter({ 
        empresa_id: empresaId,
        status: { $in: ['Em Corte', 'Em Dobra', 'Finalizada'] }
      }, '-data_emissao', 100);

      // Filtrar por período
      const diasFiltro = periodo === '7dias' ? 7 : periodo === '30dias' ? 30 : 90;
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - diasFiltro);

      return todasOps.filter(op => 
        new Date(op.data_emissao) >= dataLimite
      );
    }
  });

  // Análise de Refugo
  const analisarRefugo = () => {
    const refugoPorBitola = {};
    const refugoPorMotivo = {};
    const refugoPorOperador = {};
    const refugoPorOP = [];
    let custoTotalRefugo = 0;
    let pesoTotalRefugo = 0;

    ops.forEach(op => {
      const refugos = op.refugos || [];
      let refugoOP = 0;

      refugos.forEach(refugo => {
        const pesoKG = refugo.peso_refugado_kg || 0;
        pesoTotalRefugo += pesoKG;
        refugoOP += pesoKG;
        custoTotalRefugo += refugo.custo_perdido || 0;

        // Por bitola
        const bitola = refugo.bitola || 'Desconhecido';
        refugoPorBitola[bitola] = (refugoPorBitola[bitola] || 0) + pesoKG;

        // Por motivo
        const motivo = refugo.motivo || 'Não especificado';
        refugoPorMotivo[motivo] = (refugoPorMotivo[motivo] || 0) + pesoKG;

        // Por operador
        const operador = refugo.operador || 'Desconhecido';
        refugoPorOperador[operador] = (refugoPorOperador[operador] || 0) + pesoKG;
      });

      if (refugoOP > 0) {
        refugoPorOP.push({
          numero_op: op.numero_op,
          refugo_kg: refugoOP,
          percentual: op.perda_percentual_real || 0,
          custo: refugos.reduce((sum, r) => sum + (r.custo_perdido || 0), 0)
        });
      }
    });

    return {
      refugoPorBitola,
      refugoPorMotivo,
      refugoPorOperador,
      refugoPorOP: refugoPorOP.sort((a, b) => b.refugo_kg - a.refugo_kg).slice(0, 10),
      pesoTotalRefugo,
      custoTotalRefugo,
      percentualMedio: ops.length > 0 
        ? ops.reduce((sum, op) => sum + (op.perda_percentual_real || 0), 0) / ops.length 
        : 0
    };
  };

  const analise = analisarRefugo();

  // Dados para gráficos
  const dadosBitola = Object.entries(analise.refugoPorBitola).map(([bitola, kg]) => ({
    name: bitola,
    kg: kg,
    custo: kg * 8 // Aprox R$8/kg
  }));

  const dadosMotivo = Object.entries(analise.refugoPorMotivo).map(([motivo, kg]) => ({
    name: motivo,
    value: kg
  }));

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-orange-300 bg-orange-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <div>
                <h2 className="text-xl font-bold text-orange-900">Dashboard de Refugo IA</h2>
                <p className="text-sm text-orange-700">Análise inteligente de perdas e custos</p>
              </div>
            </div>

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
            <div className="p-4 bg-white rounded-lg border-2 border-orange-200">
              <p className="text-xs text-orange-700 mb-1">Refugo Total</p>
              <p className="text-3xl font-bold text-orange-600">
                {analise.pesoTotalRefugo.toFixed(2)} kg
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border-2 border-red-200">
              <p className="text-xs text-red-700 mb-1">Custo Total</p>
              <p className="text-3xl font-bold text-red-600">
                R$ {analise.custoTotalRefugo.toFixed(2)}
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border-2 border-purple-200">
              <p className="text-xs text-purple-700 mb-1">% Médio</p>
              <p className="text-3xl font-bold text-purple-600">
                {analise.percentualMedio.toFixed(1)}%
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border-2 border-blue-200">
              <p className="text-xs text-blue-700 mb-1">OPs Analisadas</p>
              <p className="text-3xl font-bold text-blue-600">
                {ops.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="bitola">
        <TabsList>
          <TabsTrigger value="bitola">
            <BarChart3 className="w-4 h-4 mr-2" />
            Por Bitola
          </TabsTrigger>
          <TabsTrigger value="motivo">
            <PieChart className="w-4 h-4 mr-2" />
            Por Motivo
          </TabsTrigger>
          <TabsTrigger value="ops">
            <TrendingUp className="w-4 h-4 mr-2" />
            Top 10 OPs
          </TabsTrigger>
          <TabsTrigger value="ia">
            <Brain className="w-4 h-4 mr-2" />
            Análise IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bitola">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Refugo por Bitola</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosBitola}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="kg" fill="#f97316" name="Refugo (kg)" />
                  <Bar dataKey="custo" fill="#ef4444" name="Custo (R$)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="motivo">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Refugo por Motivo (Causa Raiz)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={dadosMotivo}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value.toFixed(1)} kg`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosMotivo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ops">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top 10 OPs com Maior Refugo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analise.refugoPorOP.map((op, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{op.numero_op}</p>
                        <p className="text-xs text-slate-600">
                          {op.refugo_kg.toFixed(2)} kg ({op.percentual.toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">R$ {op.custo.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">custo perdido</p>
                    </div>
                  </div>
                ))}

                {analise.refugoPorOP.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <TrendingDown className="w-16 h-16 mx-auto mb-3" />
                    <p>Sem refugo registrado no período</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ia">
          <Card className="border-2 border-purple-300 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Análise de Causa Raiz (IA)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-blue-300 bg-blue-50">
                <Brain className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-800">
                  <strong>IA detectou os principais problemas:</strong>
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {Object.entries(analise.refugoPorMotivo).length > 0 ? (
                  Object.entries(analise.refugoPorMotivo)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([motivo, kg], idx) => {
                      const percentualTotal = (kg / analise.pesoTotalRefugo) * 100;
                      
                      return (
                        <Card key={idx} className="border-l-4 border-l-orange-500">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-bold text-sm text-slate-900">{motivo}</p>
                                <p className="text-xs text-slate-600 mt-1">
                                  {kg.toFixed(2)} kg ({percentualTotal.toFixed(1)}% do total)
                                </p>
                              </div>
                              
                              {percentualTotal > 30 && (
                                <Badge className="bg-red-600">Crítico</Badge>
                              )}
                            </div>

                            {/* Recomendação IA */}
                            <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
                              <p className="font-semibold mb-1">💡 Recomendação IA:</p>
                              {motivo.includes('Corte') && (
                                <p>Revisar setup da máquina de corte. Considerar treinamento do operador.</p>
                              )}
                              {motivo.includes('Dobra') && (
                                <p>Calibrar dobradeira. Verificar gabarito de dobras.</p>
                              )}
                              {motivo.includes('Desenho') && (
                                <p>Melhorar validação de projetos na entrada. Usar IA de leitura.</p>
                              )}
                              {motivo.includes('Material') && (
                                <p>Implementar inspeção de qualidade no recebimento.</p>
                              )}
                              {!motivo.includes('Corte') && !motivo.includes('Dobra') && !motivo.includes('Desenho') && !motivo.includes('Material') && (
                                <p>Investigar causa raiz específica. Registrar melhor os motivos.</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                    <p>Sem refugo registrado no período</p>
                  </div>
                )}
              </div>

              {/* Meta de Refugo */}
              <Card className="border-2 border-green-300 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-green-900">Meta de Refugo Esperado</p>
                    <Badge className="bg-green-600">Padrão: 3-5%</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Atual:</span>
                      <span className={`font-bold ${
                        analise.percentualMedio > 5 ? 'text-red-600' : 
                        analise.percentualMedio > 3 ? 'text-orange-600' : 
                        'text-green-600'
                      }`}>
                        {analise.percentualMedio.toFixed(2)}%
                      </span>
                    </div>

                    {analise.percentualMedio > 5 && (
                      <Alert className="border-red-300 bg-red-50">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <AlertDescription className="text-xs text-red-800">
                          <strong>ATENÇÃO:</strong> Refugo acima do esperado! Revisar processos urgentemente.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}