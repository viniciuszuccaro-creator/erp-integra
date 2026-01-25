import React, { Suspense } from "react";
import { base44 } from "@/api/base44Client";
import useQueryWithRateLimit from "@/components/lib/useQueryWithRateLimit";
import { TrendingUp, Target, MessageSquare, Mail, Sparkles, AlertTriangle, BarChart3, Users, Loader2 } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import { useWindow } from "@/components/lib/useWindow";
import usePermissions from "@/components/lib/usePermissions";
import HeaderCRMCompacto from "@/components/crm/crm-launchpad/HeaderCRMCompacto";
import KPIsCRM from "@/components/crm/crm-launchpad/KPIsCRM";
import ModulosGridCRM from "@/components/crm/crm-launchpad/ModulosGridCRM";

const FunilVisual = React.lazy(() => import("../components/crm/FunilVisual"));
const FunilComercialInteligente = React.lazy(() => import("@/components/crm/FunilComercialInteligente"));
const FunilVendasAvancado = React.lazy(() => import("@/components/crm/FunilVendasAvancado"));
const IALeadsPriorizacao = React.lazy(() => import("../components/crm/IALeadsPriorizacao"));
const IAChurnDetection = React.lazy(() => import("../components/crm/IAChurnDetection"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[600px]">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <p className="text-slate-600 text-sm">Carregando...</p>
    </div>
  </div>
);

export default function CRMPage() {
  const { hasPermission, isLoading: loadingPermissions } = usePermissions();
  const { filtrarPorContexto, filterInContext, empresaAtual } = useContextoVisual();
  const { openWindow } = useWindow();

  const { data: oportunidades = [] } = useQueryWithRateLimit(
    ['oportunidades', empresaAtual?.id],
    async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        return await base44.entities.Oportunidade.filter(filtro, '-created_date', 100);
      } catch (err) {
        console.error('Erro ao buscar oportunidades:', err);
        return [];
      }
    },
    { initialData: [] }
  );

  const { data: interacoes = [] } = useQueryWithRateLimit(
    ['interacoes', empresaAtual?.id],
    async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        return await base44.entities.Interacao.filter(filtro, '-created_date', 100);
      } catch (err) {
        console.error('Erro ao buscar interações:', err);
        return [];
      }
    },
    { initialData: [] }
  );

  const { data: campanhas = [] } = useQueryWithRateLimit(
    ['campanhas', empresaAtual?.id],
    async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_dona_id: empresaAtual.id } : {};
        return await base44.entities.Campanha.filter(filtro, '-created_date', 50);
      } catch (err) {
        console.error('Erro ao buscar campanhas:', err);
        return [];
      }
    },
    { initialData: [] }
  );

  const { data: clientes = [] } = useQueryWithRateLimit(
    ['clientes', empresaAtual?.id],
    async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        return await base44.entities.Cliente.filter(filtro, '-created_date', 100);
      } catch (err) {
        console.error('Erro ao buscar clientes:', err);
        return [];
      }
    },
    { initialData: [] }
  );

  const { data: totalClientes = 0 } = useQueryWithRateLimit(
    ['clientes-count-crm', empresaAtual?.id],
    async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        const response = await base44.functions.invoke('countEntities', {
          entityName: 'Cliente',
          filter: filtro
        });
        return response.data?.count || 0;
      } catch {
        return 0; // Changed from clientes.length to 0 as per outline
      }
    },
    { initialData: 0 }
  );

  // Dados já vêm filtrados do servidor
  const oportunidadesFiltradas = oportunidades;
  const interacoesFiltradas = interacoes;
  const campanhasFiltradas = campanhas;

  const totalOportunidades = oportunidadesFiltradas.length;
  const oportunidadesAbertas = oportunidadesFiltradas.filter(o => o.status === 'Aberto' || o.status === 'Em Andamento').length;
  const valorPipeline = oportunidadesFiltradas
    .filter(o => o.status === 'Aberto' || o.status === 'Em Andamento')
    .reduce((sum, o) => sum + (o.valor_estimado || 0), 0);
  const valorPonderado = oportunidadesFiltradas
    .filter(o => o.status === 'Aberto' || o.status === 'Em Andamento')
    .reduce((sum, o) => sum + ((o.valor_estimado || 0) * (o.probabilidade || 0) / 100), 0);
  const taxaConversao = totalOportunidades > 0
    ? ((oportunidades.filter(o => o.status === 'Ganho').length / totalOportunidades) * 100).toFixed(1)
    : 0;

  if (loadingPermissions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const modules = [
    {
      title: 'Funil Visual',
      description: 'Drag-drop etapas',
      icon: TrendingUp,
      color: 'blue',
      component: FunilVisual,
      windowTitle: '🎯 Funil Visual',
      width: 1600,
      height: 900,
      props: { oportunidades: oportunidadesFiltradas, windowMode: true }
    },
    {
      title: 'Funil IA',
      description: 'Análise inteligente',
      icon: Sparkles,
      color: 'purple',
      component: FunilComercialInteligente,
      windowTitle: '🤖 Funil IA',
      width: 1500,
      height: 850,
      props: { windowMode: true }
    },
    {
      title: 'Funil Avançado',
      description: 'Scoring automático',
      icon: Target,
      color: 'cyan',
      component: FunilVendasAvancado,
      windowTitle: '🎯 Funil Avançado',
      width: 1500,
      height: 850,
      props: { windowMode: true }
    },
    {
      title: 'Oportunidades',
      description: 'Gestão completa',
      icon: Target,
      color: 'indigo',
      component: () => <div className="p-4">Listagem Oportunidades (em desenvolvimento)</div>,
      windowTitle: '📊 Oportunidades',
      width: 1500,
      height: 850,
    },
    {
      title: 'Interações',
      description: 'Histórico contatos',
      icon: MessageSquare,
      color: 'green',
      component: () => <div className="p-4">Histórico Interações (em desenvolvimento)</div>,
      windowTitle: '💬 Interações',
      width: 1400,
      height: 800,
    },
    {
      title: 'Campanhas',
      description: 'Marketing ativo',
      icon: Mail,
      color: 'pink',
      component: () => <div className="p-4">Campanhas Marketing (em desenvolvimento)</div>,
      windowTitle: '📧 Campanhas',
      width: 1400,
      height: 800,
    },
    {
      title: 'IA Leads',
      description: 'Priorização automática',
      icon: Sparkles,
      color: 'purple',
      component: IALeadsPriorizacao,
      windowTitle: '🤖 IA Leads',
      width: 1400,
      height: 800,
      props: { oportunidades: oportunidadesFiltradas, windowMode: true }
    },
    {
      title: 'IA Churn',
      description: 'Detecção perda',
      icon: AlertTriangle,
      color: 'orange',
      component: IAChurnDetection,
      windowTitle: '⚠️ IA Churn',
      width: 1400,
      height: 800,
      props: { clientes, windowMode: true }
    },
  ];

  const handleModuleClick = (module) => {
    const WrappedComponent = () => (
      <Suspense fallback={<LoadingFallback />}>
        <module.component {...(module.props || {})} windowMode={true} />
      </Suspense>
    );
    
    openWindow(
      WrappedComponent,
      { ...(module.props || {}), windowMode: true },
      {
        title: module.windowTitle,
        width: module.width,
        height: module.height,
        uniqueKey: `crm-${module.title.toLowerCase().replace(/\s/g, '-')}`
      }
    );
  };

  return (
    <ErrorBoundary>
      <div className="w-full h-full flex flex-col p-1.5 space-y-1.5 overflow-auto bg-gradient-to-br from-slate-50 to-blue-50">
        <HeaderCRMCompacto />
        
        <KPIsCRM
          oportunidadesAbertas={oportunidadesAbertas}
          totalOportunidades={totalOportunidades}
          valorPipeline={valorPipeline}
          valorPonderado={valorPonderado}
          taxaConversao={taxaConversao}
        />

        <ModulosGridCRM 
          modules={modules}
          onModuleClick={handleModuleClick}
        />
      </div>
    </ErrorBoundary>
  );
}