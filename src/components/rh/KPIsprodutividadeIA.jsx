
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, TrendingDown, Clock, Target, Award, DollarSign } from "lucide-react";

/**
 * V21.5 - KPIs de Produtividade com IA
 * Analisa produtividade de colaboradores baseado em apontamentos
 */
export default function KPIsProductividadeIA({ empresaId }) {
  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores-kpi', empresaId],
    queryFn: () => base44.entities.Colaborador.filter({
      empresa_alocada_id: empresaId,
      status: 'Ativo'
    })
  });

  const { data: ops = [] } = useQuery({
    queryKey: ['ops-kpi', empresaId],
    queryFn: () => base44.entities.OrdemProducao.filter({
      empresa_id: empresaId
    }, '-data_conclusao_real', 100)
  });

  const { data: pontos = [] } = useQuery({
    queryKey: ['pontos-kpi'],
    queryFn: () => base44.entities.Ponto.filter({}, '-data', 200)
  });

  const calcularKPIsColaborador = (colabId) => {
    // Apontamentos deste colaborador
    const opsColaborador = ops.filter(op => 
      (op.apontamentos || []).some(a => a.operador_id === colabId)
    );

    const totalApontamentos = opsColaborador.reduce(
      (sum, op) => sum + (op.apontamentos || []).filter(a => a.operador_id === colabId).length,
      0
    );

    const pesoTotalProduzido = opsColaborador.reduce(
      (sum, op) => {
        const apontamentosColab = (op.apontamentos || []).filter(a => a.operador_id === colabId);
        return sum + apontamentosColab.reduce((s, a) => s + (a.peso_produzido_kg || 0), 0);
      },
      0
    );

    const pesoTotalRefugado = opsColaborador.reduce(
      (sum, op) => {
        const apontamentosColab = (op.apontamentos || []).filter(a => a.operador_id === colabId);
        return sum + apontamentosColab.reduce((s, a) => s + (a.peso_refugado_kg || 0), 0);
      },
      0
    );

    const taxaRefugo = pesoTotalProduzido > 0
      ? (pesoTotalRefugado / pesoTotalProduzido * 100)
      : 0;

    // Horas trabalhadas (últimos 30 dias)
    const hoje = new Date();
    const mes_passado = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const pontosColab = pontos.filter(p => 
      p.colaborador_nome && 
      new Date(p.data) >= mes_passado
    );

    const horasTrabalhadas = pontosColab.reduce((sum, p) => sum + (p.horas_trabalhadas || 0), 0);
    const horasExtras = pontosColab.reduce((sum, p) => sum + (p.horas_extras || 0), 0);

    // Produtividade (KG por hora)
    const produtividadeKgH = horasTrabalhadas > 0
      ? pesoTotalProduzido / horasTrabalhadas
      : 0;

    // Score de Produtividade (0-100)
    let score = 50; // Base

    // Peso produzido
    if (pesoTotalProduzido > 5000) score += 20;
    else if (pesoTotalProduzido > 2000) score += 10;

    // Taxa de refugo baixa
    if (taxaRefugo < 2) score += 20;
    else if (taxaRefugo < 5) score += 10;
    else score -= 10;

    // Produtividade alta
    if (produtividadeKgH > 100) score += 10;
    else if (produtividadeKgH > 50) score += 5;

    score = Math.min(100, Math.max(0, score));

    return {
      totalApontamentos,
      pesoTotalProduzido,
      pesoTotalRefugado,
      taxaRefugo,
      horasTrabalhadas,
      horasExtras,
      produtividadeKgH,
      score
    };
  };

  const rankingColaboradores = colaboradores
    .map(colab => ({
      ...colab,
      kpis: calcularKPIsColaborador(colab.id)
    }))
    .sort((a, b) => b.kpis.score - a.kpis.score);

  const top5 = rankingColaboradores.slice(0, 5);
  const mediaScore = rankingColaboradores.length > 0
    ? rankingColaboradores.reduce((sum, c) => sum + c.kpis.score, 0) / rankingColaboradores.length
    : 0;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            IA - Análise de Produtividade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-600">Score Médio da Equipe</p>
              <p className="text-3xl font-bold text-purple-600">{mediaScore.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Produção Total (30d)</p>
              <p className="text-2xl font-bold text-green-600">
                {rankingColaboradores.reduce((sum, c) => sum + c.kpis.pesoTotalProduzido, 0).toFixed(0)} kg
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Taxa Refugo Média</p>
              <p className="text-2xl font-bold text-orange-600">
                {(rankingColaboradores.reduce((sum, c) => sum + c.kpis.taxaRefugo, 0) / rankingColaboradores.length).toFixed(2)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 5 Performers */}
      <Card className="border-2 border-blue-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            Top 5 Colaboradores (Score IA)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {top5.map((colab, index) => (
              <div key={colab.id} className="p-4 border-2 border-slate-200 rounded-lg hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-600' :
                    'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{colab.nome_completo}</p>
                      <Badge className="bg-purple-600">{colab.cargo}</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-3 mt-2 text-xs">
                      <div>
                        <p className="text-slate-500">Produzido</p>
                        <p className="font-semibold">{colab.kpis.pesoTotalProduzido.toFixed(0)} kg</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Refugo</p>
                        <p className={`font-semibold ${
                          colab.kpis.taxaRefugo < 2 ? 'text-green-600' :
                          colab.kpis.taxaRefugo < 5 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {colab.kpis.taxaRefugo.toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Produtividade</p>
                        <p className="font-semibold">{colab.kpis.produtividadeKgH.toFixed(1)} kg/h</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Horas Extras</p>
                        <p className="font-semibold">{colab.kpis.horasExtras.toFixed(1)}h</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-3xl font-bold text-purple-600">{colab.kpis.score.toFixed(0)}</p>
                    <p className="text-xs text-slate-500">Score IA</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Todos os Colaboradores */}
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <CardTitle>Análise Completa da Equipe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {rankingColaboradores.map((colab) => {
              const kpi = colab.kpis;
              
              return (
                <div key={colab.id} className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-bold">{colab.nome_completo}</p>
                      <p className="text-sm text-slate-600">{colab.cargo} - {colab.departamento}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">{kpi.score.toFixed(0)}</p>
                      <Progress value={kpi.score} className="h-1 w-20 mt-1" />
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2 text-xs mt-3 pt-3 border-t">
                    <div>
                      <p className="text-slate-500">Apontamentos</p>
                      <p className="font-semibold">{kpi.totalApontamentos}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Produzido</p>
                      <p className="font-semibold text-green-600">{kpi.pesoTotalProduzido.toFixed(0)} kg</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Taxa Refugo</p>
                      <p className={`font-semibold ${
                        kpi.taxaRefugo < 2 ? 'text-green-600' :
                        kpi.taxaRefugo < 5 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {kpi.taxaRefugo.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Produtividade</p>
                      <p className="font-semibold text-blue-600">{kpi.produtividadeKgH.toFixed(1)} kg/h</p>
                    </div>
                    <div>
                      <p className="text-slate-500">H. Extras (30d)</p>
                      <p className="font-semibold text-orange-600">{kpi.horasExtras.toFixed(1)}h</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
