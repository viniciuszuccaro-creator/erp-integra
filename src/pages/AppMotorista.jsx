import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, CheckCircle2, Navigation, Camera, AlertCircle, Menu } from 'lucide-react';
import { toast } from 'sonner';
import CapturaPODMobile from '@/components/logistica/CapturaPODMobile';
import { useUser } from '@/components/lib/UserContext';
import ListaEntregasMotorista from '@/components/logistica/ListaEntregasMotorista';
import FluxoEntregaCompleto from '@/components/logistica/FluxoEntregaCompleto';
import LogisticaReversaForm from '@/components/logistica/LogisticaReversaForm';
import WidgetProximaEntrega from '@/components/logistica/WidgetProximaEntrega';
import PainelMetricasRealtime from '@/components/logistica/PainelMetricasRealtime';
import ControleAcessoLogistica from '@/components/logistica/ControleAcessoLogistica';

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
    <ControleAcessoLogistica motoristasOnly={true}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        {/* ETAPA 3: Header Aprimorado */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Truck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">App Motorista V3.0</h1>
                <p className="text-blue-200 text-sm">ETAPA 3 • Real-time</p>
              </div>
            </div>
            <Badge className="bg-green-500 text-white text-base px-3 py-1">
              {entregas.length}
            </Badge>
          </div>

          {/* ETAPA 3: Métricas Real-time */}
          <PainelMetricasRealtime />
        </div>

        {/* ETAPA 3: Próxima Entrega Destacada */}
        <div className="mb-4">
          <WidgetProximaEntrega
            onVerDetalhes={(entrega) => {
              setEntregaSelecionada(entrega);
              setModoFluxo(true);
            }}
          />
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
      </div>
    </ControleAcessoLogistica>
  );
}