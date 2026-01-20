import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';

/**
 * V22.0 ETAPA 1 - Monitor de Estados de Ação
 * 
 * Monitora em tempo real todas as ações executadas no sistema
 * Exibe estatísticas de sucesso/erro
 * Permite auditoria de comportamento da UI
 */
export default function ActionStateMonitor() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    error: 0,
    avgDuration: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && window.__actionLogs) {
        const allLogs = window.__actionLogs || [];
        setLogs(allLogs.slice(-50).reverse());

        // Calcular estatísticas
        const total = allLogs.length;
        const success = allLogs.filter(l => l.status === 'success').length;
        const error = allLogs.filter(l => l.status === 'error').length;
        const avgDuration = total > 0
          ? allLogs.reduce((acc, l) => acc + (l.duration || 0), 0) / total
          : 0;

        setStats({ total, success, error, avgDuration });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full h-full">
      <CardHeader className="border-b bg-slate-50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="w-5 h-5 text-blue-600" />
          Monitor de Ações em Tempo Real
          <Badge className="bg-green-600 text-white ml-auto">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 border rounded-lg bg-white">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-slate-500">Total</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>

          <div className="p-3 border rounded-lg bg-green-50">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-xs text-slate-500">Sucesso</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{stats.success}</p>
          </div>

          <div className="p-3 border rounded-lg bg-red-50">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-xs text-slate-500">Erros</span>
            </div>
            <p className="text-2xl font-bold text-red-700">{stats.error}</p>
          </div>

          <div className="p-3 border rounded-lg bg-blue-50">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-slate-500">Tempo Médio</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">
              {stats.avgDuration.toFixed(0)}ms
            </p>
          </div>
        </div>

        {/* Log de Ações */}
        <div>
          <h3 className="font-semibold text-sm text-slate-700 mb-2">
            Últimas 50 Ações
          </h3>
          <ScrollArea className="h-[400px] border rounded-lg bg-white">
            <div className="p-2 space-y-1">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Activity className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Nenhuma ação registrada ainda</p>
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded border text-xs ${
                      log.status === 'success'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {log.status === 'success' ? (
                          <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-600 flex-shrink-0" />
                        )}
                        <span className="font-medium truncate">{log.action}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className="text-xs">
                          {log.duration?.toFixed(0)}ms
                        </Badge>
                        <span className="text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    {log.error && (
                      <p className="text-red-600 mt-1 truncate">{log.error}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}