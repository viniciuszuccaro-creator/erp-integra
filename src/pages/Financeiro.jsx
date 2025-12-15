import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import DashboardFormasPagamento from "../components/financeiro/DashboardFormasPagamento";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  FileText,
  BarChart3,
  Building2,
  Split,
  CheckCircle2,
  Link2,
  Sparkles,
  Wallet,
  Globe,
  ArrowLeftRight,
  RefreshCw,
  Receipt
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import ContasReceberTab from "../components/financeiro/ContasReceberTab";
import ContasPagarTab from "../components/financeiro/ContasPagarTab";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import PainelConciliacao from "../components/financeiro/PainelConciliacao";
import RelatorioFinanceiro from "../components/financeiro/RelatorioFinanceiro";
import RateioMultiempresa from "../components/financeiro/RateioMultiempresa";
import ReguaCobrancaIA from "../components/financeiro/ReguaCobrancaIA";
import usePermissions from "@/components/lib/usePermissions";
import { useWindow } from "@/components/lib/useWindow";
import AprovacaoDescontosManager from "../components/comercial/AprovacaoDescontosManager";
import DashboardFinanceiroUnificado from "../components/financeiro/DashboardFinanceiroUnificado";
import DashboardFinanceiroRealtime from "../components/financeiro/DashboardFinanceiroRealtime";
import CaixaPDVCompleto from "../components/financeiro/CaixaPDVCompleto";
import GestaoRemessaRetorno from "../components/financeiro/GestaoRemessaRetorno";
import VendasMulticanal from "../components/financeiro/VendasMulticanal";
import CaixaDiarioTab from "../components/financeiro/CaixaDiarioTab";
import ConciliacaoBancariaAvancada from "../components/financeiro/ConciliacaoBancariaAvancada";
import GatewayPagamentoForm from "../components/cadastros/GatewayPagamentoForm";
import ConfiguracaoDespesaRecorrenteForm from "../components/cadastros/ConfiguracaoDespesaRecorrenteForm";

/**
 * 💰 FINANCEIRO V22 - MULTICANAL COMPLETO
 * 
 * ✅ NOVAS FUNCIONALIDADES V22:
 * - Contas Receber/Pagar com filtros multicanal e marketplace
 * - Baixa múltipla com juros/multas/descontos
 * - Despesas recorrentes automatizadas
 * - Duplicação de mês anterior
 * - Gateway de Pagamento centralizado
 * - Conciliação Bancária com IA
 * - Importação de extratos
 * - Integração CaixaMovimento em todas as baixas
 * 
 * ✅ INTEGRAÇÕES:
 * - CaixaOrdemLiquidacao (envio para caixa)
 * - CaixaMovimento (rastreamento completo)
 * - HistoricoCliente (timeline)
 * - FormaPagamento > GatewayPagamento > Banco
 */
