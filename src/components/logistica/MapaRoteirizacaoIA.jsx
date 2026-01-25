import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Route } from 'lucide-react';

/**
 * ETAPA 3: Mapa de Roteirização com IA
 * Visualização da sequência otimizada
 */

export default function MapaRoteirizacaoIA({ rota, entregas = [] }) {
  const abrirRotaCompleta = () => {
    if (!entregas || entregas.length === 0) return;

    // Montar URL Google Maps com múltiplas paradas
    const waypoints = entregas
      .map(e => {
        const end = e.endereco_entrega_completo;
        if (!end) return null;
        return `${end.logradouro}, ${end.numero}, ${end.cidade} - ${end.estado}`;
      })
      .filter(Boolean)
      .map(addr => encodeURIComponent(addr))
      .join('|');

    const url = `https://www.google.com/maps/dir/?api=1&waypoints=${waypoints}&travelmode=driving`;
    window.open(url, '_blank');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Route className="w-5 h-5 text-blue-600" />
          Rota Otimizada
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Métricas */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-blue-50 rounded">
            <p className="text-lg font-bold text-blue-700">{entregas.length}</p>
            <p className="text-xs text-blue-600">Paradas</p>
          </div>
          <div className="p-2 bg-green-50 rounded">
            <p className="text-lg font-bold text-green-700">
              {rota?.distancia_total_km?.toFixed(1) || '-'}
            </p>
            <p className="text-xs text-green-600">KM</p>
          </div>
          <div className="p-2 bg-purple-50 rounded">
            <p className="text-lg font-bold text-purple-700">
              {rota?.tempo_estimado_min ? Math.round(rota.tempo_estimado_min) : '-'}
            </p>
            <p className="text-xs text-purple-600">Min</p>
          </div>
        </div>

        {/* Sequência */}
        <div className="space-y-2 max-h-60 overflow-auto">
          {entregas.map((entrega, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2 bg-slate-50 rounded">
              <Badge className="bg-blue-600 w-8 h-8 flex items-center justify-center text-sm">
                {idx + 1}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{entrega.cliente_nome}</p>
                <p className="text-xs text-slate-600 truncate">
                  {entrega.endereco_entrega_completo?.cidade}
                </p>
              </div>
              <MapPin className="w-4 h-4 text-slate-400" />
            </div>
          ))}
        </div>

        {/* Ação */}
        <Button
          onClick={abrirRotaCompleta}
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={entregas.length === 0}
        >
          <Navigation className="w-4 h-4 mr-2" />
          Abrir Rota no Maps
        </Button>
      </CardContent>
    </Card>
  );
}