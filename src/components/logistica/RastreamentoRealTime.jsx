import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, CheckCircle, Navigation, Truck } from 'lucide-react';
import { format } from 'date-fns';

export default function RastreamentoRealTime({ romaneioId }) {
  const [posicaoAtual, setPosicaoAtual] = useState(null);

  const { data: romaneio, isLoading } = useQuery({
    queryKey: ['romaneio_rastreamento', romaneioId],
    queryFn: async () => {
      const romaneios = await base44.entities.RomaneioEntrega.list();
      return romaneios.find(r => r.id === romaneioId);
    },
    refetchInterval: 30000 // Atualizar a cada 30s
  });

  useEffect(() => {
    if (romaneio?.rastreamento?.length > 0) {
      setPosicaoAtual(romaneio.rastreamento[romaneio.rastreamento.length - 1]);
    }
  }, [romaneio]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Rastreamento em Tempo Real
            </h1>
            <p className="text-blue-100">Romaneio: {romaneio?.numero_romaneio}</p>
            <p className="text-sm text-blue-200">
              Motorista: {romaneio?.motorista_nome} • Veículo: {romaneio?.veiculo_placa}
            </p>
          </div>

          <Badge className="bg-white text-blue-900">
            {romaneio?.status}
          </Badge>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Coluna 1: Mapa Simulado */}
          <div className="col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Mapa da Rota
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Simulação de Mapa */}
                <div className="bg-slate-100 rounded-lg h-96 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100"></div>
                  
                  <div className="relative z-10 text-center">
                    <Navigation className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
                    <p className="font-semibold text-slate-700 mb-2">Rastreamento Ativo</p>
                    {posicaoAtual && (
                      <div className="space-y-1 text-sm text-slate-600">
                        <p>Lat: {posicaoAtual.latitude?.toFixed(6)}</p>
                        <p>Long: {posicaoAtual.longitude?.toFixed(6)}</p>
                        <p>Velocidade: {posicaoAtual.velocidade || 0} km/h</p>
                        <p className="text-xs mt-2">
                          Última atualização: {format(new Date(posicaoAtual.timestamp), 'HH:mm:ss')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Pontos de Entrega no Mapa Simulado */}
                  {romaneio?.entregas?.map((entrega, idx) => (
                    <div
                      key={idx}
                      className="absolute"
                      style={{
                        top: `${20 + idx * 15}%`,
                        left: `${30 + idx * 10}%`
                      }}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        entrega.status_entrega === 'Entregue' ? 'bg-green-600' :
                        entrega.status_entrega === 'Em Rota' ? 'bg-blue-600 animate-pulse' :
                        'bg-slate-400'
                      }`}>
                        {entrega.ordem_sequencia || idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna 2: Status das Entregas */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Status das Entregas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {romaneio?.entregas?.map((entrega, idx) => (
                    <div key={idx} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                            entrega.status_entrega === 'Entregue' ? 'bg-green-600' :
                            entrega.status_entrega === 'Em Rota' ? 'bg-blue-600' :
                            'bg-slate-400'
                          }`}>
                            {entrega.ordem_sequencia || idx + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{entrega.cliente_nome}</p>
                          </div>
                        </div>
                        
                        {entrega.status_entrega === 'Entregue' && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>

                      <p className="text-xs text-slate-600">
                        {entrega.endereco?.cidade} - {entrega.endereco?.estado}
                      </p>

                      <div className="mt-2">
                        <Badge 
                          variant={
                            entrega.status_entrega === 'Entregue' ? 'success' :
                            entrega.status_entrega === 'Em Rota' ? 'default' :
                            'secondary'
                          }
                          className="text-xs"
                        >
                          {entrega.status_entrega || 'Pendente'}
                        </Badge>
                      </div>

                      {entrega.horario_chegada && (
                        <p className="text-xs text-slate-500 mt-2">
                          Chegada: {format(new Date(entrega.horario_chegada), 'HH:mm')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Timeline de Rastreamento */}
        {romaneio?.rastreamento?.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-600" />
                Histórico de Rastreamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-auto">
                {romaneio.rastreamento.slice().reverse().slice(0, 20).map((ponto, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-2 bg-slate-50 rounded">
                    <span className="text-xs text-slate-500 w-20">
                      {format(new Date(ponto.timestamp), 'HH:mm:ss')}
                    </span>
                    <span className="text-sm flex-1">{ponto.evento || 'Posição atualizada'}</span>
                    <span className="text-xs text-slate-600">
                      {ponto.velocidade || 0} km/h
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}