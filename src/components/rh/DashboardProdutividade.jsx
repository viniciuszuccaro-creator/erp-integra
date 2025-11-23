import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Award,
  Users,
  Activity,
  Target
} from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardProdutividade() {
  const { data: produtividades = [], isLoading } = useQuery({
    queryKey: ['produtividade_rh'],
    queryFn: () => base44.entities.ProdutividadeRH.list()
  });

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores'],
    queryFn: () => base44.entities.Colaborador.list()
  });

  // Top 5 produtivos
  const topProdutivos = produtividades
    .sort((a, b) => 
      (b.metricas_producao?.produtividade_hora || 0) - 
      (a.metricas_producao?.produtividade_hora || 0)
    )
    .slice(0, 5);

  // Alertas de risco
  const colaboradoresEmRisco = produtividades.filter(p => 
    p.analise_ia?.risco_turnover >= 70
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-6">
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Dashboard de Produtividade RH
        </h1>
        <p className="text-sm text-slate-600">
          Etapa 9 - Analytics RH com IA
        </p>
      </div>

      <div className="flex-1 overflow-auto space-y-6">
        {/* Métricas Gerais */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Colaboradores</p>
                  <p className="text-2xl font-bold">{colaboradores.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Produtividade Média</p>
                  <p className="text-2xl font-bold text-green-600">
                    {(produtividades.reduce((acc, p) => 
                      acc + (p.metricas_producao?.produtividade_hora || 0), 0
                    ) / (produtividades.length || 1)).toFixed(1)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Risco Turnover</p>
                  <p className="text-2xl font-bold text-red-600">
                    {colaboradoresEmRisco.length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Horas Mês</p>
                  <p className="text-2xl font-bold">
                    {produtividades.reduce((acc, p) => 
                      acc + (p.metricas_producao?.horas_trabalhadas || 0), 0
                    ).toFixed(0)}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Produtivos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Top 5 Produtivos do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProdutivos.map((prod, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white flex items-center justify-center font-bold text-lg">
                    {idx + 1}
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold">{prod.colaborador_nome}</p>
                    <div className="flex gap-4 text-sm text-slate-600 mt-1">
                      <span>OPs: {prod.metricas_producao?.ops_concluidas || 0}</span>
                      <span>{prod.metricas_producao?.kg_produzidos || 0} kg</span>
                      <span>{prod.metricas_producao?.horas_trabalhadas || 0}h</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {prod.metricas_producao?.produtividade_hora?.toFixed(1) || 0}
                    </p>
                    <p className="text-xs text-slate-600">kg/hora</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alertas IA */}
        {colaboradoresEmRisco.length > 0 && (
          <Card className="border-red-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                Alertas de Risco de Turnover (IA)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {colaboradoresEmRisco.map((prod, idx) => (
                  <div key={idx} className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-red-900">{prod.colaborador_nome}</p>
                        <Badge variant="destructive" className="mt-1">
                          Risco: {prod.analise_ia?.risco_turnover}%
                        </Badge>
                      </div>

                      <Badge
                        variant="outline"
                        className={
                          prod.analise_ia?.tendencia_produtividade === 'Em Queda' ? 
                          'border-red-500 text-red-700' :
                          'border-green-500 text-green-700'
                        }
                      >
                        {prod.analise_ia?.tendencia_produtividade}
                      </Badge>
                    </div>

                    {prod.analise_ia?.alertas_comportamento?.map((alerta, aidx) => (
                      <div key={aidx} className="text-sm text-red-800 mt-2">
                        <p className="font-medium">{alerta.tipo}</p>
                        <p className="text-xs mt-1">{alerta.descricao}</p>
                        <p className="text-xs text-blue-700 bg-blue-50 p-2 rounded mt-2">
                          💡 Recomendação: {alerta.recomendacao}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}