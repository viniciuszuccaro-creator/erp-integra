import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Package,
  AlertCircle,
  CheckCircle,
  Navigation,
  TrendingUp
} from 'lucide-react';
import { useWindow } from '@/components/lib/useWindow';
import { usePermissions } from '@/components/lib/usePermissions';
import { toast } from 'sonner';

export default function RomaneioInteligente() {
  const queryClient = useQueryClient();
  const { openWindow } = useWindow();
  const { hasGranularPermission } = usePermissions();

  // Buscar Romaneios
  const { data: romaneios = [], isLoading } = useQuery({
    queryKey: ['romaneios_entrega'],
    queryFn: () => base44.entities.RomaneioEntrega.list()
  });

  // Buscar Entregas pendentes (sem romaneio)
  const { data: entregasPendentes = [] } = useQuery({
    queryKey: ['entregas_pendentes'],
    queryFn: async () => {
      const pedidos = await base44.entities.Pedido.list();
      return pedidos.filter(p => 
        p.status === 'Pronto para Faturar' || 
        p.status === 'Faturado'
      );
    }
  });

  const abrirNovoRomaneio = () => {
    if (!hasGranularPermission('logistica', 'criar_romaneio')) {
      toast.error('Sem permissão para criar romaneios');
      return;
    }

    openWindow(
      () => import('@/components/logistica/CriarRomaneioForm'),
      { entregasPendentes },
      {
        title: 'Novo Romaneio com IA de Roteirização',
        width: 1400,
        height: 900
      }
    );
  };

  const abrirRastreamento = (romaneio) => {
    openWindow(
      () => import('@/components/logistica/RastreamentoRealTime'),
      { romaneioId: romaneio.id },
      {
        title: `Rastreamento - ${romaneio.numero_romaneio}`,
        width: 1200,
        height: 800
      }
    );
  };

  const calcularStatusGeral = () => {
    const planejados = romaneios.filter(r => r.status === 'Planejado').length;
    const emExecucao = romaneios.filter(r => r.status === 'Em Execução').length;
    const concluidos = romaneios.filter(r => r.status === 'Concluído').length;
    
    return { planejados, emExecucao, concluidos };
  };

  const stats = calcularStatusGeral();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Romaneios & Logística</h1>
            <p className="text-sm text-slate-600">Etapa 6 - Logística & Expedição com IA</p>
          </div>
          
          <div className="flex gap-2">
            {hasGranularPermission('logistica', 'criar_romaneio') && (
              <Button
                onClick={abrirNovoRomaneio}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Truck className="w-4 h-4 mr-2" />
                Novo Romaneio com IA
              </Button>
            )}
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Planejados</p>
                  <p className="text-2xl font-bold">{stats.planejados}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Em Rota</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.emExecucao}</p>
                </div>
                <Navigation className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Concluídos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.concluidos}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Entregas Pendentes</p>
                  <p className="text-2xl font-bold text-orange-600">{entregasPendentes.length}</p>
                </div>
                <Package className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Taxa no Prazo</p>
                  <p className="text-2xl font-bold text-emerald-600">94%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lista de Romaneios */}
      <div className="flex-1 overflow-auto">
        <div className="grid gap-4">
          {romaneios.map(romaneio => (
            <Card key={romaneio.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Romaneio {romaneio.numero_romaneio}
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      Motorista: {romaneio.motorista_nome} • Veículo: {romaneio.veiculo_placa}
                    </p>
                  </div>

                  <Badge
                    variant={
                      romaneio.status === 'Concluído' ? 'success' :
                      romaneio.status === 'Em Execução' ? 'default' :
                      'secondary'
                    }
                  >
                    {romaneio.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Rota Otimizada por IA */}
                {romaneio.rota_otimizada && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Navigation className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        Rota Otimizada por IA
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-slate-600">Distância Total</p>
                        <p className="font-semibold">{romaneio.rota_otimizada.distancia_total_km?.toFixed(1)} km</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Tempo Estimado</p>
                        <p className="font-semibold">{romaneio.rota_otimizada.tempo_total_minutos} min</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Custo Frete</p>
                        <p className="font-semibold">
                          R$ {romaneio.rota_otimizada.custo_total_frete?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Entregas */}
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Entregas ({romaneio.entregas?.length || 0})
                  </p>
                  <div className="space-y-2">
                    {romaneio.entregas?.slice(0, 3).map((entrega, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                            {entrega.ordem_sequencia || idx + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{entrega.cliente_nome}</p>
                            <p className="text-xs text-slate-600">
                              {entrega.endereco?.cidade} - {entrega.endereco?.estado}
                            </p>
                          </div>
                        </div>

                        <Badge
                          variant={
                            entrega.status_entrega === 'Entregue' ? 'success' :
                            entrega.status_entrega === 'Em Rota' ? 'default' :
                            entrega.status_entrega === 'Recusada' ? 'destructive' :
                            'secondary'
                          }
                          className="text-xs"
                        >
                          {entrega.status_entrega || 'Pendente'}
                        </Badge>
                      </div>
                    ))}

                    {romaneio.entregas?.length > 3 && (
                      <p className="text-xs text-slate-500 text-center">
                        + {romaneio.entregas.length - 3} entregas...
                      </p>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => abrirRastreamento(romaneio)}
                    className="flex-1"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Rastrear em Tempo Real
                  </Button>

                  {hasGranularPermission('logistica', 'confirmar_entrega') && (
                    <Button
                      size="sm"
                      onClick={() => openWindow(
                        () => import('@/components/logistica/ConfirmarEntregas'),
                        { romaneioId: romaneio.id },
                        { title: 'Confirmar Entregas', width: 1000, height: 700 }
                      )}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirmar Entregas
                    </Button>
                  )}
                </div>

                {/* Logística Reversa */}
                {romaneio.logistica_reversa?.ativa && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-900">Logística Reversa Ativa</p>
                      <p className="text-xs text-red-700 mt-1">
                        {romaneio.logistica_reversa.motivo}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        Status: {romaneio.logistica_reversa.status_resolucao || 'Pendente'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {romaneios.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">Nenhum romaneio criado</p>
                {hasGranularPermission('logistica', 'criar_romaneio') && (
                  <Button onClick={abrirNovoRomaneio}>
                    Criar Primeiro Romaneio
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}