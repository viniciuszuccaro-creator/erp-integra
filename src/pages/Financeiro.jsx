import React, { Suspense } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Wallet } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { useWindow } from "@/components/lib/useWindow";
import { useUser } from "@/components/lib/UserContext";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import ProtectedSection from "@/components/security/ProtectedSection";
import HeaderFinanceiroCompacto from "@/components/financeiro/HeaderFinanceiroCompacto";
import ModuleLayout from "@/components/layout/ModuleLayout";
import ModuleKPIs from "@/components/layout/ModuleKPIs";
import ModuleContent from "@/components/layout/ModuleContent";
import ModuleTabs from "@/components/layout/ModuleTabs";
import KPIsFinanceiroLaunchpad from "@/components/financeiro/KPIsFinanceiroLaunchpad";
import MetricasSecundariasLaunchpad from "@/components/financeiro/MetricasSecundariasLaunchpad";

import ModulosGridFinanceiro from "@/components/financeiro/ModulosGridFinanceiro";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import useFinanceiroDerivedData from "@/components/financeiro/hooks/useFinanceiroDerivedData";

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
  const canSeeFinanceiro = hasPermission('Financeiro', null, 'ver');
  const { openWindow } = useWindow();
  const { user } = useUser();

  const {
    contexto,
    estaNoGrupo,
    empresaAtual,
    empresasDoGrupo,
    filtrarPorContexto,
    adicionarColunasContexto,
    getFiltroContexto
  } = useContextoVisual();

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contasReceber', empresaAtual?.id],
    queryFn: async () => {
      try {
        return await filtrarPorContexto('ContaReceber', {}, 'data_vencimento', 100);
      } catch (err) {
        console.error('Erro ao buscar contas a receber:', err);
        return [];
      }
    },
    staleTime: 30000,
    retry: 2,
    enabled: canSeeFinanceiro
  });

  const { data: totalContasReceber = 0 } = useQuery({
    queryKey: ['contas-receber-count', empresaAtual?.id],
    queryFn: async () => {
      try {
        const response = await base44.functions.invoke('countEntities', {
          entityName: 'ContaReceber',
          filter: getFiltroContexto('empresa_id')
        });
        return response.data?.count || contasReceber.length;
      } catch {
        return contasReceber.length;
      }
    },
    staleTime: 60000,
    retry: 1,
    enabled: canSeeFinanceiro
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contasPagar', empresaAtual?.id],
    queryFn: async () => {
      try {
        return await filtrarPorContexto('ContaPagar', {}, 'data_vencimento', 100);
      } catch (err) {
        console.error('Erro ao buscar contas a pagar:', err);
        return [];
      }
    },
    staleTime: 30000,
    retry: 2,
    enabled: canSeeFinanceiro
  });

  const { data: totalContasPagar = 0 } = useQuery({
    queryKey: ['contas-pagar-count', empresaAtual?.id],
    queryFn: async () => {
      try {
        const response = await base44.functions.invoke('countEntities', {
          entityName: 'ContaPagar',
          filter: getFiltroContexto('empresa_id')
        });
        return response.data?.count || contasPagar.length;
      } catch {
        return contasPagar.length;
      }
    },
    staleTime: 60000,
    retry: 1,
    enabled: canSeeFinanceiro
  });

  const { data: rateios = [] } = useQuery({
    queryKey: ['rateios', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        return await filtrarPorContexto('RateioFinanceiro', {}, '-created_date', 50);
      } catch (err) {
        console.error('Erro ao buscar rateios:', err);
        return [];
      }
    },
    staleTime: 30000,
    retry: 1,
    enabled: canSeeFinanceiro
  });

  const { data: extratosBancarios = [] } = useQuery({
    queryKey: ['extratos', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        return await filtrarPorContexto('ExtratoBancario', {}, '-data_movimento', 100);
      } catch (err) {
        console.error('Erro ao buscar extratos:', err);
        return [];
      }
    },
    staleTime: 30000,
    retry: 1,
    enabled: canSeeFinanceiro
  });

  const { data: configsGateway = [] } = useQuery({
    queryKey: ['configs-gateway', empresaAtual?.id],
    queryFn: async () => {
      try {
        return await filtrarPorContexto('ConfiguracaoGatewayPagamento', {}, '-created_date', 9999);
      } catch (err) {
        console.error('Erro ao buscar configs gateway:', err);
        return [];
      }
    },
    staleTime: 60000,
    retry: 1,
    enabled: canSeeFinanceiro
  });

  const { data: ordensLiquidacao = [] } = useQuery({
    queryKey: ['caixa-ordens-liquidacao', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        return await filtrarPorContexto('CaixaOrdemLiquidacao', {}, '-created_date', 50);
      } catch (err) {
        console.error('Erro ao buscar ordens de liquidação:', err);
        return [];
      }
    },
    staleTime: 30000,
    retry: 1,
    enabled: canSeeFinanceiro
  });

  const { data: pedidosPendentesAprovacao = [] } = useQuery({
    queryKey: ['pedidos-pendentes-aprovacao', empresaAtual?.id],
    queryFn: async () => {
      try {
        return await filtrarPorContexto('Pedido', { status_aprovacao: 'pendente' }, '-created_date', 50);
      } catch (err) {
        console.error('Erro ao buscar pedidos pendentes:', err);
        return [];
      }
    },
    staleTime: 30000,
    retry: 1,
    enabled: canSeeFinanceiro
  });

  // Dados já vêm filtrados do servidor
  const contasReceberFiltradas = contasReceber;
  const contasPagarFiltradas = contasPagar;

  const contasReceberComContexto = adicionarColunasContexto(contasReceberFiltradas);
  const contasPagarComContexto = adicionarColunasContexto(contasPagarFiltradas);

  const {
    receberPendente,
    pagarPendente,
    saldo,
    contasReceberVencidas,
    contasPagarVencidas,
    titulosComBoleto,
    titulosComPix,
    empresasComGateway,
    extratosNaoConciliados,
    valorNaoConciliado,
    ordensLiquidacaoPendentes,
    totalPendentesAprovacao,
  } = useFinanceiroDerivedData({
    contasReceber: contasReceberFiltradas,
    contasPagar: contasPagarFiltradas,
    extratosBancarios,
    configsGateway,
    ordensLiquidacao,
    pedidosPendentesAprovacao,
  });

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

  const allowedAllModules = allModules.filter(m => hasPermission('Financeiro', (m.sectionKey || m.title), 'ver'));

   const handleModuleClick = (module) => {
    React.startTransition(() => {
      // Auditoria de abertura de seção
      base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário',
        acao: 'Visualização',
        modulo: 'Financeiro',
        tipo_auditoria: 'acesso',
        entidade: 'Seção',
        descricao: `Abrir seção: ${module.title}`,
        data_hora: new Date().toISOString(),
      });
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
    <ProtectedSection module="Financeiro" action="visualizar">
    <ErrorBoundary>
      <ModuleLayout title="Financeiro e Contábil" subtitle="Pagamentos, recebimentos e conciliação">
        <ModuleKPIs>
          <KPIsFinanceiroLaunchpad
            receberPendente={receberPendente}
            pagarPendente={pagarPendente}
            saldo={saldo}
            contasReceberVencidas={contasReceberVencidas}
            contasPagarVencidas={contasPagarVencidas}
          />
        </ModuleKPIs>
        <ModuleContent>
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
          <ModuleTabs
            listagem={<ModulosGridFinanceiro modules={allowedAllModules} onModuleClick={handleModuleClick} />}
          />
        </ModuleContent>
      </ModuleLayout>
    </ErrorBoundary>
    </ProtectedSection>
  );
}