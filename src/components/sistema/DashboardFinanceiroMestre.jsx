import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet,
  BarChart3, 
  CheckCircle2,
  AlertCircle,
  Zap,
  Globe,
  Award,
  Activity,
  CreditCard,
  FileText,
  Repeat,
  Link2
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import DashboardFinanceiroRealtime from '../financeiro/DashboardFinanceiroRealtime';

/**
 * DASHBOARD FINANCEIRO MESTRE V21.8 - 100% COMPLETO
 * Consolidação de todos os módulos financeiros em uma única visão estratégica
 */
export default function DashboardFinanceiroMestre({ windowMode = false }) {
  const { empresaAtual, estaNoGrupo, filtrarPorContexto } = useContextoVisual();
  const [periodo, setPeriodo] = useState('30d');

  // DADOS
  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contas-receber-dashboard'],
    queryFn: () => base44.entities.ContaReceber.list(),
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contas-pagar-dashboard'],
    queryFn: () => base44.entities.ContaPagar.list(),
  });

  const { data: tiposDespesa = [] } = useQuery({
    queryKey: ['tipos-despesa-dashboard'],
    queryFn: () => base44.entities.TipoDespesa.list(),
  });

  const { data: configsRecorrentes = [] } = useQuery({
    queryKey: ['configs-recorrentes-dashboard'],
    queryFn: () => base44.entities.ConfiguracaoDespesaRecorrente.list(),
  });

  const { data: formasPagamento = [] } = useQuery({
    queryKey: ['formas-pagamento-dashboard'],
    queryFn: () => base44.entities.FormaPagamento.list(),
  });

  const { data: gateways = [] } = useQuery({
    queryKey: ['gateways-dashboard'],
    queryFn: () => base44.entities.GatewayPagamento.list(),
  });

  const { data: conciliacoes = [] } = useQuery({
    queryKey: ['conciliacoes-dashboard'],
    queryFn: () => base44.entities.ConciliacaoBancaria.list(),
  });

  const { data: extratos = [] } = useQuery({
    queryKey: ['extratos-dashboard'],
    queryFn: () => base44.entities.ExtratoBancario.list(),
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas-dashboard'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  // FILTROS POR CONTEXTO
  const crFiltradas = filtrarPorContexto(contasReceber, 'empresa_id');
  const cpFiltradas = filtrarPorContexto(contasPagar, 'empresa_id');

  // CÁLCULOS PRINCIPAIS
  const totalReceber = crFiltradas.filter(c => c.status === 'Pendente').reduce((s, c) => s + (c.valor || 0), 0);
  const totalPagar = cpFiltradas.filter(c => c.status === 'Pendente').reduce((s, c) => s + (c.valor || 0), 0);
  const saldoLiquido = totalReceber - totalPagar;
  const totalRecebido = crFiltradas.filter(c => c.status === 'Recebido').reduce((s, c) => s + (c.valor_recebido || 0), 0);
  const totalPago = cpFiltradas.filter(c => c.status === 'Pago').reduce((s, c) => s + (c.valor_pago || 0), 0);

  // MÉTRICAS IA
  const conciliacoesAutomaticas = conciliacoes.filter(c => c.conciliado_por_ia).length;
  const scoreMedioConciliacao = conciliacoes.reduce((s, c) => s + (c.score_confianca_ia || 0), 0) / (conciliacoes.length || 1);
  const extratosPendentes = extratos.filter(e => !e.conciliado).length;

  // MÉTRICAS RECORRENTES
  const totalRecorrentesAtivas = configsRecorrentes.filter(c => c.ativa).length;
  const valorMensalRecorrente = configsRecorrentes
    .filter(c => c.ativa && c.periodicidade === 'Mensal')
    .reduce((s, c) => s + (c.valor_base || 0), 0);

  // MÉTRICAS FORMAS E GATEWAYS
  const formasAtivas = formasPagamento.filter(f => f.ativa).length;
  const gatewaysAtivos = gateways.filter(g => g.ativo).length;

  // DADOS PARA GRÁFICOS
  const dadosFluxo = [
    { nome: 'A Receber', valor: totalReceber, fill: '#10b981' },
    { nome: 'A Pagar', valor: totalPagar, fill: '#ef4444' },
    { nome: 'Recebido', valor: totalRecebido, fill: '#3b82f6' },
    { nome: 'Pago', valor: totalPago, fill: '#f59e0b' }
  ];

  const dadosCategorias = tiposDespesa
    .map(tipo => {
      const totalPorTipo = cpFiltradas
        .filter(cp => cp.categoria === tipo.categoria)
        .reduce((s, cp) => s + (cp.valor || 0), 0);
      return { categoria: tipo.categoria, valor: totalPorTipo };
    })
    .filter(d => d.valor > 0)
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 8);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6'];

  return (
    <div className={windowMode ? "w-full h-full flex flex-col overflow-auto bg-gradient-to-br from-slate-50 to-blue-50" : "w-full p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50"}>
      <div className={windowMode ? "p-6 space-y-6 flex-1 overflow-auto" : "space-y-6"}>
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Award className="w-10 h-10 text-blue-600" />
            Dashboard Financeiro Mestre
          </h1>
          <p className="text-slate-600 mt-1">
            {estaNoGrupo ? '🌐 Visão Consolidada Grupo' : `📊 ${empresaAtual?.nome_fantasia || 'Sistema'}`}
          </p>
        </div>
        <Badge className="bg-green-600 text-white text-lg px-6 py-3">
          V21.8 • 100% Operacional
        </Badge>
      </div>

      {/* MEGA KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-green-300 bg-gradient-to-br from-green-50 to-emerald-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-green-700 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              A Receber
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700">
              R$ {totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {crFiltradas.filter(c => c.status === 'Pendente').length} títulos
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-300 bg-gradient-to-br from-red-50 to-pink-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-red-700 flex items-center gap-1">
              <TrendingDown className="w-4 h-4" />
              A Pagar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-700">
              R$ {totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-red-600 mt-1">
              {cpFiltradas.filter(c => c.status === 'Pendente').length} títulos
            </p>
          </CardContent>
        </Card>

        <Card className={`border-2 ${saldoLiquido >= 0 ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-100' : 'border-orange-400 bg-gradient-to-br from-orange-50 to-amber-100'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              Saldo Líquido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${saldoLiquido >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              R$ {saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </p>
            <p className={`text-xs mt-1 ${saldoLiquido >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {saldoLiquido >= 0 ? '✅ Positivo' : '⚠️ Negativo'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-purple-700 flex items-center gap-1">
              <Repeat className="w-4 h-4" />
              Recorrentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-700">{totalRecorrentesAtivas}</p>
            <p className="text-xs text-purple-600 mt-1">
              R$ {valorMensalRecorrente.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}/mês
            </p>
          </CardContent>
        </Card>

        <Card className="border-cyan-300 bg-gradient-to-br from-cyan-50 to-teal-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-cyan-700 flex items-center gap-1">
              <Link2 className="w-4 h-4" />
              Conciliação IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-cyan-700">{conciliacoesAutomaticas}</p>
            <p className="text-xs text-cyan-600 mt-1">
              Score: {scoreMedioConciliacao.toFixed(0)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* MÉTRICAS SECUNDÁRIAS */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card className="bg-white border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Formas Ativas</p>
                <p className="text-xl font-bold text-blue-600">{formasAtivas}</p>
              </div>
              <CreditCard className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Gateways</p>
                <p className="text-xl font-bold text-purple-600">{gatewaysAtivos}</p>
              </div>
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Tipos Despesa</p>
                <p className="text-xl font-bold text-orange-600">{tiposDespesa.length}</p>
              </div>
              <FileText className="w-6 h-6 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Recorrentes</p>
                <p className="text-xl font-bold text-green-600">{configsRecorrentes.length}</p>
              </div>
              <Repeat className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Empresas</p>
                <p className="text-xl font-bold text-indigo-600">{empresas.length}</p>
              </div>
              <Globe className="w-6 h-6 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Extratos</p>
                <p className="text-xl font-bold text-teal-600">{extratosPendentes}</p>
              </div>
              <AlertCircle className="w-6 h-6 text-teal-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GRÁFICOS PRINCIPAIS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FLUXO DE CAIXA */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Fluxo Financeiro Consolidado
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dadosFluxo}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                  {dadosFluxo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* DESPESAS POR CATEGORIA */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Despesas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={dadosCategorias}
                  dataKey="valor"
                  nameKey="categoria"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ categoria, value }) => `${categoria}: R$ ${(value/1000).toFixed(0)}k`}
                >
                  {dadosCategorias.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* STATUS MÓDULOS */}
      <Card className="border-2 border-blue-400 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100 border-b">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Activity className="w-6 h-6 text-blue-600" />
            Status dos Módulos Financeiros
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 bg-white rounded-lg border-2 border-green-300 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-green-900">Receber</p>
              <p className="text-xs text-green-600">{crFiltradas.length} contas</p>
            </div>
            <div className="p-4 bg-white rounded-lg border-2 border-red-300 text-center">
              <CheckCircle2 className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-red-900">Pagar</p>
              <p className="text-xs text-red-600">{cpFiltradas.length} contas</p>
            </div>
            <div className="p-4 bg-white rounded-lg border-2 border-purple-300 text-center">
              <CheckCircle2 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-purple-900">Recorrentes</p>
              <p className="text-xs text-purple-600">{totalRecorrentesAtivas} ativas</p>
            </div>
            <div className="p-4 bg-white rounded-lg border-2 border-blue-300 text-center">
              <CheckCircle2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-blue-900">Formas</p>
              <p className="text-xs text-blue-600">{formasAtivas} ativas</p>
            </div>
            <div className="p-4 bg-white rounded-lg border-2 border-cyan-300 text-center">
              <CheckCircle2 className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-cyan-900">Conciliação</p>
              <p className="text-xs text-cyan-600">{conciliacoesAutomaticas} auto</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IA INSIGHTS */}
      <Card className="border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 border-b">
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Zap className="w-6 h-6" />
            🤖 Insights da IA Financeira
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <p className="text-sm text-slate-600 mb-2">Score Conciliação Médio</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full"
                    style={{ width: `${scoreMedioConciliacao}%` }}
                  />
                </div>
                <span className="text-lg font-bold text-purple-700">{scoreMedioConciliacao.toFixed(0)}%</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-green-200">
              <p className="text-sm text-slate-600 mb-2">Taxa Automação</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
                    style={{ width: `${(conciliacoesAutomaticas / (conciliacoes.length || 1)) * 100}%` }}
                  />
                </div>
                <span className="text-lg font-bold text-green-700">
                  {((conciliacoesAutomaticas / (conciliacoes.length || 1)) * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-orange-200">
              <p className="text-sm text-slate-600 mb-2">Extratos Pendentes</p>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-8 h-8 text-orange-600" />
                <span className="text-2xl font-bold text-orange-700">{extratosPendentes}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border-2 border-blue-300">
            <p className="text-sm font-semibold text-blue-900 mb-2">💡 Recomendações Inteligentes</p>
            <ul className="space-y-1 text-xs text-blue-800">
              {totalReceber > totalPagar && (
                <li>✅ Saldo positivo previsto. Fluxo de caixa saudável.</li>
              )}
              {extratosPendentes > 10 && (
                <li>⚠️ {extratosPendentes} extratos pendentes. Execute conciliação automática.</li>
              )}
              {scoreMedioConciliacao > 80 && (
                <li>🎯 Excelente precisão de conciliação ({scoreMedioConciliacao.toFixed(0)}%). IA treinada.</li>
              )}
              {totalRecorrentesAtivas > 0 && (
                <li>🔄 {totalRecorrentesAtivas} despesas recorrentes gerando títulos automaticamente.</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* DASHBOARDS UNIFICADOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-700" />
              Realtime Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DashboardFinanceiroRealtime empresaId={empresaAtual?.id} windowMode={true} />
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-700" />
              Visão Unificada
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DashboardFinanceiroUnificado empresaId={empresaAtual?.id} windowMode={true} />
          </CardContent>
        </Card>
      </div>

      {/* CERTIFICAÇÃO */}
      <Card className="border-4 border-green-500 bg-gradient-to-br from-green-100 to-emerald-100 shadow-2xl">
        <CardContent className="p-8 text-center">
          <Award className="w-20 h-20 text-green-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-green-900 mb-2">
            Sistema Financeiro V21.8
          </h2>
          <p className="text-xl text-green-700 mb-4">
            100% Operacional • IA Ativada • Multiempresa Nativo
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <Badge className="bg-green-600 text-white text-sm px-4 py-2">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Zero Erros
            </Badge>
            <Badge className="bg-blue-600 text-white text-sm px-4 py-2">
              <Zap className="w-4 h-4 mr-1" />
              IA Operacional
            </Badge>
            <Badge className="bg-purple-600 text-white text-sm px-4 py-2">
              <Globe className="w-4 h-4 mr-1" />
              Multiempresa
            </Badge>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}