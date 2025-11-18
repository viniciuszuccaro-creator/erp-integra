import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, TrendingUp, DollarSign, ShoppingCart, Package, Users, AlertCircle } from "lucide-react";
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
  const { grupoAtual, empresasDoGrupo, estaNoGrupo } = useContextoGrupoEmpresa();
  
  const [periodoSelecionado, setPeriodoSelecionado] = useState("mes_atual");
  const [empresaSelecionada, setEmpresaSelecionada] = useState("todas");

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
    queryKey: ['pedidos-dashboard'],
    queryFn: () => base44.entities.Pedido.list('-created_date'),
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes-dashboard'],
    queryFn: () => base44.entities.Cliente.list(),
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas-dashboard'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  // Filtrar por período e empresa
  const pedidosFiltrados = pedidos.filter(p => {
    const dentroDataInicio = !dataInicio || p.data_pedido >= dataInicio;
    const dentroDataFim = !dataFim || p.data_pedido <= dataFim;
    const daEmpresa = empresaSelecionada === "todas" || p.empresa_id === empresaSelecionada;
    return dentroDataInicio && dentroDataFim && daEmpresa;
  });

  // KPIs Consolidados
  const totalVendas = pedidosFiltrados.reduce((sum, p) => sum + (p.valor_total || 0), 0);
  const totalPedidos = pedidosFiltrados.length;
  const ticketMedio = totalPedidos > 0 ? totalVendas / totalPedidos : 0;
  const totalEmpresas = empresasDoGrupo.length;

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
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-orange-600" />
              <p className="text-orange-900">
                Este dashboard é apenas para visão consolidada do grupo. Mude para o contexto de grupo no menu.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto min-h-[calc(100vh-4rem)]"> {/* ETAPA 1: w-full + responsivo */}
      <div className="max-w-full space-y-6">
        {/* Header com Filtros */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Building2 className="w-8 h-8 text-purple-600" />
              Dashboard Corporativo
            </h1>
            <p className="text-slate-600 mt-1">
              {grupoAtual?.nome_do_grupo || 'Grupo'} • {totalEmpresas} empresa(s)
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mes_atual">Mês Atual</SelectItem>
                <SelectItem value="mes_anterior">Mês Anterior</SelectItem>
                <SelectItem value="trimestre">Último Trimestre</SelectItem>
                <SelectItem value="semestre">Último Semestre</SelectItem>
                <SelectItem value="ano">Ano Completo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={empresaSelecionada} onValueChange={setEmpresaSelecionada}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Empresas</SelectItem>
                {empresasDoGrupo.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.nome_fantasia || emp.razao_social}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Faturamento Total</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">
                    R$ {totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Total de Pedidos</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">{totalPedidos}</p>
                </div>
                <ShoppingCart className="w-12 h-12 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium">Ticket Médio</p>
                  <p className="text-3xl font-bold text-purple-900 mt-2">
                    R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700 font-medium">Empresas Ativas</p>
                  <p className="text-3xl font-bold text-orange-900 mt-2">{totalEmpresas}</p>
                </div>
                <Building2 className="w-12 h-12 text-orange-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Faturamento por Empresa */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-base">Faturamento por Empresa</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosEmpresa}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="empresa" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                  <Bar dataKey="valor" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Evolução Mensal */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-base">Evolução Mensal</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosEvolucao}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                  <Line type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Distribuição */}
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base">Distribuição de Faturamento (%)</CardTitle>
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
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}