export default function Financeiro() {
  const [activeTab, setActiveTab] = useState("contas-receber");
  const { hasPermission, isLoading: loadingPermissions } = usePermissions();
  const { openWindow } = useWindow();
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

  const { data: gatewaysPagamento = [] } = useQuery({
    queryKey: ['gateways-pagamento'],
    queryFn: () => base44.entities.GatewayPagamento.list(),
  });

  const { data: despesasRecorrentes = [] } = useQuery({
    queryKey: ['despesas-recorrentes'],
    queryFn: () => base44.entities.ConfiguracaoDespesaRecorrente.list(),
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

  const extratosNaoConciliados = extratosBancarios.filter(e => e.status_conciliacao === "Pendente").length;
  const valorNaoConciliado = extratosBancarios
    .filter(e => e.status_conciliacao === "Pendente")
    .reduce((sum, e) => sum + Math.abs(e.valor || 0), 0);

  const ordensLiquidacaoPendentes = ordensLiquidacao.filter(o => o.status === "Pendente").length;
  const pagamentosOmnichannelPendentes = pagamentosOmnichannel.filter(p => p.status_conferencia === "Pendente").length;
  const totalPendentesAprovacao = pedidosPendentesAprovacao.length;
  const gatewaysAtivos = gatewaysPagamento.filter(g => g.status_integracao === "Ativo").length;
  const despesasRecorrentesAtivas = despesasRecorrentes.filter(d => d.ativa).length;

  if (loadingPermissions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 w-full h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">💰 Financeiro Multi-Empresa V22</h1>
          <p className="text-slate-600">
            {estaNoGrupo
              ? 'Visão consolidada • Despesas Recorrentes • Gateways • Conciliação IA'
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

      {/* KPIs Principais */}
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

      {/* V22: KPIs Expandidos */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-0 shadow-md bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Gateways Ativos</p>
                <p className="text-2xl font-bold text-blue-900">{gatewaysAtivos}</p>
                <p className="text-xs text-blue-600 mt-1">Pagamento online</p>
              </div>
              <Sparkles className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Rateios Criados</p>
                <p className="text-2xl font-bold text-purple-900">{rateios.length}</p>
                <p className="text-xs text-purple-600 mt-1">Multi-empresa</p>
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
              <ArrowLeftRight className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Despesas Recorrentes</p>
                <p className="text-2xl font-bold text-green-900">{despesasRecorrentesAtivas}</p>
                <p className="text-xs text-green-600 mt-1">Automatizadas</p>
              </div>
              <RefreshCw className="w-8 h-8 text-green-400" />
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

      {/* DASHBOARD UNIFICADO */}
      <DashboardFinanceiroUnificado empresaId={empresaAtual?.id} />

      {/* RÉGUA DE COBRANÇA IA */}
      <ReguaCobrancaIA empresaId={empresaAtual?.id} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border shadow-sm flex-wrap h-auto">
          <TabsTrigger value="dashboard-realtime" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard Realtime
          </TabsTrigger>
          <TabsTrigger value="formas-pagamento" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Sparkles className="w-4 h-4 mr-2" />
            🏦 Formas de Pagamento
          </TabsTrigger>
          <TabsTrigger value="gateways-pagamento" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Wallet className="w-4 h-4 mr-2" />
            🔌 Gateways Pagamento
          </TabsTrigger>
          <TabsTrigger value="despesas-recorrentes" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
            <RefreshCw className="w-4 h-4 mr-2" />
            ♻️ Despesas Recorrentes
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
          <TabsTrigger value="conciliacao-bancaria" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            Conciliação Bancária
            {extratosNaoConciliados > 0 && (
              <Badge className="ml-2 bg-yellow-500 text-white">{extratosNaoConciliados}</Badge>
            )}
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
            Conciliação Cartões
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
        </TabsList>

        <TabsContent value="dashboard-realtime">
          <DashboardFinanceiroRealtime empresaId={empresaAtual?.id} />
        </TabsContent>

        <TabsContent value="formas-pagamento">
          <DashboardFormasPagamento />
        </TabsContent>

        {/* V22: Nova Aba Gateways de Pagamento */}
        <TabsContent value="gateways-pagamento">
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">🔌 Gateways de Pagamento</p>
                    <p className="text-sm text-slate-600 font-normal">
                      Configure processadores externos (Pagar.me, Stripe, Asaas, etc)
                    </p>
                  </div>
                </CardTitle>
                <Button
                  onClick={() => openWindow(GatewayPagamentoForm, {
                    windowMode: true,
                    onSubmit: async (data) => {
                      try {
                        await base44.entities.GatewayPagamento.create({ ...data, empresa_id: empresaAtual?.id });
                        queryClient.invalidateQueries({ queryKey: ['gateways-pagamento'] });
                        toast({ title: "✅ Gateway criado!" });
                      } catch (error) {
                        toast({ title: "❌ Erro", description: error.message, variant: "destructive" });
                      }
                    }
                  }, {
                    title: '🔌 Novo Gateway de Pagamento',
                    width: 1000,
                    height: 700
                  })}
                  className="bg-purple-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Gateway
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {gatewaysPagamento.map(gateway => (
                  <Card key={gateway.id} className="border-2 hover:shadow-lg transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{gateway.nome}</p>
                        <Badge className={gateway.status_integracao === "Ativo" ? 'bg-green-600' : 'bg-gray-600'}>
                          {gateway.status_integracao}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{gateway.provedor}</Badge>
                          <Badge variant="outline">{gateway.ambiente}</Badge>
                        </div>
                        <p className="text-xs text-slate-600">
                          Suporta: {gateway.tipos_pagamento_suportados?.join(', ')}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openWindow(GatewayPagamentoForm, {
                              gateway,
                              windowMode: true,
                              onSubmit: async (data) => {
                                try {
                                  await base44.entities.GatewayPagamento.update(gateway.id, data);
                                  queryClient.invalidateQueries({ queryKey: ['gateways-pagamento'] });
                                  toast({ title: "✅ Gateway atualizado!" });
                                } catch (error) {
                                  toast({ title: "❌ Erro", description: error.message, variant: "destructive" });
                                }
                              }
                            }, {
                              title: `✏️ Editar: ${gateway.nome}`,
                              width: 1000,
                              height: 700
                            })}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {gatewaysPagamento.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Wallet className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Nenhum gateway configurado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* V22: Nova Aba Despesas Recorrentes */}
        <TabsContent value="despesas-recorrentes">
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-green-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-green-600 rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">♻️ Despesas Recorrentes</p>
                    <p className="text-sm text-slate-600 font-normal">
                      Geração automática de Contas a Pagar mensais
                    </p>
                  </div>
                </CardTitle>
                <Button
                  onClick={() => openWindow(ConfiguracaoDespesaRecorrenteForm, {
                    windowMode: true,
                    onSubmit: async (data) => {
                      try {
                        await base44.entities.ConfiguracaoDespesaRecorrente.create({ ...data, empresa_id: empresaAtual?.id });
                        queryClient.invalidateQueries({ queryKey: ['despesas-recorrentes'] });
                        toast({ title: "✅ Despesa recorrente criada!" });
                      } catch (error) {
                        toast({ title: "❌ Erro", description: error.message, variant: "destructive" });
                      }
                    }
                  }, {
                    title: '♻️ Nova Despesa Recorrente',
                    width: 900,
                    height: 700
                  })}
                  className="bg-teal-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Despesa Recorrente
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="p-6 border-2 border-teal-200 rounded-lg bg-white">
                  <RefreshCw className="w-10 h-10 text-teal-600 mb-3" />
                  <p className="font-semibold text-slate-900 mb-2">Automação Total</p>
                  <p className="text-sm text-slate-600">
                    Gera Contas a Pagar automaticamente nos vencimentos configurados
                  </p>
                </div>
                <div className="p-6 border-2 border-blue-200 rounded-lg bg-white">
                  <Receipt className="w-10 h-10 text-blue-600 mb-3" />
                  <p className="font-semibold text-slate-900 mb-2">Flexibilidade Total</p>
                  <p className="text-sm text-slate-600">
                    Aluguel, Energia, Tarifas, Impostos, Software, etc
                  </p>
                </div>
                <div className="p-6 border-2 border-green-200 rounded-lg bg-white">
                  <CheckCircle2 className="w-10 h-10 text-green-600 mb-3" />
                  <p className="font-semibold text-slate-900 mb-2">Controle Inteligente</p>
                  <p className="text-sm text-slate-600">
                    Valores fixos ou variáveis, aprovações, notificações
                  </p>
                </div>
              </div>

              <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-semibold mb-2">
                  ✨ {despesasRecorrentesAtivas} despesas recorrentes ativas gerando contas automaticamente
                </p>
                <p className="text-xs text-blue-700">
                  Economize tempo configurando uma vez e deixe o sistema gerar as contas para você
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="caixa-pdv">
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
                    Aceita múltiplas formas de pagamento na mesma venda
                  </p>
                </div>
                <div className="p-6 border-2 border-blue-200 rounded-lg bg-white">
                  <FileText className="w-10 h-10 text-blue-600 mb-3" />
                  <p className="font-semibold text-slate-900 mb-2">📄 Liquidação de Pedidos</p>
                  <p className="text-sm text-slate-600">
                    Receba vendas de outros vendedores com NF-e/Recibo
                  </p>
                </div>
                <div className="p-6 border-2 border-green-200 rounded-lg bg-white">
                  <TrendingUp className="w-10 h-10 text-green-600 mb-3" />
                  <p className="font-semibold text-slate-900 mb-2">💚 Liquidar Contas a Receber</p>
                  <p className="text-sm text-slate-600">
                    Recebimento rápido de títulos com registro automático
                  </p>
                </div>
                <div className="p-6 border-2 border-red-200 rounded-lg bg-white">
                  <TrendingDown className="w-10 h-10 text-red-600 mb-3" />
                  <p className="font-semibold text-slate-900 mb-2">💰 Liquidar Contas a Pagar</p>
                  <p className="text-sm text-slate-600">
                    Pagar fornecedores direto do caixa
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    openWindow(
                      CaixaPDVCompleto,
                      { empresaAtual: empresaAtual, windowMode: true },
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="remessa-retorno">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <p className="text-slate-600 mb-4">Gestão de Remessa/Retorno CNAB</p>
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

        <TabsContent value="caixa-diario">
          <CaixaDiarioTab />
        </TabsContent>

        <TabsContent value="vendas-multicanal">
          <VendasMulticanal />
        </TabsContent>

        <TabsContent value="contas-receber">
          <ContasReceberTab contas={contasReceberComContexto} empresas={empresas} />
        </TabsContent>

        <TabsContent value="contas-pagar">
          <ContasPagarTab contas={contasPagarComContexto} empresaId={empresaAtual?.id} />
        </TabsContent>

        {/* V22: Nova Aba Conciliação Bancária Avançada */}
        <TabsContent value="conciliacao-bancaria">
          <ConciliacaoBancariaAvancada empresaId={empresaAtual?.id} />
        </TabsContent>

        <TabsContent value="aprovacoes">
          <AprovacaoDescontosManager windowMode={false} />
        </TabsContent>

        <TabsContent value="conciliacao">
          <PainelConciliacao windowMode={false} />
        </TabsContent>

        {estaNoGrupo && (
          <TabsContent value="rateios">
            <RateioMultiempresa empresas={empresasDoGrupo} grupoId={empresasDoGrupo[0]?.grupo_id} />
          </TabsContent>
        )}

        <TabsContent value="relatorios">
          <RelatorioFinanceiro empresaId={empresaAtual?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}