import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Link2,
  ShieldCheck,
  PieChart
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

export default function DashboardFinanceiroUnificado({ empresaId, windowMode = false }) {
  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contasReceber'],
    queryFn: () => base44.entities.ContaReceber.list(),
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contasPagar'],
    queryFn: () => base44.entities.ContaPagar.list(),
  });

  const { data: ordensLiquidacao = [] } = useQuery({
    queryKey: ['caixa-ordens'],
    queryFn: () => base44.entities.CaixaOrdemLiquidacao.list(),
  });

  const { data: pagamentosOmni = [] } = useQuery({
    queryKey: ['pagamentos-omni'],
    queryFn: () => base44.entities.PagamentoOmnichannel.list(),
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => base44.entities.Pedido.list(),
  });

  // Filtrar por empresa se necessário
  const crFiltradas = empresaId ? contasReceber.filter(c => c.empresa_id === empresaId) : contasReceber;
  const cpFiltradas = empresaId ? contasPagar.filter(c => c.empresa_id === empresaId) : contasPagar;
  const ordFiltradas = empresaId ? ordensLiquidacao.filter(o => o.empresa_id === empresaId) : ordensLiquidacao;
  const pagFiltrados = empresaId ? pagamentosOmni.filter(p => p.empresa_id === empresaId) : pagamentosOmni;

  // Cálculos
  const totalReceber = crFiltradas.filter(c => c.status === 'Pendente').reduce((s, c) => s + (c.valor || 0), 0);
  const totalPagar = cpFiltradas.filter(c => c.status === 'Pendente').reduce((s, c) => s + (c.valor || 0), 0);
  const saldoLiquido = totalReceber - totalPagar;

  const ordensRecebimento = ordFiltradas.filter(o => o.tipo_operacao === 'Recebimento');
  const ordensPagamento = ordFiltradas.filter(o => o.tipo_operacao === 'Pagamento');
  const ordensLiquidadas = ordFiltradas.filter(o => o.status === 'Liquidado').length;
  const ordensPendentes = ordFiltradas.filter(o => o.status === 'Pendente').length;

  const pagamentosAprovados = pagFiltrados.filter(p => p.status_transacao === 'Capturado' || p.status_transacao === 'Autorizado').length;
  const pagamentosPendentes = pagFiltrados.filter(p => p.status_conferencia === 'Pendente').length;

  const pedidosAprovacaoPendente = pedidos.filter(p => p.status_aprovacao === 'pendente').length;

  const cobrancasGeradas = crFiltradas.filter(c => c.status_cobranca && c.status_cobranca !== 'nao_gerada').length;
  const cobrancasPagas = crFiltradas.filter(c => c.status === 'Recebido').length;
  const taxaConversao = cobrancasGeradas > 0 ? ((cobrancasPagas / cobrancasGeradas) * 100).toFixed(1) : 0;

  // Dados para gráficos
  const dadosFluxo = [
    { nome: 'A Receber', valor: totalReceber, fill: '#10b981' },
    { nome: 'A Pagar', valor: totalPagar, fill: '#ef4444' }
  ];

  const dadosOmnichannel = pagFiltrados.reduce((acc, p) => {
    const origem = p.origem_pagamento;
    if (!acc[origem]) acc[origem] = 0;
    acc[origem] += p.valor_bruto || 0;
    return acc;
  }, {});

  const dadosOrigemChart = Object.entries(dadosOmnichannel).map(([origem, valor]) => ({
    origem,
    valor
  }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981'];

  return (
    <div className={windowMode ? "w-full h-full flex flex-col overflow-auto" : "space-y-6"}>
      <div className={windowMode ? "p-6 space-y-6 flex-1" : "space-y-6"}>
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              A Receber
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700">
              R$ {totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-green-600 mt-1">{crFiltradas.filter(c => c.status === 'Pendente').length} títulos</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              A Pagar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-700">
              R$ {totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-red-600 mt-1">{cpFiltradas.filter(c => c.status === 'Pendente').length} títulos</p>
          </CardContent>
        </Card>

        <Card className={`border-2 ${saldoLiquido >= 0 ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50' : 'border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className={`w-4 h-4 ${saldoLiquido >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              Saldo Líquido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${saldoLiquido >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              R$ {saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className={`text-xs mt-1 ${saldoLiquido >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {saldoLiquido >= 0 ? 'Positivo' : 'Negativo'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wallet className="w-4 h-4 text-purple-600" />
              Caixa Central
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-700">{ordensLiquidadas}</p>
            <p className="text-xs text-purple-600 mt-1">{ordensPendentes} pendentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas ETAPA 4 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-white border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Ordens Recebimento</p>
                <p className="text-xl font-bold text-green-700">{ordensRecebimento.length}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Ordens Pagamento</p>
                <p className="text-xl font-bold text-red-700">{ordensPagamento.length}</p>
              </div>
              <TrendingDown className="w-6 h-6 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Pagtos Omnichannel</p>
                <p className="text-xl font-bold text-blue-700">{pagamentosAprovados}</p>
              </div>
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Aprovações Pendentes</p>
                <p className="text-xl font-bold text-orange-700">{pedidosAprovacaoPendente}</p>
              </div>
              <ShieldCheck className="w-6 h-6 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Taxa Conversão</p>
                <p className="text-xl font-bold text-purple-700">{taxaConversao}%</p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base">Fluxo de Caixa Previsto</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dadosFluxo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Bar dataKey="valor" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base">Pagamentos por Canal (Omnichannel)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {dadosOrigemChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPie>
                  <Pie
                    data={dadosOrigemChart}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ origem, valor }) => `${origem}: R$ ${valor.toFixed(0)}`}
                    outerRadius={80}
                    dataKey="valor"
                  >
                    {dadosOrigemChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <PieChart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum pagamento omnichannel registrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>


      </div>
    </div>
  );
}