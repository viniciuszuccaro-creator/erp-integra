import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, TrendingUp, Clock, Target, DollarSign, Zap } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * ETAPA 3: Dashboard Logística Inteligente
 * Métricas calculadas com IA
 */

export default function DashboardLogisticaInteligente() {
  const { filterInContext, empresaAtual } = useContextoVisual();

  const { data: entregas = [] } = useQuery({
    queryKey: ['entregas', 'dashboard', empresaAtual?.id],
    queryFn: () => filterInContext('Entrega', {}, '-data_previsao', 500),
    enabled: !!empresaAtual,
    refetchInterval: 60000
  });

  const { data: rotas = [] } = useQuery({
    queryKey: ['rotas', empresaAtual?.id],
    queryFn: () => filterInContext('Rota', {}, '-created_date', 100),
    enabled: !!empresaAtual
  });

  // Métricas IA
  const hoje = entregas.filter(e => {
    const hoje = new Date().toISOString().split('T')[0];
    return e.data_previsao === hoje;
  });

  const emTransito = entregas.filter(e => e.status === 'Em Trânsito');
  const entregues = entregas.filter(e => e.status === 'Entregue');
  const frustradas = entregas.filter(e => e.status === 'Entrega Frustrada');

  const taxaSucesso = entregas.length > 0 
    ? ((entregues.length / (entregues.length + frustradas.length || 1)) * 100).toFixed(1)
    : 100;

  const tempoMedio = entregues
    .filter(e => e.data_saida && e.data_entrega)
    .reduce((sum, e) => {
      const diff = new Date(e.data_entrega) - new Date(e.data_saida);
      return sum + (diff / (1000 * 60)); // minutos
    }, 0) / (entregues.length || 1);

  const kmTotal = rotas.reduce((sum, r) => sum + (r.distancia_total_km || 0), 0);

  const metricas = [
    {
      titulo: 'Entregas Hoje',
      valor: hoje.length,
      icon: Truck,
      cor: 'blue',
      subtitulo: `${emTransito.length} em trânsito`
    },
    {
      titulo: 'Taxa de Sucesso',
      valor: `${taxaSucesso}%`,
      icon: Target,
      cor: 'green',
      subtitulo: `${entregues.length} entregues`
    },
    {
      titulo: 'Tempo Médio',
      valor: `${Math.round(tempoMedio)}min`,
      icon: Clock,
      cor: 'purple',
      subtitulo: 'Por entrega'
    },
    {
      titulo: 'KM Rodados',
      valor: kmTotal.toFixed(0),
      icon: TrendingUp,
      cor: 'orange',
      subtitulo: `${rotas.length} rotas`
    }
  ];

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricas.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Card key={idx} className={`border-l-4 border-l-${m.cor}-600`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-600">{m.titulo}</p>
                  <Icon className={`w-5 h-5 text-${m.cor}-600`} />
                </div>
                <p className={`text-3xl font-bold text-${m.cor}-700`}>{m.valor}</p>
                <p className="text-xs text-slate-500 mt-1">{m.subtitulo}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alertas IA */}
      {frustradas.length > 0 && (
        <Card className="border-2 border-red-300 bg-red-50">
          <CardContent className="py-4 flex items-center gap-3">
            <Zap className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-semibold text-red-800">
                {frustradas.length} {frustradas.length === 1 ? 'entrega frustrada' : 'entregas frustradas'}
              </p>
              <p className="text-xs text-red-700">Requer atenção imediata</p>
            </div>
            <Badge className="bg-red-600 ml-auto">Alerta</Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
}