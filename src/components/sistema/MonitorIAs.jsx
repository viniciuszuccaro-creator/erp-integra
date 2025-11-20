import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, CheckCircle, Clock, Zap, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function MonitorIAs() {
  const { data: logsIA = [] } = useQuery({
    queryKey: ['logs-ia-monitor'],
    queryFn: () => base44.entities.LogsIA.list('-created_date', 100)
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs-monitor'],
    queryFn: () => base44.entities.JobAgendado.list()
  });

  // Estatísticas
  const totalExecucoes = logsIA.length;
  const execucoesAceitas = logsIA.filter(l => l.resultado === 'Aceito').length;
  const execucoesAutomaticas = logsIA.filter(l => l.resultado === 'Automático').length;
  const execucoesRejeitadas = logsIA.filter(l => l.resultado === 'Rejeitado').length;
  const confianciaMedia = logsIA.length > 0 
    ? Math.round(logsIA.reduce((sum, l) => sum + (l.confianca_ia || 0), 0) / logsIA.length)
    : 0;

  // IAs por tipo
  const iasPorTipo = logsIA.reduce((acc, log) => {
    const tipo = log.tipo_ia || 'Outro';
    if (!acc[tipo]) acc[tipo] = { total: 0, aceitas: 0 };
    acc[tipo].total++;
    if (log.resultado === 'Aceito' || log.resultado === 'Automático') acc[tipo].aceitas++;
    return acc;
  }, {});

  const topIAs = Object.entries(iasPorTipo)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10);

  const jobsAtivos = jobs.filter(j => j.ativo).length;
  const jobsPendentes = jobs.filter(j => j.ultimo_resultado === 'Não Executado').length;

  return (
    <div className="w-full h-full p-6 space-y-6 overflow-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Brain className="w-7 h-7 text-purple-600" />
          Monitor de IAs - Dashboard Executivo
        </h2>
        <p className="text-slate-600 mt-1">28 IAs rodando 24/7 • Últimas 100 execuções</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Execuções</p>
                <p className="text-2xl font-bold text-slate-900">{totalExecucoes}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Aceitas/Automáticas</p>
                <p className="text-2xl font-bold text-green-600">{execucoesAceitas + execucoesAutomaticas}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Confiança Média</p>
                <p className="text-2xl font-bold text-purple-600">{confianciaMedia}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Jobs Ativos</p>
                <p className="text-2xl font-bold text-orange-600">{jobsAtivos}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top 10 IAs */}
      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Top 10 IAs Mais Executadas</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {topIAs.map(([tipo, stats]) => {
              const taxaSucesso = stats.total > 0 ? Math.round((stats.aceitas / stats.total) * 100) : 0;
              return (
                <div key={tipo} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-semibold text-sm text-slate-900">{tipo}</p>
                        <p className="text-xs text-slate-500">{stats.total} execuções • {stats.aceitas} aceitas</p>
                      </div>
                    </div>
                    <Badge className={taxaSucesso >= 80 ? 'bg-green-600' : taxaSucesso >= 50 ? 'bg-orange-600' : 'bg-red-600'}>
                      {taxaSucesso}% sucesso
                    </Badge>
                  </div>
                  <Progress value={taxaSucesso} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Execuções Recentes */}
      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Últimas 10 Execuções de IA</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2">
            {logsIA.slice(0, 10).map(log => (
              <div key={log.id} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{log.tipo_ia}</Badge>
                    <Badge variant="outline" className="text-xs">{log.contexto_execucao}</Badge>
                  </div>
                  <p className="text-sm font-medium text-slate-900 mt-2">{log.acao_sugerida}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(log.created_date).toLocaleString('pt-BR')} • 
                    Confiança: {log.confianca_ia}% • 
                    {log.tempo_execucao_ms}ms
                  </p>
                </div>
                <Badge className={
                  log.resultado === 'Aceito' || log.resultado === 'Automático' ? 'bg-green-600' :
                  log.resultado === 'Rejeitado' ? 'bg-red-600' : 'bg-gray-600'
                }>
                  {log.resultado}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}