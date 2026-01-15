import React, { useState, useEffect, Suspense } from "react";
import { base44 } from "@/api/base44Client";
const DashboardFormasPagamento = React.lazy(() => import("../components/financeiro/DashboardFormasPagamento"));
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  FileText,
  BarChart3,
  Building2,
  Split,
  GitBranch,
  CheckCircle2,
  Link2,
  Sparkles,
  Wallet,
  Globe,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
const ContasReceberTab = React.lazy(() => import("../components/financeiro/ContasReceberTab"));
const ContasPagarTab = React.lazy(() => import("../components/financeiro/ContasPagarTab"));
import { useContextoVisual } from "@/components/lib/useContextoVisual";
const PainelConciliacao = React.lazy(() => import("../components/financeiro/PainelConciliacao"));
const ConfiguracaoCobranca = React.lazy(() => import("../components/financeiro/ConfiguracaoCobranca"));
const RelatorioFinanceiro = React.lazy(() => import("../components/financeiro/RelatorioFinanceiro"));
const RateioMultiempresa = React.lazy(() => import("../components/financeiro/RateioMultiempresa"));
const ReguaCobrancaIA = React.lazy(() => import("../components/financeiro/ReguaCobrancaIA"));
import usePermissions from "@/components/lib/usePermissions";
import { useWindow } from "@/components/lib/useWindow";
const ContaReceberForm = React.lazy(() => import("../components/financeiro/ContaReceberForm"));
const ContaPagarForm = React.lazy(() => import("../components/financeiro/ContaPagarForm"));
const ConciliacaoBancaria = React.lazy(() => import("../components/financeiro/ConciliacaoBancaria"));
const AprovacaoDescontosManager = React.lazy(() => import("../components/comercial/AprovacaoDescontosManager"));
const DashboardFinanceiroUnificado = React.lazy(() => import("../components/financeiro/DashboardFinanceiroUnificado"));
const DashboardFinanceiroRealtime = React.lazy(() => import("../components/financeiro/DashboardFinanceiroRealtime"));
const DashboardFinanceiroMestre = React.lazy(() => import("../components/sistema/DashboardFinanceiroMestre"));
const CaixaPDVCompleto = React.lazy(() => import("../components/financeiro/CaixaPDVCompleto"));
const GestaoRemessaRetorno = React.lazy(() => import("../components/financeiro/GestaoRemessaRetorno"));
const VendasMulticanal = React.lazy(() => import("../components/financeiro/VendasMulticanal"));
const CaixaDiarioTab = React.lazy(() => import("../components/financeiro/CaixaDiarioTab"));
const VisaoConsolidadaGrupo = React.lazy(() => import("../components/financeiro/VisaoConsolidadaGrupo"));
const AlertasFinanceirosEmpresa = React.lazy(() => import("../components/financeiro/AlertasFinanceirosEmpresa"));

