import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, MapPin, Navigation } from 'lucide-react';
import TimelineEntregaVisual from '@/components/logistica/TimelineEntregaVisual';

/**
 * ETAPA 3: Widget de Rastreamento para Portal
 * Componente reutilizável e compacto
 */

export default function RastreamentoEntregaWidget({ pedido_id }) {
  const { data: entregas = [] } = useQuery({
    queryKey: ['entregas', 'pedido', pedido_id],
    queryFn: () => base44.entities.Entrega.filter({
      pedido_id,
      status: { $nin: ['Cancelado'] }
    }),
    enabled: !!pedido_id,
    refetchInterval: 10000
  });

  if (entregas.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="py-8 text-center text-slate-500">
          <Truck className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhuma entrega programada</p>
        </CardContent>
      </Card>
    );
  }

  const entrega = entregas[0]; // Primeira entrega

  const abrirGPS = () => {
    const end = entrega.endereco_entrega_completo;
    if (!end) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      `${end.logradouro}, ${end.numero}, ${end.cidade} - ${end.estado}`
    )}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="w-5 h-5 text-blue-600" />
            Rastreamento de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Endereço */}
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded">
            <MapPin className="w-5 h-5 text-blue-600 mt-1" />
            <div className="flex-1">
              <p className="font-medium text-sm">
                {entrega.endereco_entrega_completo?.logradouro}, {entrega.endereco_entrega_completo?.numero}
              </p>
              <p className="text-xs text-slate-600">
                {entrega.endereco_entrega_completo?.bairro} - {entrega.endereco_entrega_completo?.cidade}/{entrega.endereco_entrega_completo?.estado}
              </p>
            </div>
          </div>

          {/* Motorista */}
          {entrega.motorista && (
            <div className="text-sm">
              <span className="text-slate-600">Motorista:</span>
              <span className="font-medium ml-2">{entrega.motorista}</span>
              {entrega.motorista_telefone && (
                <p className="text-xs text-slate-500">📞 {entrega.motorista_telefone}</p>
              )}
            </div>
          )}

          {/* Navegação */}
          <Button
            onClick={abrirGPS}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Abrir no Google Maps
          </Button>
        </CardContent>
      </Card>

      {/* Timeline */}
      <TimelineEntregaVisual entrega={entrega} />
    </div>
  );
}