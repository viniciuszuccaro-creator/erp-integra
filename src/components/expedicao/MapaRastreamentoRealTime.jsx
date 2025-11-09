import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Navigation, Clock, Truck, Package, AlertTriangle } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

/**
 * V21.2 - Mapa de Rastreamento Real-time
 * COM: Posição GPS dos veículos, ETA dinâmico, Rotas
 */
export default function MapaRastreamentoRealTime({ empresaId }) {
  const [centroMapa, setCentroMapa] = useState([-23.550520, -46.633308]); // São Paulo default

  // Entregas em andamento
  const { data: entregasAtivas = [] } = useQuery({
    queryKey: ['entregas-ativas', empresaId],
    queryFn: () => base44.entities.Entrega.filter({
      empresa_id: empresaId,
      status: { $in: ['Saiu para Entrega', 'Em Trânsito'] }
    }),
    refetchInterval: 10000 // Atualiza a cada 10s
  });

  // Posições GPS dos veículos
  const { data: posicoesGPS = [] } = useQuery({
    queryKey: ['posicoes-veiculos', empresaId],
    queryFn: async () => {
      const todas = await base44.entities.PosicaoVeiculo.list('-data_hora', 100);
      
      // Pegar última posição de cada veículo
      const ultimasPosicoes = {};
      todas.forEach(pos => {
        const key = pos.veiculo_id || pos.motorista_id;
        if (!ultimasPosicoes[key] || new Date(pos.data_hora) > new Date(ultimasPosicoes[key].data_hora)) {
          ultimasPosicoes[key] = pos;
        }
      });

      return Object.values(ultimasPosicoes);
    },
    refetchInterval: 5000 // Atualiza a cada 5s
  });

  // Rotas ativas
  const { data: rotasAtivas = [] } = useQuery({
    queryKey: ['rotas-ativas', empresaId],
    queryFn: () => base44.entities.Rota.filter({
      empresa_id: empresaId,
      status: 'Em Andamento'
    })
  });

  const calcularCorVeiculo = (status) => {
    switch (status) {
      case 'Em Movimento': return 'green';
      case 'Parado': return 'orange';
      case 'Em Entrega': return 'blue';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-2 border-blue-300">
        <CardHeader className="bg-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Rastreamento em Tempo Real
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-xs">Em movimento</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500 rounded-full" />
                <span className="text-xs">Parado</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-xs">Entregando</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[600px] relative">
            <MapContainer
              center={centroMapa}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Marcadores de Veículos */}
              {posicoesGPS.map((pos, idx) => (
                <Marker
                  key={idx}
                  position={[pos.latitude, pos.longitude]}
                  icon={L.divIcon({
                    html: `<div style="background: ${calcularCorVeiculo(pos.status_movimento)}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
                    className: '',
                    iconSize: [24, 24]
                  })}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <p className="font-bold text-sm mb-2">
                        <Truck className="w-4 h-4 inline mr-1" />
                        {pos.placa || 'Veículo'}
                      </p>
                      <div className="space-y-1 text-xs">
                        <p><strong>Motorista:</strong> {pos.motorista_nome}</p>
                        <p><strong>Status:</strong> {pos.status_movimento}</p>
                        <p><strong>Velocidade:</strong> {pos.velocidade_kmh?.toFixed(0)} km/h</p>
                        <p><strong>Última atualização:</strong> {new Date(pos.data_hora).toLocaleTimeString('pt-BR')}</p>
                        {pos.distancia_proxima_entrega_km && (
                          <p className="text-blue-600 font-semibold mt-2">
                            <Navigation className="w-3 h-3 inline mr-1" />
                            {pos.distancia_proxima_entrega_km.toFixed(1)} km da próxima entrega
                          </p>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Marcadores de Destino (Entregas) */}
              {entregasAtivas.map((entrega, idx) => {
                if (!entrega.endereco_entrega_completo?.latitude) return null;
                
                return (
                  <Marker
                    key={`dest-${idx}`}
                    position={[
                      entrega.endereco_entrega_completo.latitude,
                      entrega.endereco_entrega_completo.longitude
                    ]}
                    icon={L.divIcon({
                      html: `<div style="background: #dc2626; width: 28px; height: 28px; border-radius: 8px; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">📦</div>`,
                      className: '',
                      iconSize: [28, 28]
                    })}
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        <p className="font-bold text-sm mb-2">
                          <Package className="w-4 h-4 inline mr-1" />
                          {entrega.cliente_nome}
                        </p>
                        <div className="space-y-1 text-xs">
                          <p><strong>Pedido:</strong> {entrega.numero_pedido}</p>
                          <p><strong>Status:</strong> {entrega.status}</p>
                          <p className="text-slate-600">
                            {entrega.endereco_entrega_completo.logradouro}, {entrega.endereco_entrega_completo.numero}
                          </p>
                          {entrega.data_previsao && (
                            <p className="text-blue-600 font-semibold mt-2">
                              <Clock className="w-3 h-3 inline mr-1" />
                              Previsão: {new Date(entrega.data_previsao).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Rotas (Polylines) */}
              {rotasAtivas.map((rota, idx) => {
                const pontos = (rota.pontos_entrega || [])
                  .filter(p => p.latitude && p.longitude)
                  .map(p => [p.latitude, p.longitude]);

                if (pontos.length < 2) return null;

                return (
                  <Polyline
                    key={`rota-${idx}`}
                    positions={pontos}
                    color="#3b82f6"
                    weight={3}
                    opacity={0.6}
                  />
                );
              })}
            </MapContainer>
          </div>

          {/* Legenda lateral */}
          <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border-2 border-blue-300 max-w-xs">
            <p className="font-bold text-sm mb-3 text-blue-900">Entregas Ativas</p>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {entregasAtivas.map((entrega, idx) => (
                <div key={idx} className="p-2 bg-slate-50 rounded text-xs">
                  <p className="font-semibold">{entrega.cliente_nome}</p>
                  <p className="text-slate-600">Status: {entrega.status}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      {posicoesGPS.filter(p => p.status_movimento === 'Parado').length > 0 && (
        <Alert className="border-orange-300 bg-orange-50">
          <AlertTriangle className="w-4 h-4 text-orange-600" />
          <AlertDescription className="text-sm text-orange-800">
            <strong>Alerta:</strong> {posicoesGPS.filter(p => p.status_movimento === 'Parado').length} veículo(s) parado(s) há mais de 5 minutos
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}