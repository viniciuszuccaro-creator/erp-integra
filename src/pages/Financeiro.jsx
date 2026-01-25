import React, { Suspense } from "react";
import { base44 } from "@/api/base44Client";
import useQueryWithRateLimit from "@/components/lib/useQueryWithRateLimit";
import { Wallet, Zap } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { useWindow } from "@/components/lib/useWindow";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import HeaderFinanceiroCompacto from "@/components/financeiro/HeaderFinanceiroCompacto";
import KPIsFinanceiroLaunchpad from "@/components/financeiro/KPIsFinanceiroLaunchpad";
import MetricasSecundariasLaunchpad from "@/components/financeiro/MetricasSecundariasLaunchpad";
import InsightsFinanceirosCompacto from "@/components/financeiro/InsightsFinanceirosCompacto";
import ModulosGridFinanceiro from "@/components/financeiro/ModulosGridFinanceiro";

const CaixaCentralLiquidacao = React.lazy(() => import("../components/financeiro/CaixaCentralLiquidacao"));
const ContasReceberTab = React.lazy(() => import("../components/financeiro/ContasReceberTab"));
const ContasPagarTab = React.lazy(() => import("../components/financeiro/ContasPagarTab"));
const ConciliacaoBancaria = React.lazy(() => import("../components/financeiro/ConciliacaoBancaria"));
const AprovacaoDescontosManager = React.lazy(() => import("../components/comercial/AprovacaoDescontosManager"));
const CaixaPDVCompleto = React.lazy(() => import("../components/financeiro/CaixaPDVCompleto"));
const GestaoRemessaRetorno = React.lazy(() => import("../components/financeiro/GestaoRemessaRetorno"));
const VendasMulticanal = React.lazy(() => import("../components/financeiro/VendasMulticanal"));
const RateioMultiempresa = React.lazy(() => import("../components/financeiro/RateioMultiempresa"));
const AlertasFinanceirosEmpresa = React.lazy(() => import("../components/financeiro/AlertasFinanceirosEmpresa"));
const RelatorioFinanceiro = React.lazy(() => import("../components/financeiro/RelatorioFinanceiro"));
const DashboardFormasPagamento = React.lazy(() => import("../components/financeiro/DashboardFormasPagamento"));

