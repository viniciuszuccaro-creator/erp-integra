import React, { useState, useEffect, Suspense } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useContextoVisual } from '@/components/lib/useContextoVisual'; // Updated import path
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  Package,
  Truck,
  UserCircle,
  ArrowRight,
  AlertCircle,
  Box,
  Calendar,
  BarChart3,
  PieChart,
  Clock,
  CheckCircle,
  Percent,
  Trophy,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPie, // Recharts PieChart component, aliased to avoid conflict with Lucide icon
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
const PainelOperacoes3D = React.lazy(() => import("../components/dashboard/PainelOperacoes3D"));
const GamificacaoOperacoes = React.lazy(() => import("../components/dashboard/GamificacaoOperacoes"));
const DashboardTempoReal = React.lazy(() => import('../components/dashboard/DashboardTempoReal'));
const DashboardOperacionalBI = React.lazy(() => import("@/components/dashboard/DashboardOperacionalBI"));
import { Tabs, TabsContent } from '@/components/ui/tabs';
import DashboardTabsNav from "@/components/dashboard/DashboardTabsNav";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import ProtectedSection from "@/components/security/ProtectedSection";
const WidgetCanaisOrigem = React.lazy(() => import("@/components/dashboard/WidgetCanaisOrigem")); // kept for backward-compat (not used directly here)
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsSection from "@/components/dashboard/StatsSection";
import KPIsOperacionaisSection from "@/components/dashboard/KPIsOperacionaisSection";
import SecondaryKPIsSection from "@/components/dashboard/SecondaryKPIsSection";
import ChartsSection from "@/components/dashboard/ChartsSection";
import TopProdutosStatusPeriodoSection from "@/components/dashboard/TopProdutosStatusPeriodoSection";
import AdvancedAnalysisSection from "@/components/dashboard/AdvancedAnalysisSection";
import QuickAccessModulesGrid from "@/components/dashboard/QuickAccessModulesGrid";
import FinancialSummary from "@/components/dashboard/FinancialSummary";
import WidgetEstoqueCritico from "@/components/estoque/WidgetEstoqueCritico";
import ResizableRow from "@/components/dashboard/ResizableRow";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import useDashboardDerivedData from "@/components/dashboard/hooks/useDashboardDerivedData";