export default function Financeiro() {
  const [activeTab, setActiveTab] = useState("contas-receber");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let initial = params.get('tab');
    if (!initial) { try { initial = localStorage.getItem('Financeiro_tab'); } catch {} }
    if (initial) setActiveTab(initial);
  }, []);
  const handleTabChange = (value) => {
    setActiveTab(value);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    window.history.replaceState({}, '', url.toString());
    try { localStorage.setItem('Financeiro_tab', value); } catch {}
  };
  const { hasPermission, isLoading: loadingPermissions } = usePermissions();
  const { openWindow } = useWindow();
  const [conciliacaoDialogOpen, setConciliacaoDialogOpen] = useState(false);
  const [relatorioPeriodo, setRelatorioPeriodo] = useState({
    dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0]
  });
  const [relatorioTipo, setRelatorioTipo] = useState("geral");

  const { toast } = useToast();

  const {
    contexto,
    estaNoGrupo,
    empresaAtual,
    empresasDoGrupo,
    filtrarPorContexto,
    adicionarColunasContexto
  } = useContextoVisual();

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contasReceber'],
    queryFn: () => base44.entities.ContaReceber.list('-data_vencimento'),
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contasPagar'],
    queryFn: () => base44.entities.ContaPagar.list('-data_vencimento'),
  });

  const { data: centrosCusto = [] } = useQuery({
    queryKey: ['centrosCusto'],
    queryFn: () => base44.entities.CentroCusto.list(),
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  const { data: rateios = [] } = useQuery({
    queryKey: ['rateios'],
    queryFn: () => base44.entities.RateioFinanceiro.list('-created_date'),
  });

  const { data: extratosBancarios = [] } = useQuery({
    queryKey: ['extratos'],
    queryFn: () => base44.entities.ExtratoBancario.list('-data_movimento', 100),
  });

  const { data: configsGateway = [] } = useQuery({
    queryKey: ['configs-gateway'],
    queryFn: () => base44.entities.ConfiguracaoGatewayPagamento.list(),
  });

  const { data: ordensLiquidacao = [] } = useQuery({
    queryKey: ['caixa-ordens-liquidacao'],
    queryFn: () => base44.entities.CaixaOrdemLiquidacao.list(),
  });

  const { data: pagamentosOmnichannel = [] } = useQuery({
    queryKey: ['pagamentos-omnichannel'],
    queryFn: () => base44.entities.PagamentoOmnichannel.list(),
  });

  const { data: pedidosPendentesAprovacao = [] } = useQuery({
    queryKey: ['pedidos-pendentes-aprovacao'],
    queryFn: async () => {
      const pedidos = await base44.entities.Pedido.list();
      return pedidos.filter(p => p.status_aprovacao === "pendente");
    },
  });

  const contasReceberFiltradas = filtrarPorContexto(contasReceber, 'empresa_id');
  const contasPagarFiltradas = filtrarPorContexto(contasPagar, 'empresa_id');

  const contasReceberComContexto = adicionarColunasContexto(contasReceberFiltradas);
  const contasPagarComContexto = adicionarColunasContexto(contasPagarFiltradas);

  const receberPendente = contasReceberFiltradas
    .filter(c => c.status === 'Pendente')
    .reduce((sum, c) => sum + (c.valor || 0), 0);

  const pagarPendente = contasPagarFiltradas
    .filter(c => c.status === 'Pendente')
    .reduce((sum, c) => sum + (c.valor || 0), 0);

  const saldo = receberPendente - pagarPendente;

  const hoje = new Date();
  const contasReceberVencidas = contasReceberFiltradas.filter(c =>
    c.status === 'Pendente' && new Date(c.data_vencimento) < hoje
  ).length;

  const contasPagarVencidas = contasPagarFiltradas.filter(c =>
    c.status === 'Pendente' && new Date(c.data_vencimento) < hoje
  ).length;

  const titulosComBoleto = contasReceberFiltradas.filter(c => c.boleto_id_integracao).length;
  const titulosComPix = contasReceberFiltradas.filter(c => c.pix_id_integracao).length;
  const empresasComGateway = configsGateway.filter(c => c.ativo).length;

  const extratosNaoConciliados = extratosBancarios.filter(e => !e.conciliado).length;
  const valorNaoConciliado = extratosBancarios
    .filter(e => !e.conciliado)
    .reduce((sum, e) => sum + Math.abs(e.valor || 0), 0);

  const ordensLiquidacaoPendentes = ordensLiquidacao.filter(o => o.status_ordem === "Pendente").length;
  const pagamentosOmnichannelPendentes = pagamentosOmnichannel.filter(p => p.status_conferencia === "Pendente").length;
  const totalPendentesAprovacao = pedidosPendentesAprovacao.length;

  if (loadingPermissions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-screen w-full p-6 lg:p-8 space-y-6 overflow-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Financeiro Multi-Empresa</h1>
          <p className="text-slate-600">
            {estaNoGrupo
              ? 'Visão consolidada • Caixa Central • Conciliação • Omnichannel'
              : `Gestão financeira completa - ${empresaAtual?.nome_fantasia || empresaAtual?.razao_social || ''}`
            }
          </p>
        </div>
        <div className="flex gap-2">
          {estaNoGrupo && (
            <Badge className="bg-blue-100 text-blue-700 px-4 py-2">
              <Building2 className="w-4 h-4 mr-2" />
              Visão Consolidada
            </Badge>
          )}

        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">A Receber</CardTitle>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {receberPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            {contasReceberVencidas > 0 && (
              <p className="text-xs text-red-600 mt-1">{contasReceberVencidas} vencidas</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">A Pagar</CardTitle>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {pagarPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            {contasPagarVencidas > 0 && (
              <p className="text-xs text-red-600 mt-1">{contasPagarVencidas} vencidas</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Saldo Previsto</CardTitle>
            <DollarSign className={`w-5 h-5 ${saldo >= 0 ? 'text-emerald-600' : 'text-orange-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldo >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
              R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Alertas</CardTitle>
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {contasReceberVencidas + contasPagarVencidas}
            </div>
            <p className="text-xs text-slate-500 mt-1">Contas vencidas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-0 shadow-md bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Integração Boleto/PIX</p>
                <p className="text-2xl font-bold text-blue-900">
                  {titulosComBoleto + titulosComPix}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {empresasComGateway} empresa(s) configurada(s)
                </p>
              </div>
              <Link2 className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Rateios Criados</p>
                <p className="text-2xl font-bold text-purple-900">{rateios.length}</p>
                <p className="text-xs text-purple-600 mt-1">Total distribuído</p>
              </div>
              <Split className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700">Conciliação Pendente</p>
                <p className="text-2xl font-bold text-orange-900">{extratosNaoConciliados}</p>
                <p className="text-xs text-orange-600 mt-1">
                  R$ {valorNaoConciliado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Caixa - Liquidações</p>
                <p className="text-2xl font-bold text-green-900">{ordensLiquidacaoPendentes}</p>
                <p className="text-xs text-green-600 mt-1">Ordens pendentes</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Aprovações</p>
                <p className="text-2xl font-bold text-red-900">{totalPendentesAprovacao}</p>
                <p className="text-xs text-red-600 mt-1">Descontos pendentes</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>



      {/* NOVO: Régua de Cobrança IA */}
      <ReguaCobrancaIA empresaId={empresaAtual?.id} />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="bg-white border shadow-sm flex-wrap h-auto">
          <TabsTrigger value="dashboard-mestre" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            🏆 Dashboard Mestre
          </TabsTrigger>

          <TabsTrigger value="formas-pagamento" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Sparkles className="w-4 h-4 mr-2" />
            🏦 Formas de Pagamento
          </TabsTrigger>
          <TabsTrigger value="caixa-pdv" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <Wallet className="w-4 h-4 mr-2" />
            💰 Caixa PDV Completo
            {ordensLiquidacaoPendentes > 0 && (
              <Badge className="ml-2 bg-orange-500 text-white">{ordensLiquidacaoPendentes}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="caixa-diario" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            💵 Caixa Diário • 💳 Cartões
          </TabsTrigger>
          <TabsTrigger value="vendas-multicanal" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Globe className="w-4 h-4 mr-2" />
            🌐 Vendas Multicanal
          </TabsTrigger>
          <TabsTrigger value="remessa-retorno" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" />
            Remessa/Retorno CNAB
          </TabsTrigger>
          <TabsTrigger value="contas-receber" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <TrendingUp className="w-4 h-4 mr-2" />
            Contas a Receber
          </TabsTrigger>
          <TabsTrigger value="contas-pagar" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <TrendingDown className="w-4 h-4 mr-2" />
            Contas a Pagar
          </TabsTrigger>
          <TabsTrigger value="aprovacoes" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            <AlertCircle className="w-4 h-4 mr-2" />
            Aprovações
            {totalPendentesAprovacao > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">{totalPendentesAprovacao}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="conciliacao" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" />
            Conciliação
            {pagamentosOmnichannelPendentes > 0 && (
              <Badge className="ml-2 bg-yellow-500 text-white">{pagamentosOmnichannelPendentes}</Badge>
            )}
          </TabsTrigger>
          {estaNoGrupo && (
            <TabsTrigger value="rateios" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Split className="w-4 h-4 mr-2" />
              Rateios
            </TabsTrigger>
          )}
          <TabsTrigger value="relatorios" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="alertas" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            <AlertCircle className="w-4 h-4 mr-2" />
            Alertas por Empresa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard-mestre" className="mt-6">
          <DashboardFinanceiroMestre windowMode={false} />
        </TabsContent>



        <TabsContent value="formas-pagamento" className="mt-6">
          <DashboardFormasPagamento windowMode={false} />
        </TabsContent>



        <TabsContent value="caixa-pdv" className="mt-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-50">
            <CardHeader className="border-b bg-white/50 backdrop-blur-sm">
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">💰 Caixa PDV Completo</p>
                  <p className="text-sm text-slate-600 font-normal">
                    Vendas • Liquidação Receber/Pagar • Emissão NF-e/Boleto • Multi-Operador
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="p-6 border-2 border-emerald-200 rounded-lg bg-white">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-3" />
                  <p className="font-semibold text-slate-900 mb-2">✅ Vendas PDV com Múltiplos Pagamentos</p>
                  <p className="text-sm text-slate-600">
                    Aceita múltiplas formas de pagamento na mesma venda, acréscimos/descontos em valor ou %
                  </p>
                </div>
                <div className="p-6 border-2 border-blue-200 rounded-lg bg-white">
                  <FileText className="w-10 h-10 text-blue-600 mb-3" />
                  <p className="font-semibold text-slate-900 mb-2">📄 Receber Vendas de Outros Vendedores</p>
                  <p className="text-sm text-slate-600">
                    Liquidação de pedidos cadastrados por outros vendedores com emissão de NF-e/Recibo
                  </p>
                </div>
                <div className="p-6 border-2 border-green-200 rounded-lg bg-white">
                  <TrendingUp className="w-10 h-10 text-green-600 mb-3" />
                  <p className="font-semibold text-slate-900 mb-2">💚 Liquidar Contas a Receber</p>
                  <p className="text-sm text-slate-600">
                    Recebimento rápido de títulos pendentes com registro automático de movimentos
                  </p>
                </div>
                <div className="p-6 border-2 border-red-200 rounded-lg bg-white">
                  <TrendingDown className="w-10 h-10 text-red-600 mb-3" />
                  <p className="font-semibold text-slate-900 mb-2">💰 Liquidar Contas a Pagar</p>
                  <p className="text-sm text-slate-600">
                    Pagamento de fornecedores e despesas direto do caixa com controle de saldo
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    openWindow(
                      CaixaPDVCompleto,
                      {
                        empresaAtual: empresaAtual,
                        windowMode: true
                      },
                      {
                        title: '💰 Caixa PDV Completo - ' + (empresaAtual?.nome_fantasia || 'Sistema'),
                        width: 1500,
                        height: 850,
                        uniqueKey: `caixa-pdv-${empresaAtual?.id}`
                      }
                    );
                  }}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg"
                  size="lg"
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  Abrir Caixa PDV Completo
                </Button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-semibold mb-2">
                  🎯 Substitui e Melhora:
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs text-blue-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Caixa Diário (movimentos diários)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Caixa Central Liquidação (unificado)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>PDV presencial (venda rápida)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Multi-operador com permissões</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="remessa-retorno" className="mt-6">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <p className="text-slate-600 mb-4">Abra a gestão de Remessa/Retorno em janela dedicada</p>
                <Button
                  onClick={() => {
                    openWindow(
                      GestaoRemessaRetorno,
                      { windowMode: true },
                      {
                        title: '🏦 Remessa e Retorno CNAB',
                        width: 1400,
                        height: 800,
                        uniqueKey: 'gestao-remessa-retorno'
                      }
                    );
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Abrir Gestão CNAB
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="caixa-diario" className="mt-6">
          <CaixaDiarioTab />
        </TabsContent>

        <TabsContent value="vendas-multicanal" className="mt-6">
          <VendasMulticanal />
        </TabsContent>

        <TabsContent value="contas-receber" className="mt-6">
          <ContasReceberTab contas={contasReceberComContexto} empresas={empresas} />
        </TabsContent>

        <TabsContent value="contas-pagar" className="mt-6">
          <ContasPagarTab contas={contasPagarComContexto} />
        </TabsContent>

        <TabsContent value="aprovacoes" className="mt-6">
          <AprovacaoDescontosManager windowMode={false} />
        </TabsContent>

        <TabsContent value="conciliacao" className="mt-6">
          <ConciliacaoBancaria windowMode={false} />
        </TabsContent>

        {estaNoGrupo && (
          <TabsContent value="rateios" className="mt-6">
            <div className="space-y-6">
              <RateioMultiempresa
                empresas={empresasDoGrupo}
                grupoId={empresasDoGrupo[0]?.grupo_id}
              />

              <Card className="border-0 shadow-md">
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle>Histórico de Rateios</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead>Descrição</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valor Total</TableHead>
                        <TableHead>Empresas</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rateios.map(rateio => (
                        <TableRow key={rateio.id}>
                          <TableCell className="font-medium">{rateio.descricao}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{rateio.tipo_documento}</Badge>
                          </TableCell>
                          <TableCell className="font-bold">
                            R$ {rateio.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {rateio.distribuicao?.map((d, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {d.empresa_nome?.substring(0, 10)} ({d.percentual}%)
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              rateio.status_consolidacao === 'completo' ? 'bg-green-100 text-green-700' :
                              rateio.status_consolidacao === 'parcial' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-slate-100 text-slate-700'
                            }>
                              {rateio.status_consolidacao}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(rateio.created_date).toLocaleDateString('pt-BR')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {rateios.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <Split className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p>Nenhum rateio criado ainda</p>
                      <p className="text-sm mt-2">Use o formulário acima para criar o primeiro rateio</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        <TabsContent value="relatorios" className="mt-6">
          <RelatorioFinanceiro empresaId={empresaAtual?.id} windowMode={false} />
        </TabsContent>

        <TabsContent value="alertas" className="mt-6">
          <AlertasFinanceirosEmpresa empresaId={empresaAtual?.id} groupId={empresasDoGrupo[0]?.group_id} windowMode={false} />
        </TabsContent>
      </Tabs>
    </div>
  );
}