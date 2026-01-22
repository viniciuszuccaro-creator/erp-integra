import React, { Suspense } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Box, TrendingUp, PackageCheck, PackageMinus, PackageOpen, Clock, BarChart3, Sparkles, ArrowLeftRight } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { useWindow } from "@/components/lib/useWindow";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import { Button } from "@/components/ui/button";
import HeaderEstoqueCompacto from "@/components/estoque/estoque-launchpad/HeaderEstoqueCompacto";
import KPIsEstoque from "@/components/estoque/estoque-launchpad/KPIsEstoque";
import ModulosGridEstoque from "@/components/estoque/estoque-launchpad/ModulosGridEstoque";
import TransferenciaEntreEmpresasForm from "../components/estoque/TransferenciaEntreEmpresasForm";

const ProdutosTab = React.lazy(() => import("../components/estoque/ProdutosTab"));
const MovimentacoesTab = React.lazy(() => import("../components/estoque/MovimentacoesTab"));
const SolicitacoesTab = React.lazy(() => import("../components/estoque/SolicitacoesTab"));
const RecebimentoTab = React.lazy(() => import("../components/estoque/RecebimentoTab"));
const RequisicoesAlmoxarifadoTab = React.lazy(() => import("../components/estoque/RequisicoesAlmoxarifadoTab"));
const ControleLotesValidade = React.lazy(() => import("../components/estoque/ControleLotesValidade"));
const RelatoriosEstoque = React.lazy(() => import("../components/estoque/RelatoriosEstoque"));
const IAReposicao = React.lazy(() => import("../components/estoque/IAReposicao"));