export default function Financeiro() {
  const { hasPermission, isLoading: loadingPermissions } = usePermissions();
  const { openWindow } = useWindow();

  const {
    contexto,
    estaNoGrupo,
    empresaAtual,
    empresasDoGrupo,
    filtrarPorContexto,
    adicionarColunasContexto
  } = useContextoVisual();

  const { data: contasReceber = [] } = useQueryWithRateLimit(
    ['contasReceber', empresaAtual?.id],
    async () => {
      const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
      return await base44.entities.ContaReceber.filter(filtro, '-data_vencimento', 100);
    },
    { initialData: [] }
  );

  const { data: totalContasReceber = 0 } = useQueryWithRateLimit(
    ['contas-receber-count', empresaAtual?.id],
    async () => {
      const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
      const response = await base44.functions.invoke('countEntities', {
        entityName: 'ContaReceber',
        filter: filtro
      });
      return response.data?.count || contasReceber.length;
    },
    { initialData: 0 }
  );

  const { data: contasPagar = [] } = useQueryWithRateLimit(
    ['contasPagar', empresaAtual?.id],
    async () => {
      const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
      return await base44.entities.ContaPagar.filter(filtro, '-data_vencimento', 100);
    },
    { initialData: [] }
  );

  const { data: totalContasPagar = 0 } = useQueryWithRateLimit(
    ['contas-pagar-count', empresaAtual?.id],
    async () => {
      const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
      const response = await base44.functions.invoke('countEntities', {
        entityName: 'ContaPagar',
        filter: filtro
      });
      return response.data?.count || contasPagar.length;
    },
    { initialData: 0 }
  );

  const { data: rateios = [] } = useQueryWithRateLimit(
    ['rateios', empresaAtual?.id],
    async () => {
      const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
      return await base44.entities.RateioFinanceiro.filter(filtro, '-created_date', 50);
    },
    { initialData: [] }
  );

  const { data: extratosBancarios = [] } = useQueryWithRateLimit(
    ['extratos', empresaAtual?.id],
    async () => {
      const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
      return await base44.entities.ExtratoBancario.filter(filtro, '-data_movimento', 100);
    },
    { initialData: [] }
  );

  const { data: configsGateway = [] } = useQueryWithRateLimit(
    ['configs-gateway', empresaAtual?.id],
    async () => await base44.entities.ConfiguracaoGatewayPagamento.list(),
    { initialData: [] }
  );

  const { data: ordensLiquidacao = [] } = useQueryWithRateLimit(
    ['caixa-ordens-liquidacao', empresaAtual?.id],
    async () => {
      const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
      return await base44.entities.CaixaOrdemLiquidacao.filter(filtro, '-created_date', 50);
    },
    { initialData: [] }
  );

  const { data: pedidosPendentesAprovacao = [] } = useQueryWithRateLimit(
    ['pedidos-pendentes-aprovacao', empresaAtual?.id],
    async () => {
      const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id, status_aprovacao: "pendente" } : { status_aprovacao: "pendente" };
      return await base44.entities.Pedido.filter(filtro, '-created_date', 50);
    },
    { initialData: [] }
  );

  // Dados já vêm filtrados do servidor
  const contasReceberFiltradas = contasReceber;
  const contasPagarFiltradas = contasPagar;

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
  const totalPendentesAprovacao = pedidosPendentesAprovacao.length;

  if (loadingPermissions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const modules = [
    {
      title: 'Caixa Central',
      description: 'Hub unificado de liquidações',
      icon: Wallet,
      color: 'green',
      component: CaixaCentralLiquidacao,
      windowTitle: '💰 Caixa Central V22.0',
      width: 1600,
      height: 900,
      badge: ordensLiquidacaoPendentes > 0 ? `${ordensLiquidacaoPendentes} pendentes` : null,
    },

    {
      title: 'Formas de Pagamento',
      description: 'Gestão centralizada de meios',
      icon: Wallet,
      color: 'indigo',
      component: DashboardFormasPagamento,
      windowTitle: '🏦 Formas de Pagamento',
      width: 1500,
      height: 850,
    },
    {
      title: 'Caixa PDV Completo',
      description: 'Vendas e liquidações multi-operador',
      icon: Wallet,
      color: 'emerald',
      component: CaixaPDVCompleto,
      windowTitle: '💵 Caixa PDV Completo',
      width: 1500,
      height: 850,
    },

    {
      title: 'Vendas Multicanal',
      description: 'E-commerce e marketplaces',
      icon: Wallet,
      color: 'blue',
      component: VendasMulticanal,
      windowTitle: '🌐 Vendas Multicanal',
      width: 1400,
      height: 800,
    },
    {
      title: 'Remessa/Retorno CNAB',
      description: 'Arquivos bancários automatizados',
      icon: Wallet,
      color: 'purple',
      component: GestaoRemessaRetorno,
      windowTitle: '🏦 Gestão CNAB',
      width: 1400,
      height: 800,
    },
    {
      title: 'Contas a Receber',
      description: 'Títulos e cobranças completas',
      icon: Wallet,
      color: 'green',
      component: ContasReceberTab,
      windowTitle: '📈 Contas a Receber',
      width: 1500,
      height: 850,
      props: { contas: contasReceberComContexto }
    },
    {
      title: 'Contas a Pagar',
      description: 'Fornecedores e obrigações',
      icon: Wallet,
      color: 'red',
      component: ContasPagarTab,
      windowTitle: '📉 Contas a Pagar',
      width: 1500,
      height: 850,
      props: { contas: contasPagarComContexto }
    },
    {
      title: 'Aprovações Descontos',
      description: 'Hierarquia de aprovações',
      icon: Wallet,
      color: 'orange',
      component: AprovacaoDescontosManager,
      windowTitle: '⚠️ Aprovações de Descontos',
      width: 1400,
      height: 800,
      badge: totalPendentesAprovacao > 0 ? `${totalPendentesAprovacao} pendentes` : null,
    },
    {
      title: 'Conciliação Bancária',
      description: 'Matching automático de extratos',
      icon: Wallet,
      color: 'cyan',
      component: ConciliacaoBancaria,
      windowTitle: '💳 Conciliação Bancária',
      width: 1500,
      height: 850,
    },
    {
      title: 'Relatórios Financeiros',
      description: 'DRE, fluxo e análises',
      icon: Wallet,
      color: 'indigo',
      component: RelatorioFinanceiro,
      windowTitle: '📊 Relatórios Financeiros',
      width: 1500,
      height: 850,
      props: { empresaId: empresaAtual?.id }
    },
    {
      title: 'Alertas por Empresa',
      description: 'Notificações e riscos',
      icon: Wallet,
      color: 'orange',
      component: AlertasFinanceirosEmpresa,
      windowTitle: '⚠️ Alertas Financeiros',
      width: 1400,
      height: 800,
      props: { empresaId: empresaAtual?.id, groupId: empresasDoGrupo[0]?.group_id }
    },
  ];

  const grupoModules = estaNoGrupo ? [
    {
      title: 'Rateio Multi-Empresa',
      description: 'Distribuição consolidada de custos',
      icon: Wallet,
      color: 'purple',
      component: RateioMultiempresa,
      windowTitle: '🔀 Rateio Multi-Empresa',
      width: 1400,
      height: 800,
      props: { empresas: empresasDoGrupo, grupoId: empresasDoGrupo[0]?.group_id }
    },
  ] : [];

  const allModules = [...modules, ...grupoModules];

  const handleModuleClick = (module) => {
    React.startTransition(() => {
      openWindow(
        module.component,
        { 
          ...(module.props || {}),
          empresaAtual,
          windowMode: true 
        },
        {
          title: module.windowTitle,
          width: module.width,
          height: module.height,
          uniqueKey: `financeiro-${module.title.toLowerCase().replace(/\s/g, '-').replace(/•/g, '')}`
        }
      );
    });
  };

  return (
    <ErrorBoundary>
      <div className="w-full min-h-screen p-1.5 space-y-1.5 overflow-auto bg-gradient-to-br from-slate-50 to-blue-50">
        <HeaderFinanceiroCompacto 
          estaNoGrupo={estaNoGrupo}
          empresaAtual={empresaAtual}
        />

        <KPIsFinanceiroLaunchpad
          receberPendente={receberPendente}
          pagarPendente={pagarPendente}
          saldo={saldo}
          contasReceberVencidas={contasReceberVencidas}
          contasPagarVencidas={contasPagarVencidas}
        />

        <MetricasSecundariasLaunchpad
          titulosComBoleto={titulosComBoleto}
          titulosComPix={titulosComPix}
          empresasComGateway={empresasComGateway}
          rateiosCount={rateios.length}
          extratosNaoConciliados={extratosNaoConciliados}
          valorNaoConciliado={valorNaoConciliado}
          ordensLiquidacaoPendentes={ordensLiquidacaoPendentes}
          totalPendentesAprovacao={totalPendentesAprovacao}
        />

        <InsightsFinanceirosCompacto 
          saldo={saldo}
          contasVencidas={contasReceberVencidas + contasPagarVencidas}
          scoreIA={85}
          automacaoAtiva={true}
        />

        <ModulosGridFinanceiro 
          modules={allModules}
          onModuleClick={handleModuleClick}
        />

        <div className="p-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg min-h-[28px] max-h-[28px]">
          <div className="flex items-center gap-1.5 text-xs text-blue-700">
            <Zap className="w-3 h-3 flex-shrink-0" />
            <span className="font-semibold">V22.0:</span>
            <span className="truncate">Janelas independentes • Compacto • Estável • 100%</span>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}