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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import ProtectedSection from "@/components/security/ProtectedSection";
const WidgetCanaisOrigem = React.lazy(() => import("@/components/dashboard/WidgetCanaisOrigem"));
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsSection from "@/components/dashboard/StatsSection";
import KPIsOperacionaisSection from "@/components/dashboard/KPIsOperacionaisSection";
import SecondaryKPIsSection from "@/components/dashboard/SecondaryKPIsSection";
import ChartsSection from "@/components/dashboard/ChartsSection";
import TopProdutosStatusPeriodoSection from "@/components/dashboard/TopProdutosStatusPeriodoSection";
import AdvancedAnalysisSection from "@/components/dashboard/AdvancedAnalysisSection";
import QuickAccessModulesGrid from "@/components/dashboard/QuickAccessModulesGrid";
import FinancialSummary from "@/components/dashboard/FinancialSummary";


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
  const refetchInterval = autoRefresh ? 60000 : false; // 60 segundos

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos', empresaAtual?.id],
    queryFn: () => filterInContext('Pedido', {}, '-created_date', 9999),
    refetchInterval,
    staleTime: 30000,
    retry: 2
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contasReceber', empresaAtual?.id],
    queryFn: () => filterInContext('ContaReceber', {}, '-data_vencimento', 9999),
    refetchInterval,
    staleTime: 30000,
    retry: 2
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contasPagar', empresaAtual?.id],
    queryFn: () => filterInContext('ContaPagar', {}, '-data_vencimento', 9999),
    refetchInterval,
    staleTime: 30000,
    retry: 2
  });

  const { data: entregas = [] } = useQuery({
    queryKey: ['entregas', empresaAtual?.id],
    queryFn: () => filterInContext('Entrega', {}, '-created_date', 9999),
    refetchInterval,
    staleTime: 30000,
    retry: 1
  });

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores', empresaAtual?.id],
    queryFn: () => filterInContext('Colaborador', {}, '-created_date', 9999, 'empresa_alocada_id'),
    refetchInterval,
    staleTime: 60000,
    retry: 1
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos', empresaAtual?.id],
    queryFn: () => filterInContext('Produto', {}, '-created_date', 9999),
    refetchInterval,
    staleTime: 60000,
    retry: 1
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
    queryKey: ['clientes', empresaAtual?.id],
    queryFn: () => filterInContext('Cliente', {}, '-created_date', 9999),
    refetchInterval,
    staleTime: 60000,
    retry: 1
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
    queryKey: ['ordensProducao', empresaAtual?.id],
    queryFn: () => filterInContext('OrdemProducao', {}, '-data_emissao', 9999),
    refetchInterval,
    staleTime: 30000,
    retry: 1
  });

  // Filtros de período
  const filtrarPorPeriodo = (data) => {
    const hoje = new Date();
    const dataComparacao = new Date(data);
    
    if (periodo === "dia") {
      return dataComparacao.toDateString() === hoje.toDateString();
    } else if (periodo === "semana") {
      const semanaAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
      return dataComparacao >= semanaAtras && dataComparacao <= hoje;
    } else if (periodo === "mes") {
      return dataComparacao.getMonth() === hoje.getMonth() && 
             dataComparacao.getFullYear() === hoje.getFullYear();
    } else if (periodo === "trimestre") {
      const trimestre = Math.floor(hoje.getMonth() / 3);
      const trimestreData = Math.floor(dataComparacao.getMonth() / 3);
      return trimestreData === trimestre && 
             dataComparacao.getFullYear() === hoje.getFullYear();
    } else if (periodo === "ano") {
      return dataComparacao.getFullYear() === hoje.getFullYear();
    }
    return true;
  };

  // KPIs Principais
  const pedidosPeriodo = pedidos.filter(p => p.data_pedido && filtrarPorPeriodo(p.data_pedido));
  const totalVendas = pedidosPeriodo
    .filter(p => p.status !== 'Cancelado')
    .reduce((sum, p) => sum + (p.valor_total || 0), 0);
  
  const ticketMedio = pedidosPeriodo.length > 0 ? totalVendas / pedidosPeriodo.length : 0;
  
  const receitasPendentes = contasReceber
    .filter(c => c.status === 'Pendente')
    .reduce((sum, c) => sum + (c.valor || 0), 0);
  
  const despesasPendentes = contasPagar
    .filter(c => c.status === 'Pendente')
    .reduce((sum, c) => sum + (c.valor || 0), 0);

  const fluxoCaixa = receitasPendentes - despesasPendentes;

  const produtosBaixoEstoque = produtos.filter(p => 
    p.estoque_atual <= p.estoque_minimo && p.status === 'Ativo'
  ).length;

  const colaboradoresAtivos = colaboradores.filter(c => c.status === 'Ativo').length;
  const clientesAtivos = clientes.filter(c => c.status === 'Ativo').length;
  const taxaConversao = totalClientes > 0 
    ? ((pedidosPeriodo.filter(p => p.status !== 'Cancelado').length / totalClientes) * 100).toFixed(1)
    : 0;

  const entregasPendentes = entregas.filter(e => 
    e.status !== 'Entregue' && e.status !== 'Devolvido'
  ).length;

  // NOVOS KPIs OPERACIONAIS
  
  // OTD (On-Time Delivery) - % de entregas no prazo
  const entregasConcluidas = entregas.filter(e => e.status === 'Entregue' && e.data_entrega);
  const entregasNoPrazo = entregasConcluidas.filter(e => {
    if (!e.data_previsao || !e.data_entrega) return false;
    return new Date(e.data_entrega) <= new Date(e.data_previsao);
  });
  const otd = entregasConcluidas.length > 0 
    ? ((entregasNoPrazo.length / entregasConcluidas.length) * 100).toFixed(1)
    : 0;

  // Peso Produzido (kg) - total produzido no período
  const opsConcluidas = ordensProducao.filter(op => 
    op.status === 'Concluída' && op.data_conclusao_real && filtrarPorPeriodo(op.data_conclusao_real)
  );
  const pesoProduzido = opsConcluidas.reduce((sum, op) => {
    return sum + ((op.quantidade_produzida || 0) * (op.peso_unitario_kg || 0));
  }, 0);

  // Aproveitamento de Barra (%) - (produzido - refugado) / planejado
  const totalPlanejado = ordensProducao
    .filter(op => op.data_emissao && filtrarPorPeriodo(op.data_emissao))
    .reduce((sum, op) => sum + (op.quantidade_planejada || 0), 0);
  const totalProduzido = ordensProducao
    .filter(op => op.data_emissao && filtrarPorPeriodo(op.data_emissao))
    .reduce((sum, op) => sum + (op.quantidade_produzida || 0), 0);
  const totalRefugado = ordensProducao
    .filter(op => op.data_emissao && filtrarPorPeriodo(op.data_emissao))
    .reduce((sum, op) => sum + (op.quantidade_refugada || 0), 0);
  const aproveitamentoBarra = totalPlanejado > 0
    ? (((totalProduzido - totalRefugado) / totalPlanejado) * 100).toFixed(1)
    : 0;

  // Inadimplência (%) - contas vencidas / total contas
  const contasVencidas = contasReceber.filter(c => {
    if (c.status !== 'Pendente' || !c.data_vencimento) return false;
    return new Date(c.data_vencimento) < new Date();
  });
  const valorVencido = contasVencidas.reduce((sum, c) => sum + (c.valor || 0), 0);
  const totalContas = contasReceber
    .filter(c => c.status === 'Pendente')
    .reduce((sum, c) => sum + (c.valor || 0), 0);
  const taxaInadimplencia = totalContas > 0
    ? ((valorVencido / totalContas) * 100).toFixed(1)
    : 0;

  // Dados para gráficos
  const vendasPorStatus = pedidosPeriodo.reduce((acc, p) => {
    const status = p.status || 'Indefinido';
    if (!acc[status]) acc[status] = { nome: status, valor: 0, quantidade: 0 };
    acc[status].valor += p.valor_total || 0;
    acc[status].quantidade += 1;
    return acc;
  }, {});

  const dadosVendasStatus = Object.values(vendasPorStatus);

  // Vendas dos últimos 30 dias
  const vendasUltimos30Dias = Array.from({ length: 30 }, (_, i) => {
    const data = new Date();
    data.setDate(data.getDate() - (29 - i));
    const dataStr = data.toISOString().split('T')[0];
    
    const vendasDia = pedidos.filter(p => p.data_pedido === dataStr && p.status !== 'Cancelado')
      .reduce((sum, p) => sum + (p.valor_total || 0), 0);
    
    return {
      dia: `${data.getDate()}/${data.getMonth() + 1}`,
      valor: vendasDia
    };
  });

  // Fluxo de Caixa últimos 7 dias
  const fluxo7Dias = Array.from({ length: 7 }, (_, i) => {
    const data = new Date();
    data.setDate(data.getDate() - (6 - i));
    const dataStr = data.toISOString().split('T')[0];
    
    const recebimentos = contasReceber.filter(c => c.data_recebimento === dataStr)
      .reduce((sum, c) => sum + (c.valor || 0), 0);
    
    const pagamentos = contasPagar.filter(c => c.data_pagamento === dataStr)
      .reduce((sum, c) => sum + (c.valor || 0), 0);
    
    return {
      dia: `${data.getDate()}/${data.getMonth() + 1}`,
      receitas: recebimentos,
      despesas: pagamentos,
      saldo: recebimentos - pagamentos
    };
  });

  // Top Produtos
  const produtosComMovimento = pedidos
    .filter(p => p.itens && p.data_pedido && filtrarPorPeriodo(p.data_pedido))
    .flatMap(p => p.itens || [])
    .reduce((acc, item) => {
      const key = item.descricao;
      if (!acc[key]) {
        acc[key] = { nome: key, quantidade: 0, valor: 0 };
      }
      acc[key].quantidade += item.quantidade || 0;
      acc[key].valor += item.valor_total || 0;
      return acc;
    }, {});

  const topProdutos = Object.values(produtosComMovimento)
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);

  // Dados para gráficos avançados
  const vendasPorMes = () => {
    const meses = {};
    pedidos.forEach(p => {
      if (p.status !== 'Cancelado' && p.data_pedido) {
        const date = new Date(p.data_pedido);
        // Only consider the current year for simplicity, adjust as needed for multi-year view
        if (date.toString() !== "Invalid Date" && date.getFullYear() === new Date().getFullYear()) {
          const mesKey = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }); // e.g., "jan/23"
          if (!meses[mesKey]) meses[mesKey] = { mes: mesKey, valor: 0 };
          meses[mesKey].valor += p.valor_total || 0;
        }
      }
    });

    // Sort chronologically
    const sortedMonths = Object.values(meses).sort((a, b) => {
      const [aMonthStr, aYearStr] = a.mes.split('/');
      const [bMonthStr, bYearStr] = b.mes.split('/');
      // Robust parsing for month string + year
      const monthOrder = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      const aMonthIdx = monthOrder.indexOf(aMonthStr.toLowerCase());
      const bMonthIdx = monthOrder.indexOf(bMonthStr.toLowerCase());
      
      const aYear = parseInt(aYearStr, 10) + 2000; // Assuming 2-digit year like "23" means 2023
      const bYear = parseInt(bYearStr, 10) + 2000;

      if (aYear !== bYear) return aYear - bYear;
      return aMonthIdx - bMonthIdx;
    });

    return sortedMonths;
  };

  const top5Clientes = () => {
    const porCliente = {};
    pedidos.forEach(p => {
      if (p.status !== 'Cancelado' && p.cliente_nome) {
        const cliente = p.cliente_nome;
        if (!porCliente[cliente]) porCliente[cliente] = 0;
        porCliente[cliente] += p.valor_total || 0;
      }
    });
    return Object.entries(porCliente)
      .map(([cliente, valor]) => ({ cliente, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
  };

  const statusPedidosData = () => {
    const porStatus = {};
    pedidos.forEach(p => {
      const status = p.status || 'Indefinido';
      if (!porStatus[status]) porStatus[status] = 0;
      porStatus[status]++;
    });
    return Object.entries(porStatus).map(([status, quantidade]) => ({ status, quantidade }));
  };

  const fluxoCaixaMensal = () => {
    const meses = {};
    const currentYear = new Date().getFullYear();

    const getMonthKey = (dateString) => {
      const date = new Date(dateString);
      if (date.toString() === "Invalid Date") return null;
      if (date.getFullYear() !== currentYear) return null; // Filter for current year
      return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    };
    
    // Recebimentos
    contasReceber.filter(c => c.status === 'Recebido' && c.data_recebimento).forEach(c => {
      const mesKey = getMonthKey(c.data_recebimento);
      if (mesKey) {
        if (!meses[mesKey]) meses[mesKey] = { mes: mesKey, entradas: 0, saidas: 0 };
        meses[mesKey].entradas += c.valor_recebido || c.valor || 0;
      }
    });

    // Pagamentos
    contasPagar.filter(c => c.status === 'Pago' && c.data_pagamento).forEach(c => {
      const mesKey = getMonthKey(c.data_pagamento);
      if (mesKey) {
        if (!meses[mesKey]) meses[mesKey] = { mes: mesKey, entradas: 0, saidas: 0 };
        meses[mesKey].saidas += c.valor_pago || c.valor || 0;
      }
    });

    const sortedMonths = Object.values(meses).sort((a, b) => {
      const [aMonthStr, aYearStr] = a.mes.split('/');
      const [bMonthStr, bYearStr] = b.mes.split('/');
      const monthOrder = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      const aMonthIdx = monthOrder.indexOf(aMonthStr.toLowerCase());
      const bMonthIdx = monthOrder.indexOf(bMonthStr.toLowerCase());
      
      const aYear = parseInt(aYearStr, 10) + 2000;
      const bYear = parseInt(bYearStr, 10) + 2000;

      if (aYear !== bYear) return aYear - bYear;
      return aMonthIdx - bMonthIdx;
    });

    return sortedMonths;
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Pré-computos para seções avançadas (evita recalcular em cada render de subcomponente)
  const vendasPorMesData = vendasPorMes();
  const top5ClientesData = top5Clientes();
  const statusPedidosDataAll = statusPedidosData();
  const fluxoCaixaMensalData = fluxoCaixaMensal();

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
      subtitle: `${opsConcluidas.length} OPs concluídas`,
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
    <ProtectedSection module="Dashboard" action="visualizar">
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
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="tempo-real" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Activity className="w-4 h-4 mr-2" />
            Tempo Real
          </TabsTrigger>
          <TabsTrigger value="resumo" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            Resumo Geral
          </TabsTrigger>
          <TabsTrigger value="bi-operacional" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            🤖 BI Operacional
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tempo-real">
          <Suspense fallback={<div className="h-40 rounded-md bg-slate-100 animate-pulse" />}>
            <DashboardTempoReal empresaId={empresaAtual?.id} />
          </Suspense>
        </TabsContent>

        <TabsContent value="bi-operacional">
          <Suspense fallback={<div className="h-40 rounded-md bg-slate-100 animate-pulse" />}>
            <DashboardOperacionalBI />
          </Suspense>
        </TabsContent>

        <TabsContent value="resumo" className="space-y-6 mt-6">
          {/* KPIs Principais + Widget Canais */}
          <StatsSection statsCards={statsCards} empresaId={empresaAtual?.id} />

          {/* NOVOS KPIs OPERACIONAIS */}
          <KPIsOperacionaisSection kpis={kpisOperacionais} />

          {/* KPIs Secundários */}
          <SecondaryKPIsSection kpis={kpiCards} />

          {/* Gráficos */}
          <ChartsSection vendasUltimos30Dias={vendasUltimos30Dias} fluxo7Dias={fluxo7Dias} />

          {/* Top Produtos e Status Pedidos */}
          <TopProdutosStatusPeriodoSection topProdutos={topProdutos} dadosVendasStatus={dadosVendasStatus} COLORS={COLORS} />

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