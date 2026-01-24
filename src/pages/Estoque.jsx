import React, { Suspense, useState, useMemo } from "react";
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
  
  // Estados removidos - VisualizadorUniversalEntidade gerencia tudo internamente

  // Query removida - VisualizadorUniversalEntidade busca os dados

  // ✅ Contagens via backend otimizado
  const { data: contagensTotais = { total: 0, revenda: 0, producao: 0, estoqueBaixo: 0 }, isLoading: loadingContagens } = useQuery({
    queryKey: ['produtos-contagens-dashboard', empresaAtual?.id],
    queryFn: async () => {
      const filtroBase = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};

      const [totalRes, revendaRes, producaoRes] = await Promise.all([
        base44.functions.invoke('countEntities', { entityName: 'Produto', filter: filtroBase }),
        base44.functions.invoke('countEntities', { entityName: 'Produto', filter: { ...filtroBase, tipo_item: 'Revenda' } }),
        base44.functions.invoke('countEntities', { entityName: 'Produto', filter: { ...filtroBase, tipo_item: 'Matéria-Prima Produção' } })
      ]);

      const todosParaBaixo = await base44.entities.Produto.filter(filtroBase, undefined, 500);
      const estoqueBaixo = todosParaBaixo.filter(p => 
        p.status === 'Ativo' && (p.estoque_disponivel || 0) <= (p.estoque_minimo || 0)
      ).length;

      return {
        total: totalRes.data?.count || 0,
        revenda: revendaRes.data?.count || 0,
        producao: producaoRes.data?.count || 0,
        estoqueBaixo
      };
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
    retry: 1
  });

  const { data: movimentacoes = [] } = useQuery({
    queryKey: ['movimentacoes', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        return await base44.entities.MovimentacaoEstoque.filter(filtro, '-data_movimentacao', 50);
      } catch (err) {
        console.error('Erro ao buscar movimentações:', err);
        return [];
      }
    },
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  const { data: solicitacoes = [] } = useQuery({
    queryKey: ['solicitacoes', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        return await base44.entities.SolicitacaoCompra.filter(filtro, '-data_solicitacao', 50);
      } catch (err) {
        console.error('Erro ao buscar solicitações:', err);
        return [];
      }
    },
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  const { data: ordensCompra = [] } = useQuery({
    queryKey: ['ordensCompra', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        return await base44.entities.OrdemCompra.filter(filtro, '-data_solicitacao', 50);
      } catch (err) {
        console.error('Erro ao buscar ordens:', err);
        return [];
      }
    },
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  // Buscar produtos simples para KPIs de valor de estoque
  const { data: produtosParaKPIs = [] } = useQuery({
    queryKey: ['produtos-kpis', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        return await base44.entities.Produto.filter(filtro, undefined, 5000);
      } catch (err) {
        console.error('Erro ao buscar produtos para KPIs:', err);
        return [];
      }
    },
    staleTime: 60000,
    gcTime: 120000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  const movimentacoesFiltradas = movimentacoes;

  const totalReservado = useMemo(() => {
    return produtosParaKPIs.reduce((sum, p) => sum + ((p.estoque_reservado || 0) * (p.custo_aquisicao || 0)), 0);
  }, [produtosParaKPIs]);

  const estoqueDisponivel = useMemo(() => {
    return produtosParaKPIs.reduce((sum, p) => {
      const disp = (p.estoque_atual || 0) - (p.estoque_reservado || 0);
      return sum + (disp * (p.custo_aquisicao || 0));
    }, 0);
  }, [produtosParaKPIs]);

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
      props: {}
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
      props: { movimentacoes: movimentacoesFiltradas, produtos: produtosParaKPIs }
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
      props: { recebimentos, ordensCompra, produtos: produtosParaKPIs }
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
      props: { requisicoes: requisicoesAlmoxarifado, produtos: produtosParaKPIs }
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
      props: { solicitacoes, produtos: produtosParaKPIs }
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
      props: { produtos: produtosParaKPIs, movimentacoes: movimentacoesFiltradas }
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
          produtosAtivos={contagensTotais.total}
          produtosBaixoEstoque={contagensTotais.estoqueBaixo}
          totalReservado={totalReservado}
          estoqueDisponivel={estoqueDisponivel}
          produtosRevenda={contagensTotais.revenda}
          produtosProducao={contagensTotais.producao}
        />

        {estaNoGrupo && (
          <Button
            onClick={() => openWindow(TransferenciaEntreEmpresasForm, {
              empresasDoGrupo,
              produtos: produtosParaKPIs,
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