import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';

/**
 * ETAPA 3: Mapa Simples de Entrega
 * Link direto para Google Maps
 */

export default function MapaEntregaSimples({ entrega }) {
  const abrirMaps = () => {
    const end = entrega.endereco_entrega_completo;
    if (!end) return;

    const endereco = `${end.logradouro}, ${end.numero}, ${end.cidade} - ${end.estado}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(endereco)}`;
    window.open(url, '_blank');
  };

  const verNoMapa = () => {
    const end = entrega.endereco_entrega_completo;
    if (!end || !end.latitude || !end.longitude) return;

    const url = `https://www.google.com/maps/@${end.latitude},${end.longitude},17z`;
    window.open(url, '_blank');
  };

  const end = entrega?.endereco_entrega_completo;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          Localização
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {end && (
          <div className="text-sm space-y-1">
            <p className="font-medium">{end.logradouro}, {end.numero}</p>
            {end.complemento && <p className="text-slate-600">{end.complemento}</p>}
            <p className="text-slate-600">{end.bairro}</p>
            <p className="text-slate-600">{end.cidade}/{end.estado}</p>
            <p className="text-slate-600">CEP: {end.cep}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={abrirMaps}
            size="sm"
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Navigation className="w-3 h-3 mr-1" />
            Navegar
          </Button>
          {end?.latitude && end?.longitude && (
            <Button
              onClick={verNoMapa}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <MapPin className="w-3 h-3 mr-1" />
              Ver Mapa
            </Button>
          )}
        </div>

        {end?.latitude && end?.longitude && (
          <p className="text-xs text-slate-500 text-center">
            {end.latitude.toFixed(5)}, {end.longitude.toFixed(5)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}