import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  CheckCircle,
  Activity,
  AlertTriangle,
  TrendingUp,
  Eye,
  RefreshCw,
  Layers,
  Zap as ZapIcon
} from 'lucide-react';
import ValidadorElementosInterativos from './ValidadorElementosInterativos';
import ActionStateMonitor from '../lib/ActionStateMonitor';

/**
 * V22.0 ETAPA 1 - Dashboard de Estabilização Funcional
 * 
 * Centraliza todas as ferramentas de validação e monitoramento da Etapa 1:
 * ✅ Validador de elementos interativos
 * ✅ Monitor de ações em tempo real
 * ✅ Estatísticas de estabilidade
 * ✅ Auditoria de UI
 * ✅ Health check do sistema
 */
export default function DashboardEstabilizacao() {
  const [healthScore, setHealthScore] = useState(0);
  const [stats, setStats] = useState({
    elementosInterativos: 0,
    acoesExecutadas: 0,
    errosUI: 0,
    tempoMedioResposta: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // Calcular health score baseado em múltiplos fatores
      const actionLogs = window.__actionLogs || [];
      const total = actionLogs.length;
      const erros = actionLogs.filter(l => l.status === 'error').length;
      const sucessos = actionLogs.filter(l => l.status === 'success').length;
      
      const taxaSucesso = total > 0 ? (sucessos / total) * 100 : 100;
      const avgDuration = total > 0
        ? actionLogs.reduce((acc, l) => acc + (l.duration || 0), 0) / total
        : 0;
      
      // Score ponderado
      const scoreTaxaSucesso = taxaSucesso * 0.6;
      const scorePerformance = avgDuration < 100 ? 30 : avgDuration < 500 ? 20 : 10;
      const scoreBonusUso = total > 10 ? 10 : total * 1;
      
      const finalScore = Math.min(100, Math.round(scoreTaxaSucesso + scorePerformance + scoreBonusUso));
      
      setHealthScore(finalScore);
      setStats({
        elementosInterativos: document.querySelectorAll('button, input, select, textarea').length,
        acoesExecutadas: total,
        errosUI: erros,
        tempoMedioResposta: avgDuration
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <span className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </span>
            Dashboard de Estabilização V22.0
          </h1>
          <p className="text-slate-600 mt-1">
            ETAPA 1 • Validação de UI • Monitor de Ações • Health Check do Sistema
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-blue-600 text-white">
            <Activity className="w-3 h-3 mr-1" />
            {stats.acoesExecutadas} ações
          </Badge>
          <Badge className={`${
            healthScore >= 90 ? 'bg-green-600' :
            healthScore >= 70 ? 'bg-yellow-600' :
            'bg-red-600'
          } text-white`}>
            <CheckCircle className="w-3 h-3 mr-1" />
            Health: {healthScore}%
          </Badge>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Health Score</p>
                <p className="text-3xl font-bold">{healthScore}%</p>
              </div>
              <Shield className="w-10 h-10 text-blue-200" />
            </div>
            <Progress value={healthScore} className="mt-2 h-2 bg-blue-400" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Elementos</p>
                <p className="text-3xl font-bold">{stats.elementosInterativos}</p>
              </div>
              <Layers className="w-10 h-10 text-green-200" />
            </div>
            <p className="text-xs text-green-100 mt-2">Interativos validados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Ações</p>
                <p className="text-3xl font-bold">{stats.acoesExecutadas}</p>
              </div>
              <ZapIcon className="w-10 h-10 text-purple-200" />
            </div>
            <p className="text-xs text-purple-100 mt-2">Executadas</p>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${
          stats.errosUI > 5 ? 'from-red-500 to-red-600' :
          stats.errosUI > 0 ? 'from-orange-500 to-orange-600' :
          'from-emerald-500 to-emerald-600'
        } text-white`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Erros UI</p>
                <p className="text-3xl font-bold">{stats.errosUI}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-white/60" />
            </div>
            <p className="text-xs text-white/80 mt-2">
              {stats.errosUI === 0 ? 'Estável' : 'Atenção'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="validador" className="w-full">
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="validador" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Shield className="w-4 h-4 mr-2" />
            Validador
          </TabsTrigger>
          <TabsTrigger value="monitor" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <Activity className="w-4 h-4 mr-2" />
            Monitor Real-time
          </TabsTrigger>
          <TabsTrigger value="metricas" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <TrendingUp className="w-4 h-4 mr-2" />
            Métricas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="validador" className="mt-4">
          <ValidadorElementosInterativos />
        </TabsContent>

        <TabsContent value="monitor" className="mt-4">
          <ActionStateMonitor />
        </TabsContent>

        <TabsContent value="metricas" className="mt-4">
          <Card>
            <CardHeader className="border-b bg-slate-50">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Métricas de Performance da UI
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border rounded-lg bg-white">
                  <p className="text-sm text-slate-600 mb-2">Tempo Médio de Resposta</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.tempoMedioResposta.toFixed(0)}ms
                  </p>
                  <Progress 
                    value={Math.min(100, (1000 - stats.tempoMedioResposta) / 10)} 
                    className="mt-2 h-2"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    {stats.tempoMedioResposta < 100 ? '✅ Excelente' :
                     stats.tempoMedioResposta < 500 ? '⚠️ Bom' :
                     '❌ Lento'}
                  </p>
                </div>

                <div className="p-4 border rounded-lg bg-white">
                  <p className="text-sm text-slate-600 mb-2">Taxa de Sucesso</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.acoesExecutadas > 0
                      ? Math.round(((stats.acoesExecutadas - stats.errosUI) / stats.acoesExecutadas) * 100)
                      : 100}%
                  </p>
                  <Progress 
                    value={stats.acoesExecutadas > 0
                      ? ((stats.acoesExecutadas - stats.errosUI) / stats.acoesExecutadas) * 100
                      : 100}
                    className="mt-2 h-2"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    {stats.errosUI === 0 ? '✅ Perfeito' : '⚠️ Com erros'}
                  </p>
                </div>

                <div className="p-4 border rounded-lg bg-white">
                  <p className="text-sm text-slate-600 mb-2">Elementos Validados</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.elementosInterativos}
                  </p>
                  <Progress value={100} className="mt-2 h-2" />
                  <p className="text-xs text-slate-500 mt-2">
                    ✅ Monitorados ativamente
                  </p>
                </div>
              </div>

              {/* Recomendações */}
              <div className="mt-6 p-4 border rounded-lg bg-blue-50">
                <h3 className="font-semibold text-blue-700 mb-3">
                  💡 Recomendações de Estabilização
                </h3>
                <div className="space-y-2 text-sm text-slate-700">
                  {stats.errosUI > 5 && (
                    <p>⚠️ Alto número de erros detectados. Revisar componentes com falha.</p>
                  )}
                  {stats.tempoMedioResposta > 500 && (
                    <p>⚠️ Tempo de resposta acima do ideal. Otimizar ações pesadas.</p>
                  )}
                  {stats.elementosInterativos > 200 && (
                    <p>💡 Interface complexa. Considerar lazy loading de componentes.</p>
                  )}
                  {stats.errosUI === 0 && stats.tempoMedioResposta < 100 && (
                    <p className="text-green-700">✅ Sistema estável e performático!</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}