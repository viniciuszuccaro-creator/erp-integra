import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/components/lib/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, Navigation, MapPin } from 'lucide-react';

/**
 * ETAPA 3: Widget Próxima Entrega do Motorista
 * Para App Motorista - destaque da próxima entrega
 */

export default function WidgetProximaEntrega({ onVerDetalhes }) {
  const { user } = useUser();

  const { data: proximaEntrega, isLoading } = useQuery({
    queryKey: ['proxima-entrega', user?.id],
    queryFn: async () => {
      const colaboradores = await base44.entities.Colaborador.filter({
        vincular_a_usuario_id: user?.id,
        pode_dirigir: true
      });

      if (!colaboradores || colaboradores.length === 0) return null;

      const entregas = await base44.entities.Entrega.filter({
        motorista_id: colaboradores[0].id,
        status: { $in: ['Pronto para Expedir', 'Saiu para Entrega'] }
      }, 'prioridade,-data_previsao', 1);

      return entregas?.[0] || null;
    },
    enabled: !!user?.id,
    refetchInterval: 30000
  });

  if (isLoading) return null;

  if (!proximaEntrega) {
    return (
      <Card className="w-full bg-green-50 border-green-300">
        <CardContent className="py-6 text-center">
          <Truck className="w-12 h-12 text-green-600 mx-auto mb-2" />
          <p className="font-medium text-green-700">Nenhuma entrega pendente</p>
          <p className="text-sm text-green-600">Você está em dia! 🎉</p>
        </CardContent>
      </Card>
    );
  }

  const abrirGPS = () => {
    const end = proximaEntrega.endereco_entrega_completo;
    if (!end) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      `${end.logradouro}, ${end.numero}, ${end.cidade} - ${end.estado}`
    )}`;
    window.open(url, '_blank');
  };

  return (
    <Card className="w-full border-2 border-blue-500 shadow-lg">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardTitle className="flex items-center gap-2 text-base">
          <Truck className="w-5 h-5" />
          Próxima Entrega
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3 pt-4">
        <div>
          <p className="text-lg font-bold text-slate-900">{proximaEntrega.cliente_nome}</p>
          <div className="flex items-center gap-1 mt-1 text-sm text-slate-600">
            <MapPin className="w-3 h-3" />
            {proximaEntrega.endereco_entrega_completo?.cidade}/{proximaEntrega.endereco_entrega_completo?.estado}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={
            proximaEntrega.prioridade === 'Urgente' ? 'bg-red-600' :
            proximaEntrega.prioridade === 'Alta' ? 'bg-orange-600' : 'bg-blue-600'
          }>
            {proximaEntrega.prioridade}
          </Badge>
          {proximaEntrega.data_previsao && (
            <Badge variant="outline">
              {new Date(proximaEntrega.data_previsao).toLocaleDateString('pt-BR')}
            </Badge>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onVerDetalhes?.(proximaEntrega)}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            Ver Detalhes
          </Button>
          <Button
            onClick={abrirGPS}
            className="flex-1 bg-green-600 hover:bg-green-700"
            size="sm"
          >
            <Navigation className="w-4 h-4 mr-1" />
            Navegar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}