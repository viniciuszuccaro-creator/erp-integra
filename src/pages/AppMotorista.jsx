import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, MapPin, CheckCircle2, Navigation, Camera, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import CapturaPODMobile from '@/components/logistica/CapturaPODMobile';
import { useUser } from '@/components/lib/UserContext';
import ListaEntregasMotorista from '@/components/logistica/ListaEntregasMotorista';
import FluxoEntregaCompleto from '@/components/logistica/FluxoEntregaCompleto';
import LogisticaReversaForm from '@/components/logistica/LogisticaReversaForm';

/**
 * ETAPA 3: App do Motorista (Mobile-First)
 * Lista entregas → Navegação GPS → Atualização status → Coleta POD
 */

export default function AppMotorista() {
  const { user } = useUser();
  const [entregaSelecionada, setEntregaSelecionada] = useState(null);
  const [modoPOD, setModoPOD] = useState(false);
  const [modoFluxo, setModoFluxo] = useState(false);
  const [modoReversa, setModoReversa] = useState(false);
  const queryClient = useQueryClient();

  // Buscar entregas do motorista
  const { data: entregas = [], isLoading } = useQuery({
    queryKey: ['entregas', 'motorista', user?.id],
    queryFn: async () => {
      // Encontrar colaborador vinculado ao usuário
      const colaboradores = await base44.entities.Colaborador.filter({
        vincular_a_usuario_id: user?.id
      });

      if (!colaboradores || colaboradores.length === 0) {
        return [];
      }

      const colaborador = colaboradores[0];

      // Buscar entregas do motorista
      return base44.entities.Entrega.filter({
        motorista_id: colaborador.id,
        status: { $in: ['Saiu para Entrega', 'Em Trânsito', 'Pronto para Expedir'] }
      }, '-data_previsao', 50);
    },
    enabled: !!user?.id,
    refetchInterval: 15000 // Atualiza a cada 15s
  });

  const atualizarStatusMutation = useMutation({
    mutationFn: async ({ entrega_id, novo_status }) => {
      // Capturar geolocalização
      let lat = null, lng = null;
      if (navigator.geolocation) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              lat = position.coords.latitude;
              lng = position.coords.longitude;
              resolve();
            },
            () => resolve()
          );
        });
      }

      await base44.functions.invoke('notificarStatusEntrega', {
        entrega_id,
        novo_status,
        latitude: lat,
        longitude: lng
      });
    },
    onSuccess: () => {
      toast.success('Status atualizado!');
      queryClient.invalidateQueries(['entregas']);
    }
  });

  const navegarGPS = (entrega) => {
    const end = entrega.endereco_entrega_completo;
    if (!end) {
      toast.error('Endereço não disponível');
      return;
    }

    const endereco = `${end.logradouro}, ${end.numero}, ${end.cidade} - ${end.estado}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(endereco)}`;
    window.open(url, '_blank');
  };

  if (modoPOD && entregaSelecionada) {
    return (
      <CapturaPODMobile
        entrega={entregaSelecionada}
        onConcluir={() => {
          setModoPOD(false);
          setEntregaSelecionada(null);
          queryClient.invalidateQueries(['entregas']);
        }}
      />
    );
  }

  if (modoFluxo && entregaSelecionada) {
    return (
      <FluxoEntregaCompleto
        entrega={entregaSelecionada}
        onFechar={() => {
          setModoFluxo(false);
          setEntregaSelecionada(null);
          queryClient.invalidateQueries(['entregas']);
        }}
      />
    );
  }

  if (modoReversa && entregaSelecionada) {
    return (
      <LogisticaReversaForm
        entrega={entregaSelecionada}
        onConcluir={() => {
          setModoReversa(false);
          setEntregaSelecionada(null);
          queryClient.invalidateQueries(['entregas']);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 p-4 pb-20">
      {/* Header */}
      <div className="text-white mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Truck className="w-7 h-7" />
          Minhas Entregas
        </h1>
        <p className="text-blue-100 text-sm">
          Olá, {user?.full_name || 'Motorista'}
        </p>
      </div>

      {/* ETAPA 3: Lista Otimizada */}
      <ListaEntregasMotorista
        onVerDetalhes={(entrega) => {
          setEntregaSelecionada(entrega);
          setModoFluxo(true);
        }}
        onIniciar={(entrega) => {
          atualizarStatusMutation.mutate({
            entrega_id: entrega.id,
            novo_status: 'Saiu para Entrega'
          });
        }}
      />

      {/* Lista Original (Backup) */}
      <div className="space-y-3 hidden">
        {isLoading && (
          <Card>
            <CardContent className="py-8 text-center text-slate-500">
              Carregando...
            </CardContent>
          </Card>
        )}

        {entregas.map(entrega => (
          <Card key={entrega.id} className="shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-bold text-lg">{entrega.cliente_nome}</p>
                  <p className="text-sm text-slate-600">
                    {entrega.endereco_entrega_completo?.logradouro}, {entrega.endereco_entrega_completo?.numero}
                  </p>
                  <p className="text-xs text-slate-500">
                    {entrega.endereco_entrega_completo?.cidade}/{entrega.endereco_entrega_completo?.estado}
                  </p>
                </div>
                <Badge className={
                  entrega.prioridade === 'Urgente' ? 'bg-red-600' :
                  entrega.prioridade === 'Alta' ? 'bg-orange-600' : 'bg-blue-600'
                }>
                  {entrega.prioridade}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Informações */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-slate-600">Previsão:</span>
                  <p className="font-medium">
                    {entrega.data_previsao ? new Date(entrega.data_previsao).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600">Volumes:</span>
                  <p className="font-medium">{entrega.volumes || 1}</p>
                </div>
              </div>

              {/* Status Atual */}
              <div className="bg-slate-50 p-2 rounded">
                <Badge className="bg-blue-600">{entrega.status}</Badge>
              </div>

              {/* Ações */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => navegarGPS(entrega)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Navigation className="w-4 h-4 mr-1" />
                  Navegar
                </Button>
                <Button
                  onClick={() => {
                    setEntregaSelecionada(entrega);
                    setModoPOD(true);
                  }}
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Camera className="w-4 h-4 mr-1" />
                  Entregar
                </Button>
              </div>

              {/* Botões de Status */}
              <div className="flex gap-2">
                {entrega.status === 'Pronto para Expedir' && (
                  <Button
                    onClick={() => atualizarStatusMutation.mutate({
                      entrega_id: entrega.id,
                      novo_status: 'Saiu para Entrega'
                    })}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Iniciar Entrega
                  </Button>
                )}
                {['Saiu para Entrega', 'Em Trânsito'].includes(entrega.status) && (
                  <Button
                    onClick={() => atualizarStatusMutation.mutate({
                      entrega_id: entrega.id,
                      novo_status: 'Entrega Frustrada'
                    })}
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Frustrada
                  </Button>
                )}
              </div>

              {/* Contato */}
              {entrega.contato_entrega?.telefone && (
                <a
                  href={`tel:${entrega.contato_entrega.telefone}`}
                  className="block text-center text-sm text-blue-600 underline"
                >
                  📞 {entrega.contato_entrega.telefone}
                </a>
              )}
            </CardContent>
          </Card>
        ))}

        {entregas.length === 0 && !isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-slate-600">Nenhuma entrega pendente!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}