import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Shield, Database, TrendingUp } from 'lucide-react';

/**
 * MONITORAMENTO ETAPA 1 - WIDGET MÉTRICAS
 * Métricas em tempo real da governança
 */

export default function MonitoramentoETAPA1() {
  const { data: logs = [] } = useQuery({
    queryKey: ['metricas-etapa1'],
    queryFn: async () => {
      const dataLimite = new Date();
      dataLimite.setMinutes(dataLimite.getMinutes() - 5);
      return base44.entities.AuditLog.filter({
        data_hora: { $gte: dataLimite.toISOString() }
      }, '-data_hora', 100);
    },
    refetchInterval: 5000
  });

  const metricas = {
    acoesUltimos5min: logs.length,
    validacoesRBAC: logs.filter(l => l.entidade === 'RBACValidator').length,
    validacoesMulti: logs.filter(l => l.entidade === 'MultiempresaValidator').length,
    bloqueios: logs.filter(l => l.acao === 'Bloqueio').length
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-slate-600 flex items-center gap-1">
            <Activity className="w-3 h-3" />
            Ações (5min)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{metricas.acoesUltimos5min}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-slate-600 flex items-center gap-1">
            <Shield className="w-3 h-3" />
            RBAC
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-blue-600">{metricas.validacoesRBAC}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-slate-600 flex items-center gap-1">
            <Database className="w-3 h-3" />
            Multi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-purple-600">{metricas.validacoesMulti}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-slate-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Bloqueios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-600">{metricas.bloqueios}</p>
        </CardContent>
      </Card>
    </div>
  );
}