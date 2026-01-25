import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * ETAPA 3: Widget de Próximas Entregas
 * Componente compacto para dashboard
 */

export default function WidgetProximasEntregas({ limite = 5 }) {
  const { filterInContext, empresaAtual } = useContextoVisual();

  const { data: entregas = [], isLoading } = useQuery({
    queryKey: ['entregas', 'proximas', empresaAtual?.id, limite],
    queryFn: () => filterInContext('Entrega', {
      status: { $in: ['Pronto para Expedir', 'Saiu para Entrega', 'Em Trânsito'] },
      data_previsao: { $gte: new Date().toISOString().split('T')[0] }
    }, 'data_previsao', limite),
    enabled: !!empresaAtual,
    refetchInterval: 30000
  });

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          Próximas Entregas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading && <p className="text-sm text-slate-500">Carregando...</p>}

        {entregas.map(entrega => (
          <div
            key={entrega.id}
            className="flex items-center justify-between p-2 bg-slate-50 rounded border hover:bg-slate-100 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{entrega.cliente_nome}</p>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-3 h-3 text-slate-500" />
                <p className="text-xs text-slate-600 truncate">
                  {entrega.endereco_entrega_completo?.cidade}/{entrega.endereco_entrega_completo?.estado}
                </p>
              </div>
            </div>
            <div className="text-right ml-2">
              <Badge className={
                entrega.prioridade === 'Urgente' ? 'bg-red-600' :
                entrega.prioridade === 'Alta' ? 'bg-orange-600' : 'bg-blue-600'
              }>
                {entrega.prioridade}
              </Badge>
              {entrega.data_previsao && (
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(entrega.data_previsao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </p>
              )}
            </div>
          </div>
        ))}

        {entregas.length === 0 && !isLoading && (
          <p className="text-sm text-slate-500 text-center py-4">
            Nenhuma entrega programada
          </p>
        )}
      </CardContent>
    </Card>
  );
}