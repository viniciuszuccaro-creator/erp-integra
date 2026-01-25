import React, { Suspense } from "react";
import { base44 } from "@/api/base44Client";
import useQueryWithRateLimit from "@/components/lib/useQueryWithRateLimit";
import { Users, Clock, Calendar, Activity, Trophy, FileText, UserCircle } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import { useWindow } from "@/components/lib/useWindow";
import usePermissions from "@/components/lib/usePermissions";
import HeaderRHCompacto from "@/components/rh/rh-launchpad/HeaderRHCompacto";
import KPIsRH from "@/components/rh/rh-launchpad/KPIsRH";
import ModulosGridRH from "@/components/rh/rh-launchpad/ModulosGridRH";

const PontoTab = React.lazy(() => import("../components/rh/PontoTab"));
const GameficacaoProducao = React.lazy(() => import("@/components/rh/GameficacaoProducao"));
const MonitoramentoRHInteligente = React.lazy(() => import("@/components/rh/MonitoramentoRHInteligente"));
const PontoEletronicoBiometrico = React.lazy(() => import("@/components/rh/PontoEletronicoBiometrico"));
const DashboardRHRealtime = React.lazy(() => import("../components/rh/DashboardRHRealtime"));

export default function RH() {
  const { hasPermission, isLoading: loadingPermissions } = usePermissions();
  const { filtrarPorContexto, empresaAtual } = useContextoVisual();
  const { openWindow } = useWindow();

  const { data: colaboradores = [] } = useQueryWithRateLimit(
    ['colaboradores', empresaAtual?.id],
    async () => {
      const filtro = empresaAtual?.id ? { empresa_alocada_id: empresaAtual.id } : {};
      return await base44.entities.Colaborador.filter(filtro, '-created_date', 100);
    },
    { initialData: [] }
  );

  const { data: totalColaboradores = 0 } = useQueryWithRateLimit(
    ['colaboradores-count-rh', empresaAtual?.id],
    async () => {
      const filtro = empresaAtual?.id ? { empresa_alocada_id: empresaAtual.id } : {};
      const response = await base44.functions.invoke('countEntities', {
        entityName: 'Colaborador',
        filter: filtro
      });
      return response.data?.count || 0;
    },
    { initialData: 0 }
  );

  const { data: pontos = [] } = useQueryWithRateLimit(
    ['pontos', empresaAtual?.id],
    async () => {
      return await base44.entities.Ponto.list('-data', 100);
    },
    { initialData: [] }
  );

  const { data: ferias = [] } = useQueryWithRateLimit(
    ['ferias', empresaAtual?.id],
    async () => {
      return await base44.entities.Ferias.list('-created_date', 50);
    },
    { initialData: [] }
  );

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

  const handleModuleClick = (module) => {
    React.startTransition(() => {
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
    <ErrorBoundary>
      <div className="w-full h-full flex flex-col p-1.5 space-y-1.5 overflow-auto bg-gradient-to-br from-slate-50 to-purple-50">
        <HeaderRHCompacto />
        
        <KPIsRH
          colaboradoresAtivos={colaboradoresAtivos}
          totalColaboradores={totalColaboradores}
          feriasAprovadas={feriasAprovadas}
          feriasPendentes={feriasPendentes}
          totalPontos={pontos.length}
        />

        <ModulosGridRH 
          modules={modules}
          onModuleClick={handleModuleClick}
        />
      </div>
    </ErrorBoundary>
  );
}