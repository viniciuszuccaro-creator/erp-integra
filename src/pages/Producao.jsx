import React, { Suspense } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Factory, LayoutGrid, Clock, CheckCircle, AlertTriangle, Settings, BarChart3, Activity, Zap, FileText, Sparkles } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import { useWindow } from "@/components/lib/useWindow";
import usePermissions from "@/components/lib/usePermissions";
import HeaderProducaoCompacto from "@/components/producao/producao-launchpad/HeaderProducaoCompacto";
import KPIsProducao from "@/components/producao/producao-launchpad/KPIsProducao";
import ModulosGridProducao from "@/components/producao/producao-launchpad/ModulosGridProducao";

const KanbanProducaoInteligente = React.lazy(() => import("@/components/producao/KanbanProducaoInteligente"));
const ApontamentoProducao = React.lazy(() => import("@/components/producao/ApontamentoProducao"));
const ControleRefugo = React.lazy(() => import("@/components/producao/ControleRefugo"));
const RelatoriosProducao = React.lazy(() => import("@/components/producao/RelatoriosProducao"));
const ConfiguracaoProducao = React.lazy(() => import("../components/producao/ConfiguracaoProducao"));
const DashboardRefugoIA = React.lazy(() => import("../components/producao/DashboardRefugoIA"));
const DashboardProducaoRealtime = React.lazy(() => import("../components/producao/DashboardProducaoRealtime"));
const IADiagnosticoEquipamentos = React.lazy(() => import("../components/producao/IADiagnosticoEquipamentos"));
const DocumentosProducao = React.lazy(() => import("../components/producao/DocumentosProducao"));

export default function Producao() {
  const { hasPermission, isLoading: loadingPermissions } = usePermissions();
  const { filtrarPorContexto, getFiltroContexto, empresaAtual } = useContextoVisual();
  const { openWindow } = useWindow();

  const { empresaAtual } = useContextoVisual();

  const { data: ordensProducao = [] } = useQuery({
    queryKey: ['ordens-producao', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        return await base44.entities.OrdemProducao.filter(filtro, '-created_date', 100);
      } catch (err) {
        console.error('Erro ao buscar ordens de produção:', err);
        return [];
      }
    },
    staleTime: 30000,
    retry: 2
  });

  const totalOPs = ordensProducao.length;
  const opsLiberadas = ordensProducao.filter(op => op.status === "Liberada").length;
  const opsEmProducao = ordensProducao.filter(op =>
    ["Em Corte", "Em Dobra", "Em Armação"].includes(op.status)
  ).length;
  const opsFinalizadas = ordensProducao.filter(op => op.status === "Finalizada").length;

  if (loadingPermissions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const modules = [
    {
      title: 'Kanban',
      description: 'Visão drag-drop',
      icon: LayoutGrid,
      color: 'blue',
      component: KanbanProducaoInteligente,
      windowTitle: '📋 Kanban Produção',
      width: 1600,
      height: 900,
      props: { windowMode: true }
    },
    {
      title: 'Ordens Produção',
      description: 'Listagem OPs',
      icon: Factory,
      color: 'orange',
      component: () => <div className="p-4">Listagem de OPs (em desenvolvimento)</div>,
      windowTitle: '🏭 Ordens de Produção',
      width: 1500,
      height: 850,
    },
    {
      title: 'Apontamentos',
      description: 'Registro produção',
      icon: Clock,
      color: 'purple',
      component: ApontamentoProducao,
      windowTitle: '⏱️ Apontamentos',
      width: 1300,
      height: 800,
      props: { windowMode: true }
    },
    {
      title: 'Controle Refugo',
      description: 'Perdas e análise',
      icon: AlertTriangle,
      color: 'red',
      component: ControleRefugo,
      windowTitle: '⚠️ Controle de Refugo',
      width: 1400,
      height: 800,
      props: { ops: ordensProducao, windowMode: true }
    },
    {
      title: 'Dashboard IA',
      description: 'Análise refugo',
      icon: Sparkles,
      color: 'cyan',
      component: DashboardRefugoIA,
      windowTitle: '🤖 Dashboard Refugo IA',
      width: 1400,
      height: 800,
      props: { empresaId: empresaAtual?.id, windowMode: true }
    },
    {
      title: 'Dashboard Realtime',
      description: 'Métricas ao vivo',
      icon: Activity,
      color: 'green',
      component: DashboardProducaoRealtime,
      windowTitle: '📊 Dashboard Realtime',
      width: 1500,
      height: 850,
      props: { empresaId: empresaAtual?.id, windowMode: true }
    },
    {
      title: 'IoT Equipamentos',
      description: 'Diagnóstico IA',
      icon: Zap,
      color: 'indigo',
      component: IADiagnosticoEquipamentos,
      windowTitle: '⚡ IoT & Equipamentos',
      width: 1400,
      height: 800,
      props: { windowMode: true }
    },
    {
      title: 'Documentos',
      description: 'Etiquetas e docs',
      icon: FileText,
      color: 'blue',
      component: DocumentosProducao,
      windowTitle: '📄 Documentos Produção',
      width: 1200,
      height: 700,
      props: { windowMode: true }
    },
    {
      title: 'Relatórios',
      description: 'Análises produção',
      icon: BarChart3,
      color: 'purple',
      component: RelatoriosProducao,
      windowTitle: '📈 Relatórios Produção',
      width: 1400,
      height: 800,
      props: { ops: ordensProducao, windowMode: true }
    },
    {
      title: 'Configurações',
      description: 'Setup produção',
      icon: Settings,
      color: 'purple',
      component: ConfiguracaoProducao,
      windowTitle: '⚙️ Configurações',
      width: 1200,
      height: 700,
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
          uniqueKey: `producao-${module.title.toLowerCase().replace(/\s/g, '-')}`
        }
      );
    });
  };

  return (
    <ErrorBoundary>
      <div className="w-full h-full flex flex-col p-1.5 space-y-1.5 overflow-auto bg-gradient-to-br from-slate-50 to-orange-50">
        <HeaderProducaoCompacto />
        
        <KPIsProducao
          totalOPs={totalOPs}
          opsLiberadas={opsLiberadas}
          opsEmProducao={opsEmProducao}
          opsFinalizadas={opsFinalizadas}
        />

        <ModulosGridProducao 
          modules={modules}
          onModuleClick={handleModuleClick}
        />
      </div>
    </ErrorBoundary>
  );
}