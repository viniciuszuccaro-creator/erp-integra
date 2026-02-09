import React, { Suspense } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Truck, Package, FileText, Route, Activity, BarChart3, Settings, Map, MessageCircle, Camera, Scan, Building2 } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { useWindow } from "@/components/lib/useWindow";
import { useUser } from "@/components/lib/UserContext";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import ProtectedSection from "@/components/security/ProtectedSection";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import HeaderExpedicaoCompacto from "@/components/expedicao/expedicao-launchpad/HeaderExpedicaoCompacto";
import KPIsExpedicao from "@/components/expedicao/expedicao-launchpad/KPIsExpedicao";
import ModulosGridExpedicao from "@/components/expedicao/expedicao-launchpad/ModulosGridExpedicao";
import { useRealtimeEntregas } from '@/components/lib/useRealtimeData';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import NotificadorAutomaticoEntrega from "../components/logistica/NotificadorAutomaticoEntrega";
import ComprovanteEntregaDigital from "../components/logistica/ComprovanteEntregaDigital";
import RegistroOcorrenciaLogistica from "../components/logistica/RegistroOcorrenciaLogistica";
import IntegracaoRomaneio from "../components/logistica/IntegracaoRomaneio";

const EntregasListagem = React.lazy(() => import("../components/expedicao/EntregasListagem"));
const SeparacaoConferencia = React.lazy(() => import("../components/expedicao/SeparacaoConferencia"));
const SeparacaoConferenciaIA = React.lazy(() => import("@/components/expedicao/SeparacaoConferenciaIA"));
const RoteirizacaoInteligente = React.lazy(() => import("@/components/expedicao/RoteirizacaoInteligente"));
const PainelMetricasRealtime = React.lazy(() => import("../components/logistica/PainelMetricasRealtime"));
const DashboardLogisticaInteligente = React.lazy(() => import("../components/logistica/DashboardLogisticaInteligente"));
const DashboardLogistico = React.lazy(() => import("../components/expedicao/DashboardLogistico"));
const DashboardEntregasRealtime = React.lazy(() => import("../components/expedicao/DashboardEntregasRealtime"));
const RelatoriosLogistica = React.lazy(() => import("../components/expedicao/RelatoriosLogistica"));
const ConfiguracaoExpedicao = React.lazy(() => import("../components/expedicao/ConfiguracaoExpedicao"));
const MapaRoteirizacaoIA = React.lazy(() => import("../components/logistica/MapaRoteirizacaoIA"));
const RoteirizacaoMapa = React.lazy(() => import("../components/expedicao/RoteirizacaoMapa"));
const ComprovanteDigital = React.lazy(() => import("../components/expedicao/ComprovanteDigital"));