export default function Dashboard() {
  const navigate = useNavigate();
  const { empresaAtual, estaNoGrupo, grupoAtual, filterInContext, getFiltroContexto } = useContextoVisual();

  const [periodo, setPeriodo] = useState(() => {
    try {
      return localStorage.getItem('dashboard_periodo') || "mes";
    } catch (e) {
      // Handle potential localStorage errors (e.g., security settings, full storage)
      console.warn("Could not access localStorage for 'dashboard_periodo':", e);
      return "mes"; // Fallback to default
    }
  });

  // Removed visualizacao state as it's replaced by Tabs
  const [activeTab, setActiveTab] = useState("tempo-real");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let initial = params.get('tab');
    if (!initial) { try { initial = localStorage.getItem('Dashboard_tab'); } catch {} }
    if (initial) setActiveTab(initial);
  }, []);
  const handleTabChange = (value) => {
    setActiveTab(value);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    window.history.replaceState({}, '', url.toString());
    try { localStorage.setItem('Dashboard_tab', value); } catch {}
  }; // New state for active tab

  useEffect(() => {
    try {
      localStorage.setItem('dashboard_periodo', periodo);
    } catch (e) {
      // Ignore localStorage errors, as state will still hold the value
      console.warn("Could not save 'dashboard_periodo' to localStorage:", e);
    }
  }, [periodo]);

  const [autoRefresh, setAutoRefresh] = useState(true);
  const refetchInterval = (activeTab === 'resumo' && autoRefresh) ? 60000 : false; // 60 segundos

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos', empresaAtual?.id, estaNoGrupo],
    queryFn: async () => {
        if (empresaAtual?.id || estaNoGrupo) {
            const data = await filterInContext('Pedido', {}, '-created_date', 9999);
            if (!data || data.length === 0) {
                return await base44.entities.Pedido.list('-created_date', 200);
            }
            return data;
        }
        return await base44.entities.Pedido.list('-created_date', 200);
    },
    refetchInterval,
    staleTime: 30000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    enabled: activeTab === 'resumo',
    initialData: []
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contasReceber', empresaAtual?.id, estaNoGrupo],
    queryFn: () => (empresaAtual?.id || estaNoGrupo ? filterInContext('ContaReceber', {}, '-data_vencimento', 9999) : base44.entities.ContaReceber.list('-data_vencimento', 200)),
    refetchInterval,
    staleTime: 30000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    enabled: activeTab === 'resumo',
    initialData: []
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contasPagar', empresaAtual?.id, estaNoGrupo],
    queryFn: () => (empresaAtual?.id || estaNoGrupo ? filterInContext('ContaPagar', {}, '-data_vencimento', 9999) : base44.entities.ContaPagar.list('-data_vencimento', 200)),
    refetchInterval,
    staleTime: 30000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    enabled: activeTab === 'resumo',
    initialData: []
  });

  const { data: entregas = [] } = useQuery({
    queryKey: ['entregas', empresaAtual?.id, estaNoGrupo],
    queryFn: () => (empresaAtual?.id || estaNoGrupo ? filterInContext('Entrega', {}, '-created_date', 9999) : base44.entities.Entrega.list('-created_date', 200)),
    refetchInterval,
    staleTime: 30000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    enabled: activeTab === 'resumo',
    initialData: []
  });

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores', empresaAtual?.id, estaNoGrupo],
    queryFn: () => (empresaAtual?.id || estaNoGrupo ? filterInContext('Colaborador', {}, '-created_date', 9999, 'empresa_alocada_id') : base44.entities.Colaborador.list('-created_date', 200)),
    refetchInterval,
    staleTime: 60000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    enabled: activeTab === 'resumo',
    initialData: []
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos', empresaAtual?.id, estaNoGrupo],
    queryFn: () => (empresaAtual?.id || estaNoGrupo ? filterInContext('Produto', {}, '-created_date', 9999) : base44.entities.Produto.list('-created_date', 200)),
    refetchInterval,
    staleTime: 60000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    enabled: activeTab === 'resumo',
    initialData: []
  });

  const { data: totalProdutos = 0 } = useQuery({
    queryKey: ['produtos-count-dash', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = getFiltroContexto('empresa_id');
        const response = await base44.functions.invoke('countEntities', {
          entityName: 'Produto',
          filter: filtro
        });
        return response.data?.count || produtos.length;
      } catch {
        return produtos.length;
      }
    },
    staleTime: 60000,
    retry: 1
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes', empresaAtual?.id, estaNoGrupo],
    queryFn: async () => {
        if (empresaAtual?.id || estaNoGrupo) {
            const data = await filterInContext('Cliente', {}, '-created_date', 9999);
            if (!data || data.length === 0) {
                return await base44.entities.Cliente.list('-created_date', 200);
            }
            return data;
        }
        return await base44.entities.Cliente.list('-created_date', 200);
    },
    refetchInterval,
    staleTime: 60000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    enabled: activeTab === 'resumo',
    initialData: []
  });

  const { data: totalClientes = 0 } = useQuery({
    queryKey: ['clientes-count', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = getFiltroContexto('empresa_id');
        const response = await base44.functions.invoke('countEntities', {
          entityName: 'Cliente',
          filter: filtro
        });
        return response.data?.count || clientes.length;
      } catch {
        return clientes.length;
      }
    },
    staleTime: 60000,
    retry: 1
  });

  const { data: ordensProducao = [] } = useQuery({
    queryKey: ['ordensProducao', empresaAtual?.id, estaNoGrupo],
    queryFn: () => (empresaAtual?.id || estaNoGrupo ? filterInContext('OrdemProducao', {}, '-data_emissao', 9999) : (base44.entities.OrdemProducao?.list ? base44.entities.OrdemProducao.list('-data_emissao', 200) : Promise.resolve([]))),
    refetchInterval,
    staleTime: 30000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    enabled: activeTab === 'resumo',
    initialData: []
  });

  const {
    pedidosPeriodo,
    totalVendas,
    ticketMedio,
    receitasPendentes,
    despesasPendentes,
    fluxoCaixa,
    produtosBaixoEstoque,
    colaboradoresAtivos,
    clientesAtivos,
    taxaConversao,
    entregasPendentes,
    otd,
    entregasNoPrazo,
    entregasConcluidas,
    pesoProduzido,
    aproveitamentoBarra,
    taxaInadimplencia,
    valorVencido,
    dadosVendasStatus,
    vendasUltimos30Dias,
    fluxo7Dias,
    topProdutos,
    vendasPorMesData,
    top5ClientesData,
    statusPedidosDataAll,
    fluxoCaixaMensalData,
  } = useDashboardDerivedData({
    pedidos,
    contasReceber,
    contasPagar,
    entregas,
    ordensProducao,
    colaboradores,
    clientes,
    produtos,
    periodo,
  });

  // Dados e gráficos agora são providos por useDashboardDerivedData()

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Pré-computos para seções avançadas (evita recalcular em cada render de subcomponente)
  // Pré-cálculos fornecidos pelo hook useDashboardDerivedData

  // DRILL-DOWN - Função para navegar ao clicar em KPI
  const handleDrillDown = (rota) => {
    navigate(rota);
  };

  const statsCards = [
    {
      title: "Vendas do Período",
      value: `R$ ${totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      subtitle: `${pedidosPeriodo.length} pedidos`,
      icon: DollarSign,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      link: createPageUrl("Comercial"),
      drillDown: () => handleDrillDown(createPageUrl("Comercial"))
    },
    {
      title: "Ticket Médio",
      value: `R$ ${ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      subtitle: "por pedido",
      icon: TrendingUp,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      link: createPageUrl("Comercial"),
      drillDown: () => handleDrillDown(createPageUrl("Comercial"))
    },
    {
      title: "Fluxo de Caixa",
      value: `R$ ${fluxoCaixa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      subtitle: `${fluxoCaixa >= 0 ? 'Positivo' : 'Negativo'}`,
      icon: DollarSign,
      color: fluxoCaixa >= 0 ? "from-emerald-500 to-emerald-600" : "from-orange-500 to-orange-600",
      bgColor: fluxoCaixa >= 0 ? "bg-emerald-50" : "bg-orange-50",
      textColor: fluxoCaixa >= 0 ? "text-emerald-600" : "text-orange-600",
      link: createPageUrl("Financeiro"),
      drillDown: () => handleDrillDown(createPageUrl("Financeiro"))
    },
    {
      title: "Taxa de Conversão",
      value: `${taxaConversao}%`,
      subtitle: "vendas/clientes",
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      link: createPageUrl("Comercial"),
      drillDown: () => handleDrillDown(createPageUrl("Comercial"))
    }
  ];

  // NOVOS KPIs OPERACIONAIS (Cards)
  const opsConcluidasCount = (ordensProducao || []).filter(op => ["Concluída","Concluido","Concluida","Concluído","Finalizada","Finalizado","Encerrada","Encerrado","Pronto"].includes(op?.status)).length;
  const kpisOperacionais = [
    {
      title: "OTD (On-Time)",
      value: `${otd}%`,
      subtitle: `${entregasNoPrazo.length}/${entregasConcluidas.length} entregas`,
      icon: CheckCircle,
      color: otd >= 90 ? "text-green-600" : otd >= 70 ? "text-orange-600" : "text-red-600",
      bgColor: otd >= 90 ? "bg-green-50" : otd >= 70 ? "bg-orange-50" : "bg-red-50",
      drillDown: () => handleDrillDown(createPageUrl("Expedicao"))
    },
    {
      title: "Peso Produzido",
      value: `${pesoProduzido.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kg`,
      subtitle: `${opsConcluidasCount} OPs concluídas`,
      icon: Package,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      drillDown: () => handleDrillDown(createPageUrl("Producao"))
    },
    {
      title: "Aproveitamento",
      value: `${aproveitamentoBarra}%`,
      subtitle: "aproveitamento de barra",
      icon: Percent,
      color: aproveitamentoBarra >= 90 ? "text-green-600" : aproveitamentoBarra >= 80 ? "text-orange-600" : "text-red-600",
      bgColor: aproveitamentoBarra >= 90 ? "bg-green-50" : aproveitamentoBarra >= 80 ? "bg-orange-50" : "bg-red-50",
      drillDown: () => handleDrillDown(createPageUrl("Producao"))
    },
    {
      title: "Inadimplência",
      value: `${taxaInadimplencia}%`,
      subtitle: `R$ ${valorVencido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} vencido`,
      icon: AlertCircle,
      color: taxaInadimplencia < 5 ? "text-green-600" : taxaInadimplencia < 10 ? "text-orange-600" : "text-red-600",
      bgColor: taxaInadimplencia < 5 ? "bg-green-50" : taxaInadimplencia < 10 ? "bg-orange-50" : "bg-red-50",
      drillDown: () => handleDrillDown(createPageUrl("Financeiro"))
    }
  ];

  const kpiCards = [
    {
      title: "Clientes Ativos",
      value: clientesAtivos,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      drillDown: () => handleDrillDown(createPageUrl("Comercial"))
    },
    {
      title: "Produtos Cadastrados",
      value: totalProdutos,
      icon: Package,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      drillDown: () => handleDrillDown(createPageUrl("Estoque"))
    },
    {
      title: "Colaboradores",
      value: colaboradoresAtivos,
      icon: UserCircle,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      drillDown: () => handleDrillDown(createPageUrl("RH"))
    },
    {
      title: "Entregas Pendentes",
      value: entregasPendentes,
      icon: Truck,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      drillDown: () => handleDrillDown(createPageUrl("Expedicao"))
    },
    {
      title: "Estoque Baixo",
      value: produtosBaixoEstoque,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      alert: produtosBaixoEstoque > 0,
      drillDown: () => handleDrillDown(createPageUrl("Estoque"))
    },
    {
      title: "Total Pedidos",
      value: pedidosPeriodo.length,
      icon: ShoppingCart,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      drillDown: () => handleDrillDown(createPageUrl("Comercial"))
    }
  ];

  const quickAccess = [
    {
      title: "Comercial e Vendas",
      description: "Gestão de Clientes e Vendas",
      icon: ShoppingCart,
      color: "from-purple-500 to-purple-600",
      url: createPageUrl("Comercial"),
      count: pedidosPeriodo.length
    },
    {
      title: "Estoque e Almoxarifado",
      description: "Produtos e Movimentações",
      icon: Box,
      color: "from-indigo-500 to-indigo-600",
      url: createPageUrl("Estoque"),
      count: produtosBaixoEstoque > 0 ? produtosBaixoEstoque : null,
      alert: produtosBaixoEstoque > 0
    },
    {
      title: "Expedição e Logística",
      description: "Entregas e Logística",
      icon: Truck,
      color: "from-orange-500 to-orange-600",
      url: createPageUrl("Expedicao"),
      count: entregasPendentes
    },
    {
      title: "Financeiro e Contábil",
      description: "Contas e Fluxo de Caixa",
      icon: DollarSign,
      color: "from-green-500 to-green-600",
      url: createPageUrl("Financeiro"),
      count: null
    },
  ];

  return (
    <ProtectedSection module="Dashboard" action="ver">
    <div className="w-full h-full min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex-1 overflow-auto p-6 space-y-6">
      <DashboardHeader
        empresaAtual={empresaAtual}
        estaNoGrupo={estaNoGrupo}
        grupoAtual={grupoAtual}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        periodo={periodo}
        setPeriodo={setPeriodo}
      />

      <ErrorBoundary>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
        <DashboardTabsNav />

        <TabsContent value="tempo-real" className="overflow-auto">
          <PanelGroup direction="vertical" className="gap-2 min-h-[760px]">
            <Panel defaultSize={70} minSize={40} className="overflow-auto h-full">
              {activeTab === 'tempo-real' && (
                <Suspense fallback={<div className="h-40 rounded-md bg-slate-100 animate-pulse" />}>
                  <DashboardTempoReal empresaId={empresaAtual?.id} />
                </Suspense>
              )}
            </Panel>
            <PanelResizeHandle className="h-1 bg-slate-200 rounded" />
            <Panel defaultSize={30} minSize={20} className="overflow-auto h-full">
              <KPIsOperacionaisSection kpis={kpisOperacionais} />
            </Panel>
          </PanelGroup>
        </TabsContent>

        <TabsContent value="bi-operacional" className="overflow-auto">
          <PanelGroup direction="vertical" className="gap-2 min-h-[760px]">
            <Panel defaultSize={70} minSize={40} className="overflow-auto">
              {activeTab === 'bi-operacional' && (
                <Suspense fallback={<div className="h-40 rounded-md bg-slate-100 animate-pulse" />}>
                  <DashboardOperacionalBI />
                </Suspense>
              )}
            </Panel>
            <PanelResizeHandle className="h-1 bg-slate-200 rounded" />
            <Panel defaultSize={30} minSize={20} className="overflow-auto">
              <SecondaryKPIsSection kpis={kpiCards} />
            </Panel>
          </PanelGroup>
        </TabsContent>

        <TabsContent value="resumo" className="space-y-6 mt-6">
          <PanelGroup direction="vertical" className="gap-2">
            <Panel defaultSize={50} minSize={30} className="overflow-auto">
              {/* KPIs Principais + Widget Canais */}
              <StatsSection statsCards={statsCards} empresaId={empresaAtual?.id} />
            </Panel>
            <PanelResizeHandle className="h-1 bg-slate-200 rounded" />
            <Panel defaultSize={50} minSize={20} className="overflow-auto">
              {/* NOVOS KPIs OPERACIONAIS */}
              <KPIsOperacionaisSection kpis={kpisOperacionais} />
            </Panel>
          </PanelGroup>

          {/* KPIs Secundários */}
          <SecondaryKPIsSection kpis={kpiCards} />

          {/* Estoque Crítico */}
          <WidgetEstoqueCritico count={produtosBaixoEstoque} onNavigate={() => handleDrillDown(createPageUrl("Estoque"))} />

          {/* Gráficos + Top Produtos (redimensionável) */}
          <PanelGroup direction="horizontal" className="gap-2 min-h-[420px]">
            <Panel defaultSize={55} minSize={30} className="overflow-auto">
              <ChartsSection vendasUltimos30Dias={vendasUltimos30Dias} fluxo7Dias={fluxo7Dias} />
            </Panel>
            <PanelResizeHandle className="w-1 bg-slate-200 rounded" />
            <Panel defaultSize={45} minSize={20} className="overflow-auto">
              <TopProdutosStatusPeriodoSection topProdutos={topProdutos} dadosVendasStatus={dadosVendasStatus} COLORS={COLORS} />
            </Panel>
          </PanelGroup>

          {/* GRÁFICOS AVANÇADOS */}
          <AdvancedAnalysisSection
            vendasPorMes={vendasPorMesData}
            top5Clientes={top5ClientesData}
            statusPedidos={statusPedidosDataAll}
            fluxoCaixaMensal={fluxoCaixaMensalData}
            COLORS={COLORS}
          />

          {/* Módulos de Acesso Rápido */}
          <QuickAccessModulesGrid modules={quickAccess} onClick={handleDrillDown} />

          {/* Resumo Financeiro */}
          <FinancialSummary receitasPendentes={receitasPendentes} despesasPendentes={despesasPendentes} fluxoCaixa={fluxoCaixa} />

          {/* NOVO: Gamificação */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-600" />
              Rankings de Performance
            </h2>
            <Suspense fallback={<div className="h-40 rounded-md bg-slate-100 animate-pulse" />}>
              <GamificacaoOperacoes />
            </Suspense>
          </div>

          {/* Placeholder or replacement if PainelOperacoes3D was still intended for "resumo" tab */}
          {/* If PainelOperacoes3D should be nested within the "Resumo Geral" tab and not a separate view,
              it would go here, possibly conditionally or within a different section.
              Based on the outline, it's removed from the main switch. */}
          {/* Example: <PainelOperacoes3D empresaId={null} grupoId={null} /> */}
        </TabsContent>
      </Tabs>
      </ErrorBoundary>
      </div>
    </div>
  </ProtectedSection>
  );
}