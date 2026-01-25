import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Clock } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * ETAPA 3: Widget Entregas de Hoje
 * Componente compacto para dashboard principal
 */

export default function WidgetEntregasHoje() {
  const { filterInContext, empresaAtual } = useContextoVisual();
  const hoje = new Date().toISOString().split('T')[0];

  const { data: entregas = [] } = useQuery({
    queryKey: ['entregas', 'hoje', empresaAtual?.id, hoje],
    queryFn: () => filterInContext('Entrega', {
      data_previsao: hoje,
      status: { $nin: ['Cancelado', 'Entregue'] }
    }, 'data_previsao', 20),
    enabled: !!empresaAtual,
    refetchInterval: 60000
  });

  const emTransito = entregas.filter(e => e.status === 'Em Trânsito').length;
  const pendentes = entregas.filter(e => e.status === 'Pronto para Expedir').length;

  return (
    <Card className="w-full h-full border-l-4 border-l-blue-600">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Truck className="w-4 h-4 text-blue-600" />
          Entregas de Hoje
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold text-blue-600">{entregas.length}</span>
          <Clock className="w-6 h-6 text-slate-400" />
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-orange-50 p-2 rounded">
            <p className="text-orange-800 font-bold">{emTransito}</p>
            <p className="text-orange-600">Em Trânsito</p>
          </div>
          <div className="bg-yellow-50 p-2 rounded">
            <p className="text-yellow-800 font-bold">{pendentes}</p>
            <p className="text-yellow-600">Pendentes</p>
          </div>
        </div>

        {entregas.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-2">
            Nenhuma entrega programada
          </p>
        )}
      </CardContent>
    </Card>
  );
}