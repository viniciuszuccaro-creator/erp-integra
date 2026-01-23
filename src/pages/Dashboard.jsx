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
const WidgetCanaisOrigem = React.lazy(() => import("@/components/dashboard/WidgetCanaisOrigem"));


export default function Dashboard() {
  const navigate = useNavigate();
  const { empresaAtual, estaNoGrupo, grupoAtual } = useContextoVisual();

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
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        return await base44.entities.Pedido.filter(filtro, '-created_date', 9999);
      } catch (err) {
        console.error('Erro ao buscar pedidos:', err);
        return [];
      }
    },
    refetchInterval,
    staleTime: 30000,
    retry: 2
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contasReceber', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        return await base44.entities.ContaReceber.filter(filtro, '-data_vencimento', 9999);
      } catch (err) {
        console.error('Erro ao buscar contas a receber:', err);
        return [];
      }
    },
    refetchInterval,
    staleTime: 30000,
    retry: 2
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contasPagar', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        return await base44.entities.ContaPagar.filter(filtro, '-data_vencimento', 9999);
      } catch (err) {
        console.error('Erro ao buscar contas a pagar:', err);
        return [];
      }
    },
    refetchInterval,
    staleTime: 30000,
    retry: 2
  });

  const { data: entregas = [] } = useQuery({
    queryKey: ['entregas', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        return await base44.entities.Entrega.filter(filtro, '-created_date', 9999);
      } catch (err) {
        console.error('Erro ao buscar entregas:', err);
        return [];
      }
    },
    refetchInterval,
    staleTime: 30000,
    retry: 1
  });

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_alocada_id: empresaAtual.id } : {};
        return await base44.entities.Colaborador.filter(filtro, '-created_date', 9999);
      } catch (err) {
        console.error('Erro ao buscar colaboradores:', err);
        return [];
      }
    },
    refetchInterval,
    staleTime: 60000,
    retry: 1
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        return await base44.entities.Produto.filter(filtro, '-created_date', 9999);
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
        return [];
      }
    },
    refetchInterval,
    staleTime: 60000,
    retry: 1
  });

  const { data: totalProdutos = 0 } = useQuery({
    queryKey: ['produtos-count-dash', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
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
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        return await base44.entities.Cliente.filter(filtro, '-created_date', 9999);
      } catch (err) {
        console.error('Erro ao buscar clientes:', err);
        return [];
      }
    },
    refetchInterval,
    staleTime: 60000,
    retry: 1
  });

  const { data: totalClientes = 0 } = useQuery({
    queryKey: ['clientes-count', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
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
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        return await base44.entities.OrdemProducao.filter(filtro, '-data_emissao', 9999);
      } catch (err) {
        console.error('Erro ao buscar ordens de produção:', err);
        return [];
      }
    },
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
    <div className="w-full h-full min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex-1 overflow-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard Executivo</h1>
          <p className="text-slate-600">
            {estaNoGrupo 
              ? `Visão Consolidada • ${grupoAtual?.nome_do_grupo || 'Grupo'}` 
              : `${empresaAtual?.nome_fantasia || empresaAtual?.razao_social || 'Empresa'}`
            }
          </p>
        </div>
        <div className="flex gap-3 items-center">
          {/* Removed visualizacao toggle buttons */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={autoRefresh ? "bg-green-50 text-green-700" : "bg-slate-100"}>
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-slate-400'} mr-2`} />
              {autoRefresh ? 'Atualização automática (60s)' : 'Atualização manual'}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'Desativar' : 'Ativar'}
            </Button>
          </div>
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dia">Hoje</SelectItem>
              <SelectItem value="semana">Esta Semana</SelectItem>
              <SelectItem value="mes">Este Mês</SelectItem>
              <SelectItem value="trimestre">Trimestre</SelectItem>
              <SelectItem value="ano">Este Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => (
              <Card 
                key={index} 
                onClick={stat.drillDown}
                className="hover:shadow-lg transition-all duration-300 border-0 overflow-hidden cursor-pointer group"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform`} />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stat.textColor} mb-1`}>{stat.value}</div>
                  <p className="text-xs text-slate-500">{stat.subtitle}</p>
                </CardContent>
              </Card>
            ))}
            
            {/* Widget Canais de Origem */}
            <div className="md:col-span-2 lg:col-span-2">
              <Suspense fallback={<div className="h-28 rounded-md bg-slate-100 animate-pulse" />}>
                <WidgetCanaisOrigem empresaId={empresaAtual?.id} />
              </Suspense>
            </div>
          </div>

          {/* NOVOS KPIs OPERACIONAIS */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">KPIs Operacionais</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {kpisOperacionais.map((kpi, index) => (
                <Card 
                  key={index} 
                  onClick={kpi.drillDown}
                  className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-all"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                        <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
                    <p className="text-xs text-slate-600 mt-1">{kpi.title}</p>
                    {kpi.subtitle && <p className="text-xs text-slate-500 mt-0.5">{kpi.subtitle}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* KPIs Secundários */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Indicadores de Performance (KPIs)</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {kpiCards.map((kpi, index) => (
                <Card 
                  key={index} 
                  onClick={kpi.drillDown}
                  className={`border-0 shadow-md cursor-pointer hover:shadow-lg transition-all ${kpi.alert ? 'ring-2 ring-red-300' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                        <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
                    <p className="text-xs text-slate-600 mt-1">{kpi.title}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Vendas últimos 30 dias */}
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Vendas - Últimos 30 Dias
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={vendasUltimos30Dias}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Area type="monotone" dataKey="valor" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Fluxo de Caixa 7 dias */}
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Fluxo de Caixa - 7 Dias
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={fluxo7Dias}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
                    <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Produtos e Status Pedidos */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Produtos */}
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-500" />
                  Top 5 Produtos Mais Vendidos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {topProdutos.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topProdutos} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="nome" type="category" width={150} tick={{ fontSize: 11 }} />
                      <Tooltip 
                        formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                        contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      />
                      <Bar dataKey="valor" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="py-20 text-center text-slate-500">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>Nenhuma venda no período</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pedidos por Status */}
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-purple-500" />
                  Pedidos por Status (Período Atual)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {dadosVendasStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPie>
                      <Pie
                        data={dadosVendasStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({nome, quantidade}) => `${nome}: ${quantidade}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="quantidade"
                      >
                        {dadosVendasStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [`${value} pedidos`, props.payload.nome]}
                        contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                ) : (
                  <div className="py-20 text-center text-slate-500">
                    <PieChart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>Nenhum pedido no período</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* GRÁFICOS AVANÇADOS */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Análise Detalhada</h2>
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Vendas por Mês */}
              <Card className="border-0 shadow-md">
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    Vendas por Mês (Ano Atual)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {vendasPorMes().length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={vendasPorMes()}>
                        <defs>
                          <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
                                 contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}/>
                        <Area type="monotone" dataKey="valor" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVendas)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="py-20 text-center text-slate-500">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>Nenhuma venda registrada no ano atual</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top 5 Clientes */}
              <Card className="border-0 shadow-md">
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-500" />
                    Top 5 Clientes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {top5Clientes().length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={top5Clientes()} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" tick={{ fontSize: 12 }} />
                        <YAxis dataKey="cliente" type="category" width={120} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
                                 contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}/>
                        <Bar dataKey="valor" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="py-20 text-center text-slate-500">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>Nenhum cliente com vendas</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Status de Pedidos */}
              <Card className="border-0 shadow-md">
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-purple-500" />
                    Pedidos por Status (Todos)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {statusPedidosData().length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <RechartsPie>
                        <Pie
                          data={statusPedidosData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ status, quantidade }) => `${status}: ${quantidade}`}
                          outerRadius={80}
                          dataKey="quantidade"
                        >
                          {statusPedidosData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name, props) => [`${value} pedidos`, props.payload.status]}
                          contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                        />
                      </RechartsPie>
                    </ResponsiveContainer>
                  ) : (
                    <div className="py-20 text-center text-slate-500">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>Nenhum pedido registrado</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Fluxo de Caixa Mensal */}
              <Card className="border-0 shadow-md">
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-red-500" />
                    Fluxo de Caixa Mensal (Ano Atual)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {fluxoCaixaMensal().length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={fluxoCaixaMensal()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
                                 contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}/>
                        <Legend />
                        <Bar dataKey="entradas" fill="#10b981" name="Entradas" />
                        <Bar dataKey="saidas" fill="#ef4444" name="Saídas" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="py-20 text-center text-slate-500">
                      <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>Nenhum movimento financeiro registrado no ano atual</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Módulos de Acesso Rápido */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Acesso Rápido aos Módulos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickAccess.map((module, index) => (
                <Card 
                  key={index} 
                  onClick={() => handleDrillDown(module.url)}
                  className="hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group cursor-pointer h-full"
                >
                  <div className={`h-2 bg-gradient-to-r ${module.color}`} />
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-4 rounded-xl bg-gradient-to-br ${module.color} shadow-lg group-hover:scale-110 transition-transform`}>
                        <module.icon className="w-8 h-8 text-white" />
                      </div>
                      {module.count !== null && (
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          module.alert ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {module.count}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{module.title}</h3>
                    <p className="text-slate-600 text-sm mb-4">{module.description}</p>
                    <div className="flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                      Acessar <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Resumo Financeiro */}
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b bg-slate-50">
              <CardTitle>Resumo Financeiro do Período</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-sm text-slate-600 mb-1">Receitas Pendentes</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {receitasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-center p-6 bg-red-50 rounded-lg">
                  <TrendingDown className="w-8 h-8 mx-auto mb-2 text-red-600" />
                  <p className="text-sm text-slate-600 mb-1">Despesas Pendentes</p>
                  <p className="text-2xl font-bold text-red-600">
                    R$ {despesasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className={`text-center p-6 ${fluxoCaixa >= 0 ? 'bg-blue-50' : 'bg-orange-50'} rounded-lg`}>
                  <DollarSign className={`w-8 h-8 mx-auto mb-2 ${fluxoCaixa >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                  <p className="text-sm text-slate-600 mb-1">Saldo Projetado</p>
                  <p className={`text-2xl font-bold ${fluxoCaixa >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    R$ {fluxoCaixa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

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
  );
}