export default function Expedicao() {
  const { hasPermission, isLoading: loadingPermissions } = usePermissions();
  const { openWindow } = useWindow();
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { estaNoGrupo, empresaAtual, empresasDoGrupo, filtrarPorContexto, getFiltroContexto, grupoAtual } = useContextoVisual();

  const [comprovanteModal, setComprovanteModal] = React.useState(null);
  const [entregaSelecionada, setEntregaSelecionada] = React.useState(null);
  const [notificadorOpen, setNotificadorOpen] = React.useState(false);
  const [comprovanteOpen, setComprovanteOpen] = React.useState(false);
  const [ocorrenciaOpen, setOcorrenciaOpen] = React.useState(false);

  const { data: entregas = [] } = useQuery({
    queryKey: ['entregas', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        return await base44.entities.Entrega.filter(filtro, '-created_date', 100);
      } catch (err) {
        console.error('Erro ao buscar entregas:', err);
        return [];
      }
    },
    staleTime: 30000,
    retry: 2
  });

  const { data: totalEntregas = 0 } = useQuery({
    queryKey: ['entregas-count', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        const response = await base44.functions.invoke('countEntities', {
          entityName: 'Entrega',
          filter: filtro
        });
        return response.data?.count || entregas.length;
      } catch {
        return entregas.length;
      }
    },
    staleTime: 60000,
    retry: 1
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        return await base44.entities.Cliente.filter(filtro, '-created_date', 100);
      } catch (err) {
        console.error('Erro ao buscar clientes:', err);
        return [];
      }
    },
    staleTime: 30000,
    retry: 1
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        return await base44.entities.Pedido.filter(filtro, '-created_date', 100);
      } catch (err) {
        console.error('Erro ao buscar pedidos:', err);
        return [];
      }
    },
    staleTime: 30000,
    retry: 1
  });

  const { data: romaneios = [] } = useQuery({
    queryKey: ['romaneios', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        return await base44.entities.Romaneio.filter(filtro, '-created_date', 50);
      } catch (err) {
        console.error('Erro ao buscar romaneios:', err);
        return [];
      }
    },
    staleTime: 30000,
    retry: 1
  });

  const { data: rotas = [] } = useQuery({
    queryKey: ['rotas', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        return await base44.entities.Rota.filter(filtro, '-created_date', 50);
      } catch (err) {
        console.error('Erro ao buscar rotas:', err);
        return [];
      }
    },
    staleTime: 30000,
    retry: 1
  });

  // Dados já vêm filtrados do servidor
  const entregasFiltradas = entregas;
  const { data: entregasRealtime, hasChanges } = useRealtimeEntregas(empresaAtual?.id);

  const statusCounts = {
    total: entregasFiltradas.length,
    aguardando: entregasFiltradas.filter(e => e.status === "Aguardando Separação").length,
    separacao: entregasFiltradas.filter(e => e.status === "Em Separação").length,
    pronto: entregasFiltradas.filter(e => e.status === "Pronto para Expedir").length,
    transito: entregasFiltradas.filter(e => e.status === "Em Trânsito" || e.status === "Saiu para Entrega").length,
    entregue: entregasFiltradas.filter(e => e.status === "Entregue").length,
    frustrada: entregasFiltradas.filter(e => e.status === "Entrega Frustrada").length,
  };

  if (loadingPermissions) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  const modules = [
    {
      title: 'Entregas',
      description: 'Lista e gestão',
      icon: Truck,
      color: 'blue',
      component: EntregasListagem,
      windowTitle: '🚚 Entregas',
      width: 1600,
      height: 900,
      props: { entregas: entregasFiltradas, clientes, pedidos, empresasDoGrupo, estaNoGrupo }
    },
    {
      title: 'Separação',
      description: 'Picking de pedidos',
      icon: Package,
      color: 'purple',
      component: SeparacaoConferenciaIA,
      windowTitle: '📦 Separação IA',
      width: 1400,
      height: 850,
    },
    {
      title: 'Romaneios',
      description: 'Gestão de cargas',
      icon: FileText,
      color: 'indigo',
      component: IntegracaoRomaneio,
      windowTitle: '📋 Romaneios',
      width: 1400,
      height: 800,
      props: { pedidosSelecionados: pedidos.filter(p => ['Faturado', 'Em Expedição', 'Pronto para Faturar'].includes(p.status)) }
    },
    {
      title: 'Rotas e Mapa',
      description: 'Visualização cartográfica',
      icon: Map,
      color: 'green',
      component: RoteirizacaoMapa,
      windowTitle: '🗺️ Rotas e Mapa',
      width: 1400,
      height: 800,
      props: { entregas: entregasFiltradas.filter(e => e.status === "Pronto para Expedir"), empresaId: empresaAtual?.id }
    },
    {
      title: 'Roteirização IA',
      description: 'Otimização automática',
      icon: Route,
      color: 'purple',
      component: RoteirizacaoInteligente,
      windowTitle: '🤖 Roteirização IA',
      width: 1400,
      height: 800,
    },
    {
      title: 'Métricas Realtime',
      description: 'Monitoramento ao vivo',
      icon: Activity,
      color: 'green',
      component: PainelMetricasRealtime,
      windowTitle: '⚡ Métricas Tempo Real',
      width: 1200,
      height: 700,
    },
    {
      title: 'Dashboard IA',
      description: 'Analytics inteligente',
      icon: BarChart3,
      color: 'blue',
      component: DashboardLogisticaInteligente,
      windowTitle: '📊 Dashboard IA',
      width: 1300,
      height: 750,
    },
    {
      title: 'Dashboard Entregas',
      description: 'Visão geral realtime',
      icon: Activity,
      color: 'cyan',
      component: DashboardEntregasRealtime,
      windowTitle: '📊 Dashboard Entregas',
      width: 1300,
      height: 750,
      props: { empresaId: empresaAtual?.id }
    },
    {
      title: 'Relatórios',
      description: 'Análises e exportação',
      icon: FileText,
      color: 'indigo',
      component: RelatoriosLogistica,
      windowTitle: '📄 Relatórios Logística',
      width: 1400,
      height: 800,
      props: { empresaId: empresaAtual?.id }
    },
    {
      title: 'Configurações',
      description: 'Parâmetros e ajustes',
      icon: Settings,
      color: 'purple',
      component: ConfiguracaoExpedicao,
      windowTitle: '⚙️ Configurações',
      width: 1200,
      height: 700,
      props: { empresaId: empresaAtual?.id }
    },
  ];

  const allowedModules = modules.filter(m => hasPermission('Expedição', (m.sectionKey || m.title), 'ver'));

   const handleModuleClick = (module) => {
    React.startTransition(() => {
      // Auditoria de abertura de seção
      base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário',
        acao: 'Visualização',
        modulo: 'Expedição',
        tipo_auditoria: 'acesso',
        entidade: 'Seção',
        descricao: `Abrir seção: ${module.title}`,
        data_hora: new Date().toISOString(),
      });
      openWindow(
         module.component,
        { ...(module.props || {}), windowMode: true },
        {
          title: module.windowTitle,
          width: module.width,
          height: module.height,
          uniqueKey: `expedicao-${module.title.toLowerCase().replace(/\s/g, '-')}`
        }
      );
    });
  };

  return (
    <ProtectedSection module="Expedição" action="visualizar">
    <ErrorBoundary>
      <div className="w-full h-full p-1.5 space-y-1.5 overflow-auto bg-gradient-to-br from-slate-50 to-blue-50">
        <HeaderExpedicaoCompacto />
        
        <KPIsExpedicao statusCounts={statusCounts} />

        {estaNoGrupo && (
          <Badge className="bg-blue-100 text-blue-700 px-3 py-1.5 w-full justify-center">
            <Building2 className="w-3 h-3 mr-2" />
            Visão Consolidada do Grupo
          </Badge>
        )}

        <ModulosGridExpedicao 
          modules={allowedModules}
          onModuleClick={handleModuleClick}
        />
      </div>

      <Dialog open={notificadorOpen} onOpenChange={setNotificadorOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          {entregaSelecionada && (
            <NotificadorAutomaticoEntrega
              pedido={pedidos.find(p => p.id === entregaSelecionada.pedido_id)}
              entrega={entregaSelecionada}
              onClose={() => setNotificadorOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={comprovanteOpen} onOpenChange={setComprovanteOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          {entregaSelecionada && (
            <ComprovanteEntregaDigital
              pedido={pedidos.find(p => p.id === entregaSelecionada.pedido_id)}
              entrega={entregaSelecionada}
              onSuccess={() => setComprovanteOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={ocorrenciaOpen} onOpenChange={setOcorrenciaOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          {entregaSelecionada && (
            <RegistroOcorrenciaLogistica
              pedido={pedidos.find(p => p.id === entregaSelecionada.pedido_id)}
              entrega={entregaSelecionada}
              onClose={() => setOcorrenciaOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {comprovanteModal && (
        <Suspense fallback={<div className="h-[400px] w-full bg-white/60 animate-pulse rounded" />}> 
          <ComprovanteDigital
            entrega={comprovanteModal}
            isOpen={!!comprovanteModal}
            onClose={() => setComprovanteModal(null)}
          />
        </Suspense>
      )}
    </ErrorBoundary>
    </ProtectedSection>
  );
}