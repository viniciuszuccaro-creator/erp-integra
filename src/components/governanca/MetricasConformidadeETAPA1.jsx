import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Shield, Users, Building2 } from 'lucide-react';

/**
 * MÉTRICAS CONFORMIDADE ETAPA 1
 * KPIs compactos de governança
 */

export default function MetricasConformidadeETAPA1() {
  const { data: perfis = [] } = useQuery({
    queryKey: ['perfis-metricas'],
    queryFn: () => base44.entities.PerfilAcesso.list()
  });

  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios-metricas'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas-metricas'],
    queryFn: () => base44.entities.Empresa.list()
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['logs-metricas'],
    queryFn: async () => {
      const dataLimite = new Date();
      dataLimite.setHours(dataLimite.getHours() - 24);
      return base44.entities.AuditLog.filter({
        data_hora: { $gte: dataLimite.toISOString() }
      }, '-data_hora', 1000);
    },
    refetchInterval: 10000
  });

  const metricas = [
    {
      titulo: 'Perfis RBAC',
      valor: perfis.length,
      icone: Shield,
      cor: 'blue'
    },
    {
      titulo: 'Usuários',
      valor: usuarios.length,
      icone: Users,
      cor: 'green'
    },
    {
      titulo: 'Empresas',
      valor: empresas.length,
      icone: Building2,
      cor: 'purple'
    },
    {
      titulo: 'Ações (24h)',
      valor: logs.length,
      icone: TrendingUp,
      cor: 'orange'
    }
  ];

  const cores = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600'
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metricas.map((m, idx) => (
        <Card key={idx} className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${cores[m.cor]} bg-opacity-10`}>
                <m.icone className={`w-5 h-5 text-${m.cor}-600`} />
              </div>
              <div>
                <p className="text-xs text-slate-600">{m.titulo}</p>
                <p className="text-2xl font-bold text-slate-900">{m.valor}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}