import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Truck
} from 'lucide-react';

export default function RastreamentoRealTime({ romaneioId }) {
  const [posicaoAtual, setPosicaoAtual] = useState(null);

  const { data: romaneio, isLoading } = useQuery({
    queryKey: ['romaneio', romaneioId],
    queryFn: async () => {
      const lista = await base44.entities.RomaneioEntrega.list();
      return lista.find(r => r.id === romaneioId);
    },
    refetchInterval: 30000 // Atualiza a cada 30 segundos
  });

  useEffect(() => {
    if (romaneio?.rastreamento?.length > 0) {
      setPosicaoAtual(romaneio.rastreamento[romaneio.rastreamento.length - 1]);
    }
  }, [romaneio]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  const calcularStatusEntregas = () => {
    const entregas = romaneio?.entregas || [];
    const entregues = entregas.filter(e => e.status_entrega === 'Entregue').length;
    const emRota = entregas.filter(e => e.status_entrega === 'Em Rota').length;
    const pendentes = entregas.filter(e => e.status_entrega === 'Pendente').length;
    const recusadas = entregas.filter(e => e.status_entrega === 'Recusada').length;

    return { total: entregas.length, entregues, emRota, pendentes, recusadas };
  };

  const stats = calcularStatusEntregas();

  return (
    <div className="w-full h-full flex flex-col p-6 space-y-6 overflow-auto">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Rastreamento em Tempo Real</h2>
            <p className="text-sm text-slate-600">
              Romaneio {romaneio?.numero_romaneio} • {romaneio?.motorista_nome}
            </p>
          </div>

          <Badge variant={
            romaneio?.status === 'Concluído' ? 'success' :
            romaneio?.status === 'Em Execução' ? 'default' :
            'secondary'
          } className="text-base px-4 py-2">
            {romaneio?.status}
          </Badge>
        </div>

        {/* Métricas de Entregas */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Entregas</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Entregues</p>
                  <p className="text-2xl font-bold text-green-600">{stats.entregues}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Em Rota</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.emRota}</p>
                </div>
                <Truck className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Recusadas</p>
                  <p className="text-2xl font-bold text-red-600">{stats.recusadas}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mapa Simulado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Localização Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Navigation className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">Mapa de Rastreamento</p>
              {posicaoAtual && (
                <div className="mt-3 text-sm">
                  <p className="text-slate-600">
                    Lat: {posicaoAtual.latitude?.toFixed(6)} • 
                    Lng: {posicaoAtual.longitude?.toFixed(6)}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    Velocidade: {posicaoAtual.velocidade} km/h
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Entregas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Entregas do Romaneio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {romaneio?.entregas?.map((entrega, idx) => (
            <div key={idx} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {entrega.ordem_sequencia || idx + 1}
                  </div>
                  <div>
                    <p className="font-medium">{entrega.cliente_nome}</p>
                    <p className="text-sm text-slate-600">Pedido: {entrega.numero_pedido}</p>
                  </div>
                </div>

                <Badge variant={
                  entrega.status_entrega === 'Entregue' ? 'success' :
                  entrega.status_entrega === 'Em Rota' ? 'default' :
                  entrega.status_entrega === 'Recusada' ? 'destructive' :
                  'secondary'
                }>
                  {entrega.status_entrega}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-600">Endereço:</p>
                  <p className="font-medium">
                    {entrega.endereco?.logradouro}, {entrega.endereco?.numero}
                  </p>
                  <p className="text-slate-600">
                    {entrega.endereco?.cidade} - {entrega.endereco?.estado}
                  </p>
                </div>

                <div>
                  <p className="text-slate-600">Janela de Entrega:</p>
                  <p className="font-medium">
                    {entrega.janela_entrega?.horario_inicio} - {entrega.janela_entrega?.horario_fim}
                  </p>
                  <p className="text-slate-600">
                    Peso: {entrega.peso_kg}kg • Volumes: {entrega.volumes}
                  </p>
                </div>
              </div>

              {/* Horários Registrados */}
              {(entrega.horario_chegada || entrega.horario_saida) && (
                <div className="mt-3 p-3 bg-green-50 rounded text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    {entrega.horario_chegada && (
                      <div>
                        <p className="text-slate-600">Chegada:</p>
                        <p className="font-medium">{entrega.horario_chegada}</p>
                      </div>
                    )}
                    {entrega.horario_saida && (
                      <div>
                        <p className="text-slate-600">Saída:</p>
                        <p className="font-medium">{entrega.horario_saida}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Ocorrências */}
              {entrega.ocorrencias?.length > 0 && (
                <div className="mt-3 space-y-2">
                  {entrega.ocorrencias.map((ocorrencia, oidx) => (
                    <div key={oidx} className="p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                      <p className="font-medium text-orange-900">{ocorrencia.tipo}</p>
                      <p className="text-xs text-orange-700">{ocorrencia.descricao}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}