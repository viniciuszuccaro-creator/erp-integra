import React, { Suspense } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Users, Clock, Calendar, Activity, Trophy, FileText, UserCircle } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import ProtectedSection from "@/components/security/ProtectedSection";
import { useWindow } from "@/components/lib/useWindow";
import { useUser } from "@/components/lib/UserContext";
import usePermissions from "@/components/lib/usePermissions";
import HeaderRHCompacto from "@/components/rh/rh-launchpad/HeaderRHCompacto";
import KPIsRH from "@/components/rh/rh-launchpad/KPIsRH";
import ModulosGridRH from "@/components/rh/rh-launchpad/ModulosGridRH";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

const PontoTab = React.lazy(() => import("../components/rh/PontoTab"));
const GameficacaoProducao = React.lazy(() => import("@/components/rh/GameficacaoProducao"));
const MonitoramentoRHInteligente = React.lazy(() => import("@/components/rh/MonitoramentoRHInteligente"));
const PontoEletronicoBiometrico = React.lazy(() => import("@/components/rh/PontoEletronicoBiometrico"));
const DashboardRHRealtime = React.lazy(() => import("../components/rh/DashboardRHRealtime"));

export default function RH() {
  const { hasPermission, isLoading: loadingPermissions } = usePermissions();
  const { filtrarPorContexto, getFiltroContexto, empresaAtual } = useContextoVisual();
  const { openWindow } = useWindow();
  const { user } = useUser();

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores', empresaAtual?.id],
    queryFn: async () => {
      try {
        return await filtrarPorContexto('Colaborador', {}, '-created_date', 100, 'empresa_alocada_id');
      } catch (err) {
        console.error('Erro ao buscar colaboradores:', err);
        return [];
      }
    },
    staleTime: 30000,
    retry: 2
  });

  const { data: totalColaboradores = 0 } = useQuery({
    queryKey: ['colaboradores-count-rh', empresaAtual?.id],
    queryFn: async () => {
      try {
        const response = await base44.functions.invoke('countEntities', {
          entityName: 'Colaborador',
          filter: getFiltroContexto('empresa_alocada_id')
        });
        return response.data?.count || colaboradores.length;
      } catch {
        return colaboradores.length;
      }
    },
    staleTime: 60000,
    retry: 1
  });

  const { data: pontos = [] } = useQuery({
    queryKey: ['pontos', empresaAtual?.id],
    queryFn: async () => {
        try {
          return await filtrarPorContexto('Ponto', {}, '-data', 100);
        } catch (err) {
          console.error('Erro ao buscar pontos:', err);
          return [];
        }
      },
      staleTime: 30000,
      retry: 1
    });

  const { data: ferias = [] } = useQuery({
    queryKey: ['ferias', empresaAtual?.id],
    queryFn: async () => {
        try {
          return await filtrarPorContexto('Ferias', {}, '-created_date', 50);
        } catch (err) {
          console.error('Erro ao buscar férias:', err);
          return [];
        }
      },
      staleTime: 30000,
      retry: 1
    });

  // Dados já vêm filtrados do servidor
  const colaboradoresFiltrados = colaboradores;
  const colaboradoresAtivos = colaboradoresFiltrados.filter(c => c.status === "Ativo").length;
  const feriasAprovadas = ferias.filter(f => f.status === "Aprovada").length;
  const feriasPendentes = ferias.filter(f => f.status === "Solicitada").length;

  if (loadingPermissions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const modules = [
    {
      title: 'Colaboradores',
      description: 'Cadastro e gestão',
      icon: Users,
      color: 'purple',
      component: () => <div className="p-4">Ver em Cadastros Gerais</div>,
      windowTitle: '👥 Colaboradores',
      width: 1400,
      height: 800,
    },
    {
      title: 'Ponto',
      description: 'Registro de ponto',
      icon: Clock,
      color: 'blue',
      component: PontoTab,
      windowTitle: '⏰ Ponto',
      width: 1400,
      height: 800,
      props: { pontos, colaboradores: colaboradoresFiltrados, canApprove: true, windowMode: true }
    },
    {
      title: 'Ponto Biométrico',
      description: 'Reconhecimento facial',
      icon: UserCircle,
      color: 'indigo',
      component: PontoEletronicoBiometrico,
      windowTitle: '🔒 Ponto Biométrico',
      width: 1400,
      height: 800,
      props: { windowMode: true }
    },
    {
      title: 'Dashboard RH',
      description: 'Métricas realtime',
      icon: Activity,
      color: 'green',
      component: DashboardRHRealtime,
      windowTitle: '📊 Dashboard RH',
      width: 1500,
      height: 850,
      props: { windowMode: true }
    },
    {
      title: 'Férias',
      description: 'Solicitações e aprovações',
      icon: Calendar,
      color: 'orange',
      component: () => <div className="p-4">Gestão de Férias (em desenvolvimento)</div>,
      windowTitle: '🏖️ Férias',
      width: 1200,
      height: 700,
      badge: feriasPendentes > 0 ? `${feriasPendentes} pendentes` : null
    },
    {
      title: 'Rankings',
      description: 'Gamificação produção',
      icon: Trophy,
      color: 'orange',
      component: GameficacaoProducao,
      windowTitle: '🏆 Rankings e Gamificação',
      width: 1400,
      height: 800,
      props: { windowMode: true }
    },
    {
      title: 'Monitoramento IA',
      description: 'Análise inteligente',
      icon: Activity,
      color: 'cyan',
      component: MonitoramentoRHInteligente,
      windowTitle: '🤖 Monitoramento IA',
      width: 1400,
      height: 800,
      props: { windowMode: true }
    },
  ];

  const allowedModules = modules.filter(m => hasPermission('RH', (m.sectionKey || m.title), 'ver'));

   const handleModuleClick = (module) => {
    React.startTransition(() => {
      // Auditoria de abertura de seção
      base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário',
        acao: 'Visualização',
        modulo: 'RH',
        tipo_auditoria: 'acesso',
        entidade: 'Seção',
        descricao: `Abrir seção: ${module.title}`,
        data_hora: new Date().toISOString(),
      });
      openWindow(
         module.component,
        { 
          ...(module.props || {}),
          windowMode: true 
        },
        {
          title: module.windowTitle,
          width: module.width,
          height: module.height,
          uniqueKey: `rh-${module.title.toLowerCase().replace(/\s/g, '-')}`
        }
      );
    });
  };

  return (
    <ProtectedSection module="RH" action="visualizar">
    <ErrorBoundary>
      <div className="w-full h-full flex flex-col p-1.5 space-y-1.5 overflow-auto bg-gradient-to-br from-slate-50 to-purple-50">
        <HeaderRHCompacto />
        
        <ResizablePanelGroup direction="vertical" className="gap-2 min-h-[640px]">
          <ResizablePanel defaultSize={45} minSize={30} className="overflow-auto">
            <KPIsRH
              colaboradoresAtivos={colaboradoresAtivos}
              totalColaboradores={totalColaboradores}
              feriasAprovadas={feriasAprovadas}
              feriasPendentes={feriasPendentes}
              totalPontos={pontos.length}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={55} minSize={40} className="overflow-auto">
            <ModulosGridRH 
              modules={allowedModules}
              onModuleClick={handleModuleClick}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </ErrorBoundary>
    </ProtectedSection>
  );
}