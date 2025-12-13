import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingUp, DollarSign, ShoppingCart, Package, Users, AlertCircle, ArrowUpRight, ArrowDownRight, Activity, Zap, Target, TrendingDown, FileText, Truck, Box, CreditCard, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import useContextoGrupoEmpresa from "@/components/lib/useContextoGrupoEmpresa";

export default function DashboardCorporativo() {
  const { grupoAtual, empresasDoGrupo, estaNoGrupo, contexto } = useContextoGrupoEmpresa();
  
  const [periodoSelecionado, setPeriodoSelecionado] = useState("mes_atual");
  const [empresaSelecionada, setEmpresaSelecionada] = useState("todas");
  const [abaAtiva, setAbaAtiva] = useState("visao-geral");
  const [comparacaoAtiva, setComparacaoAtiva] = useState(true);

  // Calcular datas baseado no período
  const getDateRange = () => {
    const hoje = new Date();
    let dataInicio, dataFim;

    switch (periodoSelecionado) {
      case "mes_atual":
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        dataFim = hoje;
        break;
      case "mes_anterior":
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
        dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
        break;
      case "trimestre":
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1);
        dataFim = hoje;
        break;
      case "semestre":
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1);
        dataFim = hoje;
        break;
      case "ano":
        dataInicio = new Date(hoje.getFullYear(), 0, 1);
        dataFim = hoje;
        break;
      default:
        dataInicio = new Date(hoje.getFullYear(), 0, 1);
        dataFim = hoje;
    }

    return { dataInicio: dataInicio.toISOString().split('T')[0], dataFim: dataFim.toISOString().split('T')[0] };
  };

  const { dataInicio, dataFim } = getDateRange();

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos-dashboard-corp'],
    queryFn: () => base44.entities.Pedido.list('-created_date', 1000),
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes-dashboard-corp'],
    queryFn: () => base44.entities.Cliente.list(),
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas-dashboard-corp'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contas-receber-dashboard-corp'],
    queryFn: () => base44.entities.ContaReceber.list('-created_date', 500),
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contas-pagar-dashboard-corp'],
    queryFn: () => base44.entities.ContaPagar.list('-created_date', 500),
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos-dashboard-corp'],
    queryFn: () => base44.entities.Produto.list(),
  });

  const { data: entregas = [] } = useQuery({
    queryKey: ['entregas-dashboard-corp'],
    queryFn: () => base44.entities.Entrega.list('-created_date', 500),
  });

  // Filtrar por período e empresa
  const filtrarPorPeriodoEmpresa = (items, campoData = 'data_pedido') => {
    return items.filter(item => {
      const dentroDataInicio = !dataInicio || item[campoData] >= dataInicio;
      const dentroDataFim = !dataFim || item[campoData] <= dataFim;
      const daEmpresa = empresaSelecionada === "todas" || item.empresa_id === empresaSelecionada;
      return dentroDataInicio && dentroDataFim && daEmpresa;
    });
  };

  const pedidosFiltrados = filtrarPorPeriodoEmpresa(pedidos);
  const contasReceberFiltradas = filtrarPorPeriodoEmpresa(contasReceber, 'data_vencimento');
  const contasPagarFiltradas = filtrarPorPeriodoEmpresa(contasPagar, 'data_vencimento');
  const entregasFiltradas = filtrarPorPeriodoEmpresa(entregas, 'data_previsao');

  // 📊 KPIs Consolidados Avançados
  const totalVendas = pedidosFiltrados.reduce((sum, p) => sum + (p.valor_total || 0), 0);
  const totalPedidos = pedidosFiltrados.length;
  const ticketMedio = totalPedidos > 0 ? totalVendas / totalPedidos : 0;
  const totalEmpresas = empresasDoGrupo.length;

  // 💰 KPIs Financeiros
  const totalReceber = contasReceberFiltradas.reduce((sum, c) => sum + (c.valor || 0), 0);
  const totalRecebido = contasReceberFiltradas
    .filter(c => c.status === 'Recebido')
    .reduce((sum, c) => sum + (c.valor_recebido || c.valor || 0), 0);
  const taxaRecebimento = totalReceber > 0 ? (totalRecebido / totalReceber) * 100 : 0;

  const totalPagar = contasPagarFiltradas.reduce((sum, c) => sum + (c.valor || 0), 0);
  const totalPago = contasPagarFiltradas
    .filter(c => c.status === 'Pago')
    .reduce((sum, c) => sum + (c.valor_pago || c.valor || 0), 0);

  const fluxoCaixa = totalRecebido - totalPago;
  const margemLucro = totalVendas > 0 ? ((totalVendas - totalPago) / totalVendas) * 100 : 0;

  // 📦 KPIs Operacionais
  const totalClientesAtivos = clientes.filter(c => c.status === 'Ativo').length;
  const produtosEstoqueBaixo = produtos.filter(p => 
    (p.estoque_atual || 0) < (p.estoque_minimo || 0)
  ).length;

  const entregasRealizadas = entregasFiltradas.filter(e => e.status === 'Entregue').length;
  const entregasPendentes = entregasFiltradas.filter(e => 
    !['Entregue', 'Cancelado'].includes(e.status)
  ).length;
  const taxaEntrega = entregasFiltradas.length > 0 
    ? (entregasRealizadas / entregasFiltradas.length) * 100 
    : 0;

  // 📈 Comparação com período anterior
  const { dataInicio: dataInicioPeriodoAnterior } = (() => {
    const hoje = new Date();
    const diff = new Date(dataFim).getTime() - new Date(dataInicio).getTime();
    const diasDiff = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    const inicioAnterior = new Date(new Date(dataInicio).getTime() - (diasDiff * 24 * 60 * 60 * 1000));
    const fimAnterior = new Date(dataInicio);
    
    return { 
      dataInicio: inicioAnterior.toISOString().split('T')[0],
      dataFim: fimAnterior.toISOString().split('T')[0]
    };
  })();

  const pedidosPeriodoAnterior = pedidos.filter(p => {
    const dentroPeriodo = p.data_pedido >= dataInicioPeriodoAnterior && p.data_pedido < dataInicio;
    const daEmpresa = empresaSelecionada === "todas" || p.empresa_id === empresaSelecionada;
    return dentroPeriodo && daEmpresa;
  });

  const vendasPeriodoAnterior = pedidosPeriodoAnterior.reduce((sum, p) => sum + (p.valor_total || 0), 0);
  const crescimentoVendas = vendasPeriodoAnterior > 0 
    ? ((totalVendas - vendasPeriodoAnterior) / vendasPeriodoAnterior) * 100 
    : 0;

  // Faturamento por Empresa
  const faturamentoPorEmpresa = {};
  pedidosFiltrados.forEach(p => {
    const empresaNome = empresasDoGrupo.find(e => e.id === p.empresa_id)?.nome_fantasia || 'Outros';
    faturamentoPorEmpresa[empresaNome] = (faturamentoPorEmpresa[empresaNome] || 0) + (p.valor_total || 0);
  });

  const dadosEmpresa = Object.entries(faturamentoPorEmpresa)
    .map(([empresa, valor]) => ({ empresa, valor }))
    .sort((a, b) => b.valor - a.valor);

  // Evolução Mensal
  const evolucaoMensal = {};
  pedidosFiltrados.forEach(p => {
    const mes = p.data_pedido ? new Date(p.data_pedido).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }) : 'Sem data';
    evolucaoMensal[mes] = (evolucaoMensal[mes] || 0) + (p.valor_total || 0);
  });

  const dadosEvolucao = Object.entries(evolucaoMensal)
    .map(([mes, valor]) => ({ mes, valor }))
    .slice(-6);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (!estaNoGrupo) {
    return (
      <div className="p-6 lg:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <Card className="border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50 shadow-lg">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-orange-900 mb-2">
                    Dashboard Corporativo Requer Visão de Grupo
                  </h2>
                  <p className="text-orange-800">
                    Este dashboard consolida dados de <strong>múltiplas empresas</strong> do grupo empresarial.
                  </p>
                  <p className="text-orange-700 mt-2 text-sm">
                    Para visualizar, selecione o <strong>contexto de Grupo</strong> no seletor de empresas no cabeçalho.
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-4 p-3 bg-white rounded-lg border border-orange-200">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-slate-700">
                    Clique no seletor acima e escolha <strong>"Grupo Corporativo"</strong>
                  </span>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 w-full max-w-md">
                  <p className="text-xs font-semibold text-blue-900 mb-2">💡 O que você verá no Dashboard Corporativo:</p>
                  <ul className="text-xs text-blue-800 space-y-1 text-left">
                    <li>✓ Faturamento consolidado de todas as empresas</li>
                    <li>✓ Análise comparativa entre filiais</li>
                    <li>✓ Fluxo de caixa integrado do grupo</li>
                    <li>✓ Indicadores estratégicos e tendências</li>
                    <li>✓ Mapa de performance por região</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="p-6 lg:p-8 space-y-6 w-full h-full">
        <div className="w-full space-y-6">
          {/* Header com Filtros Avançados */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    Dashboard Corporativo
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-blue-100 text-blue-700">
                      <Users className="w-3 h-3 mr-1" />
                      {grupoAtual?.nome_do_grupo || 'Grupo'}
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-700">
                      {totalEmpresas} empresa(s)
                    </Badge>
                    <Badge className="bg-green-100 text-green-700">
                      <Activity className="w-3 h-3 mr-1" />
                      Tempo Real
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
                <SelectTrigger className="w-52 bg-white">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent style={{ zIndex: 9999999999 }}>
                  <SelectItem value="mes_atual">📅 Mês Atual</SelectItem>
                  <SelectItem value="mes_anterior">📅 Mês Anterior</SelectItem>
                  <SelectItem value="trimestre">📊 Último Trimestre</SelectItem>
                  <SelectItem value="semestre">📊 Último Semestre</SelectItem>
                  <SelectItem value="ano">🎯 Ano Completo</SelectItem>
                </SelectContent>
              </Select>

              <Select value={empresaSelecionada} onValueChange={setEmpresaSelecionada}>
                <SelectTrigger className="w-52 bg-white">
                  <SelectValue placeholder="Filtrar por empresa" />
                </SelectTrigger>
                <SelectContent style={{ zIndex: 9999999999 }}>
                  <SelectItem value="todas">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      Todas as Empresas
                    </div>
                  </SelectItem>
                  {empresasDoGrupo.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-purple-600" />
                        {emp.nome_fantasia || emp.razao_social}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant={comparacaoAtiva ? "default" : "outline"}
                onClick={() => setComparacaoAtiva(!comparacaoAtiva)}
                className="gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                {comparacaoAtiva ? 'Comparação Ativa' : 'Ativar Comparação'}
              </Button>
            </div>
          </div>

        {/* 📊 KPIs Principais com Comparação */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <DollarSign className="w-7 h-7" />
                </div>
                {comparacaoAtiva && (
                  <Badge className={`${crescimentoVendas >= 0 ? 'bg-green-500' : 'bg-red-500'} text-white flex items-center gap-1`}>
                    {crescimentoVendas >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(crescimentoVendas).toFixed(1)}%
                  </Badge>
                )}
              </div>
              <p className="text-sm text-blue-100 font-medium mb-1">Faturamento Total</p>
              <p className="text-3xl font-bold">
                R$ {totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              {comparacaoAtiva && (
                <p className="text-xs text-blue-200 mt-2">
                  vs R$ {vendasPeriodoAnterior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} período anterior
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <ShoppingCart className="w-7 h-7" />
                </div>
                <Badge className="bg-white/20 text-white flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {totalPedidos}
                </Badge>
              </div>
              <p className="text-sm text-green-100 font-medium mb-1">Pedidos Consolidados</p>
              <p className="text-3xl font-bold">{totalPedidos}</p>
              <p className="text-xs text-green-200 mt-2">
                Ticket Médio: R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <CreditCard className="w-7 h-7" />
                </div>
                <Badge className={`${fluxoCaixa >= 0 ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                  {fluxoCaixa >= 0 ? 'Positivo' : 'Negativo'}
                </Badge>
              </div>
              <p className="text-sm text-purple-100 font-medium mb-1">Fluxo de Caixa</p>
              <p className="text-3xl font-bold">
                R$ {Math.abs(fluxoCaixa).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-purple-200 mt-2">
                Margem: {margemLucro.toFixed(1)}% • {taxaRecebimento.toFixed(0)}% recebido
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Building2 className="w-7 h-7" />
                </div>
                <Badge className="bg-white/20 text-white">
                  {totalEmpresas} ativas
                </Badge>
              </div>
              <p className="text-sm text-orange-100 font-medium mb-1">Rede Empresarial</p>
              <p className="text-3xl font-bold">{totalEmpresas}</p>
              <p className="text-xs text-orange-200 mt-2">
                {totalClientesAtivos} clientes ativos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 🎯 KPIs Secundários - Operacionais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <Card className="border-0 shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Taxa de Entrega</p>
                    <p className="text-2xl font-bold text-slate-900">{taxaEntrega.toFixed(1)}%</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700">
                  {entregasRealizadas}/{entregasFiltradas.length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Box className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Estoque Crítico</p>
                    <p className="text-2xl font-bold text-slate-900">{produtosEstoqueBaixo}</p>
                  </div>
                </div>
                {produtosEstoqueBaixo > 0 && (
                  <Badge className="bg-orange-100 text-orange-700 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Atenção
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Entregas Pendentes</p>
                    <p className="text-2xl font-bold text-slate-900">{entregasPendentes}</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-700">
                  Em Andamento
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 📑 Sistema de Abas para Diferentes Visões */}
        <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
          <TabsList className="bg-white border border-slate-200 shadow-sm p-1">
            <TabsTrigger value="visao-geral" className="gap-2">
              <Activity className="w-4 h-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="comparativo" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Comparativo
            </TabsTrigger>
            <TabsTrigger value="operacional" className="gap-2">
              <Package className="w-4 h-4" />
              Operacional
            </TabsTrigger>
            <TabsTrigger value="inteligencia" className="gap-2">
              <Zap className="w-4 h-4" />
              IA Insights
            </TabsTrigger>
          </TabsList>

          {/* ABA: VISÃO GERAL */}
          <TabsContent value="visao-geral" className="space-y-6 mt-6 w-full">

            {/* Gráficos Principais */}
            <div className="grid lg:grid-cols-2 gap-6 w-full">
              {/* Faturamento por Empresa */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-slate-200">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart className="w-5 h-5 text-blue-600" />
                    Faturamento por Empresa
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={dadosEmpresa}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="empresa" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip 
                        formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      />
                      <Bar dataKey="valor" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Evolução Mensal */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Evolução Mensal
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={dadosEvolucao}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip 
                        formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      />
                      <Line type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Distribuição de Faturamento */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all w-full">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-200">
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-purple-600" />
                  Distribuição de Faturamento (%)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={dadosEmpresa}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ empresa, valor }) => `${empresa}: ${((valor / totalVendas) * 100).toFixed(1)}%`}
                      outerRadius={120}
                      dataKey="valor"
                    >
                      {dadosEmpresa.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA: FINANCEIRO */}
          <TabsContent value="financeiro" className="space-y-6 mt-6 w-full">
            <div className="grid md:grid-cols-2 gap-6 w-full">
              {/* Contas a Receber */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ArrowUpRight className="w-5 h-5 text-green-600" />
                    Contas a Receber
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total a Receber</span>
                    <span className="text-lg font-bold text-slate-900">
                      R$ {totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Já Recebido</span>
                    <span className="text-lg font-bold text-green-600">
                      R$ {totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-slate-500">Taxa de Recebimento</span>
                      <span className="text-sm font-bold text-blue-600">{taxaRecebimento.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(taxaRecebimento, 100)}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contas a Pagar */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ArrowDownRight className="w-5 h-5 text-red-600" />
                    Contas a Pagar
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total a Pagar</span>
                    <span className="text-lg font-bold text-slate-900">
                      R$ {totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Já Pago</span>
                    <span className="text-lg font-bold text-red-600">
                      R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-slate-500">Pendente</span>
                      <span className="text-sm font-bold text-orange-600">
                        R$ {(totalPagar - totalPago).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${totalPagar > 0 ? (totalPago / totalPagar) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Fluxo de Caixa Detalhado */}
            <Card className="border-0 shadow-lg w-full">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Análise de Fluxo de Caixa Consolidado
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs text-green-600 font-semibold mb-2">ENTRADAS</p>
                    <p className="text-2xl font-bold text-green-700">
                      R$ {totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-xs text-red-600 font-semibold mb-2">SAÍDAS</p>
                    <p className="text-2xl font-bold text-red-700">
                      R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className={`text-center p-4 rounded-lg border ${fluxoCaixa >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
                    <p className="text-xs text-slate-600 font-semibold mb-2">SALDO</p>
                    <p className={`text-2xl font-bold ${fluxoCaixa >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                      R$ {Math.abs(fluxoCaixa).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA: COMPARATIVO ENTRE EMPRESAS */}
          <TabsContent value="comparativo" className="space-y-6 mt-6 w-full">
            <Card className="border-0 shadow-lg w-full">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Ranking de Performance por Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {dadosEmpresa.map((item, index) => {
                    const percentual = (item.valor / totalVendas) * 100;
                    return (
                      <div key={index} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-lg font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-slate-900">{item.empresa}</span>
                            <span className="text-lg font-bold text-slate-900">
                              R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                                style={{ width: `${percentual}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-blue-600 min-w-[60px] text-right">
                              {percentual.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA: OPERACIONAL */}
          <TabsContent value="operacional" className="space-y-6 mt-6 w-full">
            <div className="grid lg:grid-cols-2 gap-6 w-full">
              {/* Logística e Entregas */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Truck className="w-5 h-5 text-green-600" />
                    Logística e Entregas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-700">{entregasRealizadas}</p>
                      <p className="text-xs text-slate-600">Entregues</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-orange-700">{entregasPendentes}</p>
                      <p className="text-xs text-slate-600">Pendentes</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-600">Taxa de Sucesso</span>
                      <span className="text-lg font-bold text-green-600">{taxaEntrega.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-teal-500 h-2.5 rounded-full"
                        style={{ width: `${taxaEntrega}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estoque Consolidado */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Box className="w-5 h-5 text-orange-600" />
                    Controle de Estoque
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-700">{produtos.length}</p>
                      <p className="text-xs text-slate-600">Produtos Ativos</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-red-700">{produtosEstoqueBaixo}</p>
                      <p className="text-xs text-slate-600">Estoque Crítico</p>
                    </div>
                  </div>
                  {produtosEstoqueBaixo > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs font-semibold text-red-700 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Atenção: {produtosEstoqueBaixo} produto(s) abaixo do estoque mínimo
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ABA: IA INSIGHTS */}
          <TabsContent value="inteligencia" className="space-y-6 mt-6 w-full">
            <Card className="border-0 shadow-lg w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
              <CardHeader className="bg-white/80 backdrop-blur-sm border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  Insights Inteligentes do Grupo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Insight 1: Melhor Empresa */}
                {dadosEmpresa.length > 0 && (
                  <div className="p-4 bg-white rounded-lg border border-purple-200 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900 mb-1">🏆 Empresa Líder em Faturamento</p>
                        <p className="text-xs text-slate-600">
                          <strong className="text-purple-600">{dadosEmpresa[0]?.empresa}</strong> lidera com{' '}
                          <strong>R$ {dadosEmpresa[0]?.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                          {' '}({((dadosEmpresa[0]?.valor / totalVendas) * 100).toFixed(1)}% do total)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Insight 2: Crescimento */}
                {comparacaoAtiva && (
                  <div className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        crescimentoVendas >= 0 ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {crescimentoVendas >= 0 ? (
                          <ArrowUpRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900 mb-1">
                          📈 Tendência de Crescimento
                        </p>
                        <p className="text-xs text-slate-600">
                          {crescimentoVendas >= 0 ? (
                            <>
                              Crescimento de <strong className="text-green-600">{crescimentoVendas.toFixed(1)}%</strong> em relação ao período anterior. Continue assim! 🚀
                            </>
                          ) : (
                            <>
                              Redução de <strong className="text-red-600">{Math.abs(crescimentoVendas).toFixed(1)}%</strong> em relação ao período anterior. Atenção! ⚠️
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Insight 3: Saúde Financeira */}
                <div className="p-4 bg-white rounded-lg border border-green-200 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 mb-1">💚 Saúde Financeira do Grupo</p>
                      <p className="text-xs text-slate-600">
                        Margem de lucro operacional de <strong className="text-green-600">{margemLucro.toFixed(1)}%</strong>.
                        {fluxoCaixa >= 0 ? (
                          <> Fluxo de caixa <strong className="text-green-600">positivo</strong> em R$ {fluxoCaixa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Excelente! ✅</>
                        ) : (
                          <> Fluxo de caixa <strong className="text-red-600">negativo</strong>. Atenção ao capital de giro. ⚠️</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Insight 4: Entregas */}
                <div className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Truck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 mb-1">🚚 Performance Logística</p>
                      <p className="text-xs text-slate-600">
                        Taxa de entrega de <strong className="text-blue-600">{taxaEntrega.toFixed(1)}%</strong> com{' '}
                        <strong>{entregasRealizadas}</strong> entregas concluídas.
                        {taxaEntrega >= 95 ? ' Excelente desempenho! 🎯' : taxaEntrega >= 85 ? ' Bom desempenho. 👍' : ' Há espaço para melhorias. 📊'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}