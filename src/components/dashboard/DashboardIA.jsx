import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Zap,
  Target,
  Activity
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

/**
 * V21.4 - Dashboard Central de IA
 * Consolida TODOS os insights gerados pelas 10+ IAs do sistema
 */
export default function DashboardIA({ empresaId, grupoId }) {
  const [periodo, setPeriodo] = useState(7);

  // Buscar configurações de IA
  const { data: configsIA = [] } = useQuery({
    queryKey: ['ia-configs', empresaId],
    queryFn: () => base44.entities.IAConfig.filter({
      empresa_id: empresaId,
      ativo: true
    }),
    enabled: !!empresaId
  });

  // Buscar notificações de IA
  const { data: notificacoesIA = [] } = useQuery({
    queryKey: ['notificacoes-ia', empresaId, periodo],
    queryFn: async () => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - periodo);

      const notifs = await base44.entities.Notificacao.filter({
        categoria: { $in: ['Sistema', 'Estoque', 'Financeiro', 'Comercial'] }
      }, '-created_date', 100);

      return notifs.filter(n => 
        new Date(n.created_date) >= cutoff &&
        (n.titulo?.includes('IA') || n.mensagem?.includes('IA'))
      );
    },
    enabled: !!empresaId
  });

  // Calcular KPIs de IA
  const totalExecucoes = configsIA.reduce((sum, c) => sum + (c.total_execucoes || 0), 0);
  const totalSucesso = configsIA.reduce((sum, c) => sum + (c.total_sucesso || 0), 0);
  const taxaSucesso = totalExecucoes > 0 ? (totalSucesso / totalExecucoes) * 100 : 0;

  const notifCriticas = notificacoesIA.filter(n => n.prioridade === 'Urgente' || n.tipo === 'erro').length;
  const notifResolvidasAuto = notificacoesIA.filter(n => n.acao_tomada).length;

  // Dados para gráfico de execuções
  const execucoesPorModulo = configsIA.map(c => ({
    modulo: c.funcionalidade,
    execucoes: c.total_execucoes || 0,
    sucesso: c.total_sucesso || 0,
    taxa: c.taxa_sucesso_percentual || 0
  }));

  // Radar de Performance IA
  const radarData = [
    { 
      categoria: 'Comercial', 
      score: configsIA.find(c => c.modulo === 'Comercial')?.taxa_sucesso_percentual || 0 
    },
    { 
      categoria: 'Produção', 
      score: configsIA.find(c => c.modulo === 'Producao')?.taxa_sucesso_percentual || 0 
    },
    { 
      categoria: 'Financeiro', 
      score: configsIA.find(c => c.modulo === 'Financeiro')?.taxa_sucesso_percentual || 0 
    },
    { 
      categoria: 'Estoque', 
      score: configsIA.find(c => c.modulo === 'Estoque')?.taxa_sucesso_percentual || 0 
    },
    { 
      categoria: 'Logística', 
      score: configsIA.find(c => c.modulo === 'Logistica')?.taxa_sucesso_percentual || 0 
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">🧠 Central de IA</h1>
              <p className="text-purple-100">Inteligência Artificial Integrada - V21.4 COMPLETO</p>
            </div>
            <Brain className="w-16 h-16" />
          </div>
        </CardContent>
      </Card>

      {/* KPIs Globais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">IAs Ativas</p>
                <p className="text-3xl font-bold text-purple-600">{configsIA.length}</p>
              </div>
              <Zap className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Taxa de Sucesso</p>
                <p className="text-3xl font-bold text-green-600">{taxaSucesso.toFixed(1)}%</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <Progress value={taxaSucesso} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Alertas Críticos</p>
                <p className="text-3xl font-bold text-red-600">{notifCriticas}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Ações Automáticas</p>
                <p className="text-3xl font-bold text-blue-600">{notifResolvidasAuto}</p>
              </div>
              <Target className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance por Módulo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Performance por Módulo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="categoria" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar 
                  name="Performance IA" 
                  dataKey="score" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.6} 
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Execuções por Funcionalidade */}
        <Card>
          <CardHeader>
            <CardTitle>Execuções Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {configsIA.slice(0, 8).map((config) => (
                <div key={config.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{config.funcionalidade}</p>
                    <p className="text-xs text-slate-500">{config.modulo}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={
                      config.taxa_sucesso_percentual >= 90 ? 'bg-green-600' :
                      config.taxa_sucesso_percentual >= 70 ? 'bg-yellow-600' :
                      'bg-red-600'
                    }>
                      {config.taxa_sucesso_percentual?.toFixed(0) || 0}%
                    </Badge>
                    <p className="text-xs text-slate-500 mt-1">
                      {config.total_execucoes || 0} exec.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notificações Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Insights e Alertas Recentes (últimos {periodo} dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {notificacoesIA.slice(0, 10).map((notif) => (
              <Card key={notif.id} className={`border ${
                notif.tipo === 'erro' ? 'border-red-300 bg-red-50' :
                notif.tipo === 'aviso' ? 'border-orange-300 bg-orange-50' :
                'border-blue-300 bg-blue-50'
              }`}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{notif.titulo}</p>
                      <p className="text-xs text-slate-600 mt-1">{notif.mensagem}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(notif.created_date).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <Badge className={
                      notif.prioridade === 'Urgente' ? 'bg-red-600' :
                      notif.prioridade === 'Alta' ? 'bg-orange-600' :
                      'bg-blue-600'
                    }>
                      {notif.prioridade}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}

            {notificacoesIA.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                <p>Nenhum alerta de IA nos últimos {periodo} dias</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}