import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Activity } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * ETAPA 3: Painel de Métricas Real-time
 * Atualização automática com WebSocket
 */

export default function PainelMetricasRealtime() {
  const { filterInContext, empresaAtual } = useContextoVisual();
  const [metricas, setMetricas] = useState({
    total: 0,
    em_transito: 0,
    entregues_hoje: 0
  });

  useEffect(() => {
    if (!empresaAtual?.id) return;

    const carregar = async () => {
      const entregas = await filterInContext('Entrega', {}, '-updated_date', 500);
      
      const hoje = new Date().toISOString().split('T')[0];
      
      setMetricas({
        total: entregas.length,
        em_transito: entregas.filter(e => e.status === 'Em Trânsito').length,
        entregues_hoje: entregas.filter(e => 
          e.status === 'Entregue' && 
          e.data_entrega?.startsWith(hoje)
        ).length
      });
    };

    carregar();

    // Real-time subscription
    const unsub = base44.entities.Entrega.subscribe((event) => {
      carregar(); // Recarregar métricas
    });

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [empresaAtual?.id]);

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="border-l-4 border-l-blue-600">
        <CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{metricas.total}</p>
          <p className="text-xs text-slate-600">Total Ativas</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-orange-600">
        <CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-orange-700 flex items-center justify-center gap-1">
            {metricas.em_transito}
            <Activity className="w-4 h-4 animate-pulse" />
          </p>
          <p className="text-xs text-slate-600">Em Trânsito</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-600">
        <CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-green-700">{metricas.entregues_hoje}</p>
          <p className="text-xs text-slate-600">Entregues Hoje</p>
        </CardContent>
      </Card>
    </div>
  );
}