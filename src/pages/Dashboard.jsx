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
  Activity,
  FileText
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
import usePermissions from "@/components/lib/usePermissions";
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
import { ResizablePanelGroup as PanelGroup, ResizablePanel as Panel, ResizableHandle as PanelResizeHandle } from "@/components/ui/resizable";
import useDashboardDerivedData from "@/components/dashboard/hooks/useDashboardDerivedData";


export default function Dashboard() {
  const navigate = useNavigate();
  const { empresaAtual, estaNoGrupo, grupoAtual, filterInContext, getFiltroContexto } = useContextoVisual();
  const { hasPermission } = usePermissions();
  const canSeeFinanceiro = hasPermission('Financeiro', null, 'ver');
  const canSeeCRM = hasPermission('CRM', null, 'ver');
  const canSeeComercial = hasPermission('Comercial', null, 'ver');
  const canSeeEstoque = hasPermission('Estoque', null, 'ver');
  const canSeeExpedicao = hasPermission('Expedição', null, 'ver');
  const canSeeRH = hasPermission('RH', null, 'ver');
  const canSeeCompras = hasPermission('Compras', null, 'ver');
  const canSeeProducao = hasPermission('Produção', null, 'ver');

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
      enabled: canSeeComercial && (empresaAtual?.id || estaNoGrupo),
      queryKey: ['pedidos', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
      queryFn: async () => {
        if (!(empresaAtual?.id || estaNoGrupo)) return [];
        return await filterInContext('Pedido', {}, '-created_date', 9999);
      },
    refetchInterval,
    staleTime: 120000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    initialData: []
  });

  const { data: contasReceber = [] } = useQuery({
      enabled: canSeeFinanceiro && (empresaAtual?.id || estaNoGrupo),
      queryKey: ['contasReceber', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
      queryFn: async () => {
        if (!(empresaAtual?.id || estaNoGrupo)) return [];
        return await filterInContext('ContaReceber', {}, '-data_vencimento', 9999);
      },
    refetchInterval,
    staleTime: 120000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    initialData: []
  });

  const { data: contasPagar = [] } = useQuery({
      enabled: canSeeFinanceiro && (empresaAtual?.id || estaNoGrupo),
      queryKey: ['contasPagar', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
      queryFn: async () => {
        if (!(empresaAtual?.id || estaNoGrupo)) return [];
        return await filterInContext('ContaPagar', {}, '-data_vencimento', 9999);
      },
    refetchInterval,
    staleTime: 120000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    initialData: []
  });

  const { data: entregas = [] } = useQuery({
      enabled: canSeeExpedicao && (empresaAtual?.id || estaNoGrupo),
      queryKey: ['entregas', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
      queryFn: async () => {
        if (!(empresaAtual?.id || estaNoGrupo)) return [];
        return await filterInContext('Entrega', {}, '-created_date', 9999);
      },
    refetchInterval,
    staleTime: 120000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    initialData: []
  });

  const { data: colaboradores = [] } = useQuery({
      enabled: canSeeRH && (empresaAtual?.id || estaNoGrupo),
      queryKey: ['colaboradores', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
      queryFn: async () => {
        if (!(empresaAtual?.id || estaNoGrupo)) return [];
        return await filterInContext('Colaborador', {}, '-created_date', 9999);
      },
    refetchInterval,
    staleTime: 120000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    initialData: []
  });

  const { data: produtos = [] } = useQuery({
      enabled: canSeeEstoque && (empresaAtual?.id || estaNoGrupo),
      queryKey: ['produtos', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
      queryFn: async () => {
        if (!(empresaAtual?.id || estaNoGrupo)) return [];
        return await filterInContext('Produto', {}, '-created_date', 9999);
      },
    refetchInterval,
    staleTime: 120000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    initialData: []
  });

  const { data: totalProdutos = 0 } = useQuery({
    enabled: !!(empresaAtual?.id || estaNoGrupo) && canSeeEstoque,
    queryKey: ['produtos-count-dash', empresaAtual?.id, grupoAtual?.id],
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
    staleTime: 120000,
    retry: 1, !!(empresaAtual?.id || estaNoGrupo)
  });

  const { data: clientes = [] } = useQuery({
      enabled: canSeeCRM && (empresaAtual?.id || estaNoGrupo),
      queryKey: ['clientes', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
      queryFn: async () => {
        if (!(empresaAtual?.id || estaNoGrupo)) return [];
        return await filterInContext('Cliente', {}, '-created_date', 9999);
      },
    refetchInterval,
    staleTime: 120000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false, canSeeCRM && (empresaAtual?.id || estaNoGrupo),
    initialData: []
  });

  const { data: totalClientes = 0 } = useQuery({
    enabled: !!(empresaAtual?.id || estaNoGrupo) && canSeeCRM,
    queryKey: ['clientes-count', empresaAtual?.id, grupoAtual?.id],
    queryFn: async () => {
      try {
        const filtro = getFiltroContexto('empresa_id', true);
        const response = await base44.functions.invoke('countEntities', {
          entityName: 'Cliente',
          filter: filtro
        });
        return response.data?.count || clientes.length;
      } catch {
        return clientes.length;
      }
    },
    staleTime: 120000,
    retry: 1, !!(empresaAtual?.id || estaNoGrupo)
  });

  const { data: totalColaboradoresDash = 0 } = useQuery({
    queryKey: ['colaboradores-count-dash', empresaAtual?.id, grupoAtual?.id],
    queryFn: async () => {
      try {
        const filtro = getFiltroContexto('empresa_alocada_id', true);
        const response = await base44.functions.invoke('countEntities', {
          entityName: 'Colaborador',
          filter: filtro
        });
        return response.data?.count || colaboradores.length;
      } catch {
        return colaboradores.length;
      }
    },
    staleTime: 120000,
    retry: 1, !!(empresaAtual?.id || estaNoGrupo)
  });

  const { data: ordensProducao = [] } = useQuery({
      enabled: canSeeProducao && (empresaAtual?.id || estaNoGrupo),
      queryKey: ['ordensProducao', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
      queryFn: async () => {
        if (!(empresaAtual?.id || estaNoGrupo)) return [];
        return await filterInContext('OrdemProducao', {}, '-data_emissao', 9999);
      },
    refetchInterval,
    staleTime: 120000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false, canSeeProducao && (empresaAtual?.id || estaNoGrupo),
    initialData: []
  });

  const { data: notasFiscais = [] } = useQuery({
      enabled: (canSeeFinanceiro || hasPermission('Fiscal', null, 'ver') || canSeeComercial) && (empresaAtual?.id || estaNoGrupo),
      queryKey: ['notasFiscais', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
      queryFn: async () => {
        if (!(empresaAtual?.id || estaNoGrupo)) return [];
        return await filterInContext('NotaFiscal', {}, '-created_date', 9999);
      },
    refetchInterval,
    staleTime: 120000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    initialData: []
  });

  const nfAutorizadas = (notasFiscais || []).filter(n => n?.status === 'Autorizada').length;

  const { data: cobrancas = [] } = useQuery({
      enabled: canSeeFinanceiro && (empresaAtual?.id || estaNoGrupo),
      queryKey: ['cobrancas', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
      queryFn: async () => {
        if (!(empresaAtual?.id || estaNoGrupo)) return [];
        return await filterInContext('ContaReceber', {}, '-data_vencimento', 9999);
      },
    refetchInterval,
    staleTime: 120000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    initialData: []
  });

  const cobrancasPagas = (cobrancas || []).filter(c => (c?.status === 'Recebido') || (c?.status_cobranca === 'paga')).length;

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

  const { data: previsoesIA = {}, isLoading: loadingPrevIA } = useQuery({
    queryKey: ['iaPrevEstoque14', empresaAtual?.id, grupoAtual?.id, periodo],
    queryFn: async () => {
      if (!(empresaAtual?.id || estaNoGrupo)) return { previsoes: [] };
      const filtros = getFiltroContexto('empresa_id', true);
      const res = await base44.functions.invoke('iaFinanceAnomalyScan', {
        filtros,
        previsao_estoque: { enabled: true, horizon_days: 14 }
      });
      return res?.data || { previsoes: [] };
    },
    staleTime: 120000,
    enabled: canSeeEstoque && (empresaAtual?.id || estaNoGrupo)
  });

  const { data: previsoesIA30 = {} } = useQuery({
    queryKey: ['iaPrevEstoque30', empresaAtual?.id, grupoAtual?.id, periodo],
    queryFn: async () => {
      if (!(empresaAtual?.id || estaNoGrupo)) return { previsoes: [] };
      const filtros = getFiltroContexto('empresa_id', true);
      const res = await base44.functions.invoke('iaFinanceAnomalyScan', {
        filtros,
        previsao_estoque: { enabled: true, horizon_days: 30 }
      });
      return res?.data || { previsoes: [] };
    },
    staleTime: 120000,
    enabled: canSeeEstoque && (empresaAtual?.id || estaNoGrupo)
  });

  const { data: anomaliasIA = {}, isLoading: loadingAnomIA } = useQuery({
    queryKey: ['iaAnomaliasFinanceiro', empresaAtual?.id, grupoAtual?.id],
    queryFn: async () => {
      if (!(empresaAtual?.id || estaNoGrupo)) return { details: [] };
      const filtros = getFiltroContexto('empresa_id', true);
      const res = await base44.functions.invoke('iaFinanceAnomalyScan', { filtros });
      return res?.data || { details: [] };
    },
    staleTime: 120000,
    enabled: canSeeFinanceiro && (empresaAtual?.id || estaNoGrupo)
  });

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
      value: totalColaboradoresDash,
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
      value: pedidos.length,
      icon: ShoppingCart,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      drillDown: () => handleDrillDown(createPageUrl("Comercial"))
    },
    {
      title: "NF-e Autorizadas",
      value: nfAutorizadas,
      icon: FileText,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      drillDown: () => handleDrillDown(createPageUrl("Fiscal"))
    },
    {
      title: "Cobranças Pagas",
      value: cobrancasPagas,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      drillDown: () => handleDrillDown(createPageUrl("Financeiro"))
    }
  ];

  const quickAccessBase = [
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

  const quickAccess = quickAccessBase.filter((m) => (
    (m.title.includes('Comercial') && canSeeComercial) ||
    (m.title.includes('Estoque') && canSeeEstoque) ||
    (m.title.includes('Expedição') && canSeeExpedicao) ||
    (m.title.includes('Financeiro') && canSeeFinanceiro)
  ));

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
            <Panel defaultSize={70} minSize={40} className="overflow-auto h-full">
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

          {/* Anomalias Financeiras (IA) – hiperpersonalização por role */}
          {canSeeFinanceiro && (
            <Card className="bg-white/80 backdrop-blur-sm mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  Anomalias Financeiras Detectadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAnomIA ? (
                  <div className="h-10 rounded-md bg-slate-100 animate-pulse" />
                ) : (
                  (() => {
                    const list = anomaliasIA?.details || [];
                    if (!list.length) return <p className="text-sm text-slate-600">Nenhuma anomalia relevante.</p>;
                    const resumo = list.reduce((acc, i) => { acc[i.severity || 'baixo'] = (acc[i.severity || 'baixo'] || 0) + 1; return acc; }, {});
                    return (
                      <div className="flex flex-wrap gap-2 text-sm">
                        <Badge className="bg-red-100 text-red-700">Alta: {resumo.alto || 0}</Badge>
                        <Badge className="bg-amber-100 text-amber-700">Média: {resumo.medio || 0}</Badge>
                        <Badge variant="outline">Baixa: {resumo.baixo || 0}</Badge>
                      </div>
                    );
                  })()
                )}
              </CardContent>
            </Card>
          )}

          {/* Estoque Crítico */}
          <WidgetEstoqueCritico 
            preds14Count={(previsoesIA?.previsoes || []).filter(p => p.risco_ruptura && p.risco_ruptura !== 'baixo').length}
            preds30Count={(previsoesIA30?.previsoes || []).filter(p => p.risco_ruptura && p.risco_ruptura !== 'baixo').length}
            count={produtosBaixoEstoque}
            onNavigate={() => handleDrillDown(createPageUrl("Estoque"))}
          />

          {/* Gráficos + Top Produtos (redimensionável) */}
          <PanelGroup direction="vertical" className="gap-2 min-h-[420px]">
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

          {/* Previsões de Estoque (IA) - visível apenas para quem vê Estoque */}
          {canSeeEstoque && (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  Previsões de Estoque (14 dias)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingPrevIA ? (
                  <div className="h-10 rounded-md bg-slate-100 animate-pulse" />
                ) : (
                  (() => {
                    const preds = (previsoesIA?.previsoes || [])
                      .filter(p => p.risco_ruptura && p.risco_ruptura !== 'baixo')
                      .sort((a, b) => (a.dias_cobertura ?? 999) - (b.dias_cobertura ?? 999))
                      .slice(0, 8);
                    if (!preds.length) return <p className="text-sm text-slate-600">Sem riscos relevantes no horizonte.</p>;
                    return (
                      <div className="grid md:grid-cols-2 gap-3">
                        {preds.map((p, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white">
                            <div>
                              <div className="font-medium text-slate-900 truncate max-w-[340px]">{p.descricao}</div>
                              <div className="text-xs text-slate-500">Cobertura: {p.dias_cobertura ?? '-'} dias • Demanda/dia: {p.demanda_dia_estimada ?? '-'} {p.preco_previsto != null && (<span className="ml-2">• Preço previsto: R$ {p.preco_previsto}</span>)}</div>
                            </div>
                            <Badge className={p.risco_ruptura === 'alto' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}>
                              {String(p.risco_ruptura || '').toUpperCase()}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                )}
              </CardContent>
            </Card>
          )}

          {/* Módulos de Acesso Rápido */}
          {/* Previsões de Estoque (IA) - visível apenas para quem vê Estoque */}
          <ProtectedSection module="Estoque" action="ver" hideInstead>
          {canSeeEstoque && (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  Previsões de Estoque (30 dias)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingPrevIA ? (
                  <div className="h-10 rounded-md bg-slate-100 animate-pulse" />
                ) : (
                  (() => {
                    const preds = (previsoesIA30?.previsoes || [])
                      .filter(p => p.risco_ruptura && p.risco_ruptura !== 'baixo')
                      .sort((a, b) => (a.dias_cobertura ?? 999) - (b.dias_cobertura ?? 999))
                      .slice(0, 8);
                    if (!preds.length) return <p className="text-sm text-slate-600">Sem riscos relevantes no horizonte.</p>;
                    return (
                      <div className="grid md:grid-cols-2 gap-3">
                        {preds.map((p, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white">
                            <div>
                              <div className="font-medium text-slate-900 truncate max-w-[340px]">{p.descricao}</div>
                              <div className="text-xs text-slate-500">Cobertura: {p.dias_cobertura ?? '-'} dias • Demanda/dia: {p.demanda_dia_estimada ?? '-'} {p.preco_previsto != null && (<span className="ml-2">• Preço previsto: R$ {p.preco_previsto}</span>)}</div>
                            </div>
                            <Badge className={p.risco_ruptura === 'alto' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}>
                              {String(p.risco_ruptura || '').toUpperCase()}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                )}
              </CardContent>
            </Card>
          )}

          </ProtectedSection>

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