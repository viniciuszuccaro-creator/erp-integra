import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Shield,
  Activity
} from 'lucide-react';

export default function ProdutividadeIA() {
  const { data: produtividades = [], isLoading } = useQuery({
    queryKey: ['produtividade_rh'],
    queryFn: () => base44.entities.ProdutividadeRH.list()
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  const colaboradoresRisco = produtividades.filter(
    p => p.analise_ia?.risco_turnover > 60
  );

  return (
    <div className="w-full h-full flex flex-col p-6 space-y-6 overflow-auto">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold mb-2">Produtividade & IA de RH</h1>
        <p className="text-sm text-slate-600">
          ETAPA 9 - Análise de Comportamento • Detecção de Riscos • Produtividade
        </p>
      </div>

      {/* Métricas Gerais */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Colaboradores</p>
                <p className="text-2xl font-bold">{produtividades.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Risco de Turnover</p>
                <p className="text-2xl font-bold text-red-600">{colaboradoresRisco.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Acessos Indevidos</p>
                <p className="text-2xl font-bold text-orange-600">
                  {produtividades.reduce((acc, p) => 
                    acc + (p.analise_ia?.acessos_indevidos_detectados || 0), 0
                  )}
                </p>
              </div>
              <Shield className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Produtividade Média</p>
                <p className="text-2xl font-bold text-green-600">87%</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Colaboradores */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Análise por Colaborador</h2>

        {produtividades.map(prod => {
          const riscoTurnover = prod.analise_ia?.risco_turnover || 0;
          const tendencia = prod.analise_ia?.tendencia_produtividade;
          
          return (
            <Card key={prod.id} className={
              riscoTurnover > 60 ? 'border-red-200 bg-red-50/50' : ''
            }>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium">{prod.colaborador_nome}</p>
                    <p className="text-xs text-slate-600">
                      Período: {prod.periodo_inicio} - {prod.periodo_fim}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Badge variant={
                      tendencia === 'Em Alta' ? 'success' :
                      tendencia === 'Em Queda' ? 'destructive' :
                      'secondary'
                    }>
                      {tendencia === 'Em Alta' && <TrendingUp className="w-3 h-3 mr-1" />}
                      {tendencia === 'Em Queda' && <TrendingDown className="w-3 h-3 mr-1" />}
                      {tendencia}
                    </Badge>

                    {riscoTurnover > 60 && (
                      <Badge variant="destructive">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Alto Risco Turnover
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Métricas de Produção */}
                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div className="text-sm">
                    <p className="text-slate-600">OPs Concluídas</p>
                    <p className="font-bold">{prod.metricas_producao?.ops_concluidas || 0}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-slate-600">KG Produzidos</p>
                    <p className="font-bold">{prod.metricas_producao?.kg_produzidos || 0}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-slate-600">Horas Trabalhadas</p>
                    <p className="font-bold">{prod.metricas_producao?.horas_trabalhadas || 0}h</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-slate-600">Produtividade/h</p>
                    <p className="font-bold text-blue-600">
                      {prod.metricas_producao?.produtividade_hora?.toFixed(2) || 0}
                    </p>
                  </div>
                </div>

                {/* Risco de Turnover */}
                {riscoTurnover > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">Risco de Turnover</span>
                      <span className={`font-medium ${
                        riscoTurnover > 60 ? 'text-red-600' :
                        riscoTurnover > 40 ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {riscoTurnover}%
                      </span>
                    </div>
                    <Progress value={riscoTurnover} className="h-2" />
                  </div>
                )}

                {/* Alertas da IA */}
                {prod.analise_ia?.alertas_comportamento?.length > 0 && (
                  <div className="space-y-2">
                    {prod.analise_ia.alertas_comportamento.map((alerta, idx) => (
                      <div key={idx} className="p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-orange-900">{alerta.tipo}</p>
                            <p className="text-xs text-orange-700">{alerta.descricao}</p>
                            {alerta.recomendacao && (
                              <p className="text-xs text-orange-600 mt-1 italic">
                                → {alerta.recomendacao}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {alerta.severidade}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Acessos Indevidos */}
                {prod.analise_ia?.acessos_indevidos_detectados > 0 && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-red-600" />
                    <span className="text-red-900">
                      {prod.analise_ia.acessos_indevidos_detectados} acessos indevidos detectados
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}