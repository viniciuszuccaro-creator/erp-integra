import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Navigation, Clock, Truck, Zap } from 'lucide-react';
import { useRealtimeGPS } from '../lib/useRealtimeData';
import { motion } from 'framer-motion';

/**
 * Mapa de Rastreamento em Tempo Real
 * Atualiza posição GPS a cada 15 segundos
 */
export default function MapaTempoReal({ romaneioId, entregaId }) {
  const { data: posicaoGPS, hasChanges, isLoading } = useRealtimeGPS(romaneioId);
  const [ultimaPosicao, setUltimaPosicao] = useState(null);

  useEffect(() => {
    if (posicaoGPS) {
      setUltimaPosicao(posicaoGPS);
    }
  }, [posicaoGPS]);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-12 text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600">Buscando localização...</p>
        </CardContent>
      </Card>
    );
  }

  if (!posicaoGPS && !ultimaPosicao) {
    return (
      <Card className="border-orange-300 bg-orange-50">
        <CardContent className="p-6 text-center">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-orange-600" />
          <p className="font-semibold text-orange-900">GPS Não Disponível</p>
          <p className="text-sm text-orange-700 mt-1">
            Nenhuma posição registrada para este romaneio/entrega
          </p>
        </CardContent>
      </Card>
    );
  }

  const posicao = posicaoGPS || ultimaPosicao;
  const dataHora = new Date(posicao.data_hora).toLocaleString('pt-BR');
  const tempoDecorrido = Math.floor((new Date() - new Date(posicao.data_hora)) / 1000);

  return (
    <div className="space-y-4">
      {/* Status da Conexão */}
      <Alert className={hasChanges ? 'border-green-300 bg-green-50' : 'border-blue-300 bg-blue-50'}>
        <Zap className={`w-5 h-5 ${hasChanges ? 'text-green-600 animate-pulse' : 'text-blue-600'}`} />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-semibold ${hasChanges ? 'text-green-900' : 'text-blue-900'}`}>
                📡 Rastreamento GPS Ativo
              </p>
              <p className="text-sm text-slate-700">
                Atualiza a cada 15 segundos • Última: {dataHora}
              </p>
            </div>
            <motion.div
              animate={hasChanges ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              <div className={`w-3 h-3 rounded-full ${hasChanges ? 'bg-green-600 animate-ping' : 'bg-blue-600'}`} />
            </motion.div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Card de Posição Atual */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-blue-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-600" />
            Posição Atual
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Dados do Veículo */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-700">
                <Truck className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="font-semibold">{posicao.motorista_nome}</p>
                  <p className="text-sm text-slate-600">Placa: {posicao.placa}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600">Velocidade</p>
                  <p className="text-lg font-bold text-slate-900">
                    {posicao.velocidade_kmh || 0} km/h
                  </p>
                </div>
                
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600">Status</p>
                  <Badge className={
                    posicao.status_movimento === 'Em Movimento' ? 'bg-green-600' :
                    posicao.status_movimento === 'Em Entrega' ? 'bg-blue-600' :
                    posicao.status_movimento === 'Parado' ? 'bg-orange-600' :
                    'bg-slate-600'
                  }>
                    {posicao.status_movimento || 'Parado'}
                  </Badge>
                </div>
              </div>

              {posicao.distancia_proxima_entrega_km && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-blue-900">
                    📍 Próxima Entrega
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {posicao.distancia_proxima_entrega_km.toFixed(1)} km • 
                    ~{posicao.tempo_estimado_proxima_entrega_min} min
                  </p>
                </div>
              )}
            </div>

            {/* Localização */}
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Localização</p>
                <p className="text-sm text-slate-600">
                  {posicao.endereco_aproximado || 'Endereço não disponível'}
                </p>
                {posicao.cidade && (
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {posicao.cidade} - {posicao.estado}
                  </p>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">Coordenadas GPS</p>
                <p className="text-xs font-mono text-slate-700">
                  LAT: {posicao.latitude?.toFixed(6)}
                </p>
                <p className="text-xs font-mono text-slate-700">
                  LNG: {posicao.longitude?.toFixed(6)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Precisão: ±{posicao.precisao_metros || 0}m
                </p>
              </div>

              {/* Link Google Maps */}
              <a
                href={`https://www.google.com/maps?q=${posicao.latitude},${posicao.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <MapPin className="w-4 h-4 inline mr-2" />
                Ver no Google Maps
              </a>
            </div>
          </div>

          {/* Tempo Decorrido */}
          <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Última atualização: há {tempoDecorrido}s
            </div>
            {posicao.bateria_nivel && (
              <div className="flex items-center gap-1">
                🔋 Bateria: {posicao.bateria_nivel}%
              </div>
            )}
            {posicao.conectividade && (
              <Badge variant="outline" className="text-xs">
                {posicao.conectividade}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}