export default function Estoque() {
  const { hasPermission, isLoading: loadingPermissions } = usePermissions();
  const { openWindow } = useWindow();
  const { estaNoGrupo, empresaAtual, empresasDoGrupo, filtrarPorContexto } = useContextoVisual();

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list('-created_date'),
    staleTime: 600000,
    gcTime: 900000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });

  const { data: movimentacoes = [] } = useQuery({
    queryKey: ['movimentacoes'],
    queryFn: () => base44.entities.MovimentacaoEstoque.list('-created_date'),
    staleTime: 600000,
    gcTime: 900000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });

  const { data: solicitacoes = [] } = useQuery({
    queryKey: ['solicitacoes'],
    queryFn: () => base44.entities.SolicitacaoCompra.list('-created_date'),
    staleTime: 600000,
    gcTime: 900000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });

  const { data: ordensCompra = [] } = useQuery({
    queryKey: ['ordensCompra'],
    queryFn: () => base44.entities.OrdemCompra.list('-created_date'),
    staleTime: 600000,
    gcTime: 900000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });

  const produtosFiltrados = filtrarPorContexto(produtos, 'empresa_id');
  const movimentacoesFiltradas = filtrarPorContexto(movimentacoes, 'empresa_id');

  const produtosAtivos = produtosFiltrados.filter(p => p.status === 'Ativo').length;
  const produtosBaixoEstoque = produtosFiltrados.filter(p => p.estoque_atual <= p.estoque_minimo && p.status === 'Ativo').length;
  const totalReservado = produtosFiltrados.reduce((sum, p) => sum + ((p.estoque_reservado || 0) * (p.custo_aquisicao || 0)), 0);
  const estoqueDisponivel = produtosFiltrados.reduce((sum, p) => {
    const disp = (p.estoque_atual || 0) - (p.estoque_reservado || 0);
    return sum + (disp * (p.custo_aquisicao || 0));
  }, 0);

  const recebimentos = movimentacoesFiltradas.filter(m => m.tipo_movimento === 'entrada' && (m.origem_movimento === 'compra' || m.documento?.startsWith('REC-')));
  const requisicoesAlmoxarifado = movimentacoesFiltradas.filter(m => m.tipo_movimento === 'saida' && m.documento?.startsWith('REQ-ALM-'));

  if (loadingPermissions) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }

  const modules = [
    {
      title: 'Produtos',
      description: 'Cadastro e estoque',
      icon: Box,
      color: 'indigo',
      component: ProdutosTab,
      windowTitle: '📦 Produtos',
      width: 1500,
      height: 850,
      props: { produtos: produtosFiltrados, isLoading: false }
    },
    {
      title: 'Movimentações',
      description: 'Entradas e saídas',
      icon: TrendingUp,
      color: 'blue',
      component: MovimentacoesTab,
      windowTitle: '📊 Movimentações',
      width: 1500,
      height: 850,
      props: { movimentacoes: movimentacoesFiltradas, produtos: produtosFiltrados }
    },
    {
      title: 'Recebimento',
      description: 'Entrada de mercadorias',
      icon: PackageCheck,
      color: 'green',
      component: RecebimentoTab,
      windowTitle: '📥 Recebimento',
      width: 1400,
      height: 800,
      props: { recebimentos, ordensCompra, produtos: produtosFiltrados }
    },
    {
      title: 'Requisições Almox.',
      description: 'Saídas almoxarifado',
      icon: PackageMinus,
      color: 'orange',
      component: RequisicoesAlmoxarifadoTab,
      windowTitle: '📤 Requisições Almoxarifado',
      width: 1400,
      height: 800,
      props: { requisicoes: requisicoesAlmoxarifado, produtos: produtosFiltrados }
    },
    {
      title: 'Solicitações Compra',
      description: 'Requisições internas',
      icon: PackageOpen,
      color: 'purple',
      component: SolicitacoesTab,
      windowTitle: '📋 Solicitações Compra',
      width: 1400,
      height: 800,
      props: { solicitacoes, produtos: produtosFiltrados }
    },
    {
      title: 'Lotes e Validade',
      description: 'Controle de lotes',
      icon: Clock,
      color: 'orange',
      component: ControleLotesValidade,
      windowTitle: '⏰ Lotes e Validade',
      width: 1400,
      height: 800,
      props: { empresaId: empresaAtual?.id }
    },
    {
      title: 'Relatórios',
      description: 'Analytics de estoque',
      icon: BarChart3,
      color: 'indigo',
      component: RelatoriosEstoque,
      windowTitle: '📈 Relatórios Estoque',
      width: 1400,
      height: 800,
      props: { produtos: produtosFiltrados, movimentacoes: movimentacoesFiltradas }
    },
    {
      title: 'IA Reposição',
      description: 'Sugestões inteligentes',
      icon: Sparkles,
      color: 'blue',
      component: IAReposicao,
      windowTitle: '🤖 IA Reposição',
      width: 1300,
      height: 750,
      props: { empresaId: empresaAtual?.id }
    },
  ];

  const handleModuleClick = (module) => {
    React.startTransition(() => {
      openWindow(
        module.component,
        { ...(module.props || {}), windowMode: true },
        {
          title: module.windowTitle,
          width: module.width,
          height: module.height,
          uniqueKey: `estoque-${module.title.toLowerCase().replace(/\s/g, '-')}`
        }
      );
    });
  };

  return (
    <ErrorBoundary>
      <div className="w-full min-h-screen p-1.5 space-y-1.5 overflow-auto bg-gradient-to-br from-slate-50 to-indigo-50">
        <HeaderEstoqueCompacto />
        
        <KPIsEstoque
          produtosAtivos={produtosAtivos}
          produtosBaixoEstoque={produtosBaixoEstoque}
          totalReservado={totalReservado}
          estoqueDisponivel={estoqueDisponivel}
        />

        {estaNoGrupo && (
          <Button
            onClick={() => openWindow(TransferenciaEntreEmpresasForm, {
              empresasDoGrupo,
              produtos,
              windowMode: true
            }, {
              title: '↔️ Transferência Entre Empresas',
              width: 900,
              height: 600
            })}
            className="bg-purple-600 hover:bg-purple-700 w-full"
            size="sm"
          >
            <ArrowLeftRight className="w-3 h-3 mr-2" />
            Transferir entre Empresas
          </Button>
        )}

        <ModulosGridEstoque 
          modules={modules}
          onModuleClick={handleModuleClick}
        />
      </div>
    </ErrorBoundary>
  );
}