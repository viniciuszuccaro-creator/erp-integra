import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, CheckCircle2, Clock, AlertCircle, MapPin } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * ETAPA 3: Dashboard de Entregas para Gestor
 * Visão geral em tempo real de todas as entregas
 */

export default function DashboardEntregasGestor() {
  const { filterInContext, empresaAtual } = useContextoVisual();

  const { data: entregas = [], isLoading } = useQuery({
    queryKey: ['entregas', 'todas', empresaAtual?.id],
    queryFn: () => filterInContext('Entrega', {}, '-data_previsao', 200),
    enabled: !!empresaAtual,
    refetchInterval: 10000 // Atualiza a cada 10s
  });

  const stats = {
    pendentes: entregas.filter(e => ['Aguardando Separação', 'Em Separação'].includes(e.status)).length,
    emTransito: entregas.filter(e => ['Saiu para Entrega', 'Em Trânsito'].includes(e.status)).length,
    entregues: entregas.filter(e => e.status === 'Entregue').length,
    frustradas: entregas.filter(e => e.status === 'Entrega Frustrada').length
  };

  const KPICard = ({ titulo, valor, icon: Icon, cor }) => (
    <Card className={`border-l-4 border-l-${cor}-600`}>
      <CardContent className="pt-6 flex items-center justify-between">
        <div>
          <span className="text-sm text-slate-600">{titulo}</span>
          <p className="text-2xl font-bold">{valor}</p>
        </div>
        <Icon className={`w-8 h-8 text-${cor}-600`} />
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full h-full space-y-6 p-6 overflow-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard de Entregas</h2>
        <p className="text-slate-600">Monitoramento em tempo real</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard titulo="Pendentes" valor={stats.pendentes} icon={Clock} cor="yellow" />
        <KPICard titulo="Em Trânsito" valor={stats.emTransito} icon={Truck} cor="blue" />
        <KPICard titulo="Entregues" valor={stats.entregues} icon={CheckCircle2} cor="green" />
        <KPICard titulo="Frustradas" valor={stats.frustradas} icon={AlertCircle} cor="red" />
      </div>

      {/* Lista de Entregas em Trânsito */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Entregas em Trânsito ({stats.emTransito})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {entregas
            .filter(e => ['Saiu para Entrega', 'Em Trânsito'].includes(e.status))
            .slice(0, 10)
            .map(entrega => (
              <div key={entrega.id} className="flex items-center justify-between p-3 border-l-4 border-l-blue-600 bg-blue-50 rounded">
                <div className="flex-1">
                  <p className="font-medium">{entrega.cliente_nome}</p>
                  <p className="text-sm text-slate-600">
                    {entrega.endereco_entrega_completo?.cidade}/{entrega.endereco_entrega_completo?.estado}
                  </p>
                  <p className="text-xs text-slate-500">
                    Motorista: {entrega.motorista || 'N/A'}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <Badge className="bg-blue-600">{entrega.status}</Badge>
                  {entrega.data_previsao && (
                    <p className="text-xs text-slate-500">
                      Prev: {new Date(entrega.data_previsao).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          
          {stats.emTransito === 0 && (
            <p className="text-center text-slate-500 py-8">Nenhuma entrega em trânsito</p>
          )}
        </CardContent>
      </Card>

      {/* Entregas Frustradas */}
      {stats.frustradas > 0 && (
        <Card className="border-2 border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              Entregas Frustradas ({stats.frustradas})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {entregas
              .filter(e => e.status === 'Entrega Frustrada')
              .map(entrega => (
                <div key={entrega.id} className="p-3 bg-white border border-red-200 rounded">
                  <p className="font-medium">{entrega.cliente_nome}</p>
                  <p className="text-sm text-red-600">
                    Motivo: {entrega.entrega_frustrada?.motivo || 'N/A'}
                  </p>
                  <p className="text-xs text-slate-600">
                    {entrega.entrega_frustrada?.detalhes || ''}
                  </p>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}