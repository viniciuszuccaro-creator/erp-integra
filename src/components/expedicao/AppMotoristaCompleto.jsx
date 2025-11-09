import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Truck,
  MapPin,
  Navigation,
  CheckCircle,
  Clock,
  AlertTriangle,
  Phone,
  Map
} from "lucide-react";
import AppMotoristaComprovante from "./AppMotoristaComprovante";

/**
 * V21.2 - App Motorista Completo
 * COM: Lista de Entregas, GPS Automático, Navegação, Comprovante
 */
export default function AppMotoristaCompleto({ motoristaId }) {
  const [posicaoAtual, setPosicaoAtual] = useState(null);
  const [entregaSelecionada, setEntregaSelecionada] = useState(null);
  const queryClient = useQueryClient();

  // Buscar entregas do motorista
  const { data: entregasHoje = [] } = useQuery({
    queryKey: ['entregas-motorista', motoristaId],
    queryFn: () => base44.entities.Entrega.filter({
      motorista_id: motoristaId,
      data_saida: new Date().toISOString().split('T')[0]
    }, 'data_previsao'),
    refetchInterval: 15000
  });

  // V21.2: Envio automático de posição GPS
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setPosicaoAtual({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          precisao: position.coords.accuracy,
          velocidade: position.coords.speed || 0
        });
      },
      (error) => console.error('Erro GPS:', error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Enviar posição a cada 30s
  const enviarPosicaoMutation = useMutation({
    mutationFn: async (dados) => {
      const entregaAtual = entregasHoje.find(e => e.status === 'Saiu para Entrega');
      
      return base44.entities.PosicaoVeiculo.create({
        entrega_id: entregaAtual?.id,
        romaneio_id: entregaAtual?.romaneio_id,
        veiculo_id: entregaAtual?.veiculo_id,
        placa: entregaAtual?.placa,
        motorista_id: motoristaId,
        motorista_nome: entregaAtual?.motorista,
        data_hora: new Date().toISOString(),
        latitude: dados.latitude,
        longitude: dados.longitude,
        precisao_metros: dados.precisao,
        velocidade_kmh: (dados.velocidade || 0) * 3.6, // m/s → km/h
        status_movimento: dados.velocidade > 0.5 ? 'Em Movimento' : 'Parado',
        bateria_nivel: navigator.getBattery ? (await navigator.getBattery()).level * 100 : 100,
        conectividade: navigator.connection?.effectiveType || '4G',
        sincronizado: true
      });
    }
  });

  useEffect(() => {
    if (!posicaoAtual) return;

    const interval = setInterval(() => {
      enviarPosicaoMutation.mutate(posicaoAtual);
    }, 30000); // 30s

    return () => clearInterval(interval);
  }, [posicaoAtual]);

  const iniciarEntrega = async (entrega) => {
    await base44.entities.Entrega.update(entrega.id, {
      status: 'Saiu para Entrega',
      data_saida: new Date().toISOString(),
      historico_status: [
        ...(entrega.historico_status || []),
        {
          status: 'Saiu para Entrega',
          data_hora: new Date().toISOString(),
          usuario: 'App Motorista',
          localizacao: posicaoAtual
        }
      ]
    });

    queryClient.invalidateQueries({ queryKey: ['entregas-motorista'] });
    
    // Abrir Google Maps
    if (entrega.endereco_entrega_completo?.latitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${entrega.endereco_entrega_completo.latitude},${entrega.endereco_entrega_completo.longitude}`;
      window.open(url, '_blank');
    }
  };

  const entregaPendente = entregasHoje.find(e => 
    e.status === 'Pronto para Expedir' || e.status === 'Aguardando Separação'
  );
  
  const entregaEmAndamento = entregasHoje.find(e => 
    e.status === 'Saiu para Entrega' || e.status === 'Em Trânsito'
  );

  const entregasConcluidas = entregasHoje.filter(e => e.status === 'Entregue');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">App Motorista</h1>
                <p className="text-blue-100 text-sm">v21.2 - GPS Automático</p>
              </div>
              <Truck className="w-12 h-12" />
            </div>

            {posicaoAtual && (
              <div className="mt-4 p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                <p className="text-xs text-blue-100 mb-1">📍 GPS Ativo</p>
                <p className="text-sm font-mono">
                  {posicaoAtual.latitude.toFixed(6)}, {posicaoAtual.longitude.toFixed(6)}
                </p>
                <p className="text-xs text-blue-100 mt-1">
                  ⚡ {posicaoAtual.velocidade.toFixed(0)} m/s • Precisão: {posicaoAtual.precisao.toFixed(0)}m
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Entrega em Andamento */}
        {entregaEmAndamento && (
          <Card className="border-2 border-green-300 bg-green-50">
            <CardHeader className="bg-green-100">
              <CardTitle className="text-base flex items-center gap-2">
                <Navigation className="w-5 h-5 text-green-600" />
                Entrega em Andamento
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div>
                <p className="font-bold text-lg">{entregaEmAndamento.cliente_nome}</p>
                <p className="text-sm text-slate-600">
                  Pedido: {entregaEmAndamento.numero_pedido}
                </p>
              </div>

              <div className="p-3 bg-white rounded-lg border">
                <p className="text-xs text-slate-500 mb-1">Endereço:</p>
                <p className="text-sm font-semibold">
                  {entregaEmAndamento.endereco_entrega_completo?.logradouro}, {entregaEmAndamento.endereco_entrega_completo?.numero}
                </p>
                <p className="text-xs text-slate-600">
                  {entregaEmAndamento.endereco_entrega_completo?.bairro} - {entregaEmAndamento.endereco_entrega_completo?.cidade}
                </p>
              </div>

              {entregaEmAndamento.contato_entrega && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <div className="text-xs">
                    <p className="font-semibold">{entregaEmAndamento.contato_entrega.nome}</p>
                    <p className="text-slate-600">{entregaEmAndamento.contato_entrega.telefone}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${entregaEmAndamento.endereco_entrega_completo?.latitude},${entregaEmAndamento.endereco_entrega_completo?.longitude}`;
                    window.open(url, '_blank');
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Map className="w-4 h-4 mr-1" />
                  Navegar
                </Button>
                <Button
                  size="sm"
                  onClick={() => setEntregaSelecionada(entregaEmAndamento)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Confirmar Entrega
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Próximas Entregas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Entregas do Dia ({entregasHoje.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {entregasHoje.map((entrega, idx) => (
              <Card 
                key={entrega.id} 
                className={`border ${
                  entrega.status === 'Entregue' ? 'border-green-300 bg-green-50' :
                  entrega.status === 'Saiu para Entrega' ? 'border-blue-300 bg-blue-50' :
                  'border-slate-200'
                }`}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{entrega.cliente_nome}</p>
                        <p className="text-xs text-slate-600">
                          {entrega.endereco_entrega_completo?.cidade}
                        </p>
                      </div>
                    </div>
                    <Badge className={
                      entrega.status === 'Entregue' ? 'bg-green-600' :
                      entrega.status === 'Saiu para Entrega' ? 'bg-blue-600' :
                      'bg-orange-600'
                    }>
                      {entrega.status}
                    </Badge>
                  </div>

                  {entrega.status === 'Pronto para Expedir' && !entregaEmAndamento && (
                    <Button
                      size="sm"
                      onClick={() => iniciarEntrega(entrega)}
                      className="w-full mt-3 bg-green-600 hover:bg-green-700"
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      Iniciar Entrega
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}

            {entregasHoje.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <CheckCircle className="w-16 h-16 mx-auto mb-3" />
                <p>Nenhuma entrega agendada para hoje</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo do Dia */}
        <Card className="border-2 border-purple-300 bg-purple-50">
          <CardContent className="p-4">
            <p className="text-sm font-bold text-purple-900 mb-3">📊 Resumo do Dia</p>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="p-2 bg-white rounded">
                <p className="text-xs text-slate-500">Total</p>
                <p className="font-bold text-lg">{entregasHoje.length}</p>
              </div>
              <div className="p-2 bg-green-100 rounded">
                <p className="text-xs text-green-700">Entregues</p>
                <p className="font-bold text-lg text-green-600">{entregasConcluidas.length}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded">
                <p className="text-xs text-orange-700">Pendentes</p>
                <p className="font-bold text-lg text-orange-600">
                  {entregasHoje.length - entregasConcluidas.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal Comprovante */}
        {entregaSelecionada && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <AppMotoristaComprovante
                entrega={entregaSelecionada}
                onConcluir={() => {
                  setEntregaSelecionada(null);
                  queryClient.invalidateQueries({ queryKey: ['entregas-motorista'] });
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}