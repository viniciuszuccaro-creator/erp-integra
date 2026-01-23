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
  
  // V21.0 - Estados de Paginação e Filtros para Produtos
  const [currentPageProdutos, setCurrentPageProdutos] = useState(1);
  const [itemsPerPageProdutos, setItemsPerPageProdutos] = useState(100); // ✅ V22.0 ETAPA 2: Alterado de 50 para 100
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('todos');

  // V21.0 - Query paginada SERVER-SIDE com filtro de empresa
  const { data: produtos = [], isLoading: loadingProdutos } = useQuery({
    queryKey: ['produtos', currentPageProdutos, itemsPerPageProdutos, empresaAtual?.id],
    queryFn: async () => {
      try {
        const skip = (currentPageProdutos - 1) * itemsPerPageProdutos;
        const limit = itemsPerPageProdutos;
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        // ✅ Ordenação no backend por data de criação (mais recentes primeiro)
        const result = await base44.entities.Produto.filter(filtro, '-created_date', limit, skip);
        return result || [];
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
        return [];
      }
    },
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 2,
    retryDelay: 1000
  });

  // V22.0 - Contagem otimizada via backend para grandes volumes (893+ produtos)
  const { data: totalProdutos = 0 } = useQuery({
    queryKey: ['produtos-count', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        
        // Usa função backend otimizada
        const response = await base44.functions.invoke('countEntities', {
          entityName: 'Produto',
          filter: filtro
        });

        return response.data?.count || 0;
      } catch (err) {
        console.error('Erro ao contar produtos:', err);
        // Fallback
        try {
          const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
          const allData = await base44.entities.Produto.filter(filtro, undefined, 5000);
          return allData.length;
        } catch {
          return 0;
        }
      }
    },
    staleTime: 60000,
    gcTime: 120000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 2
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

  // Dados já vêm filtrados do servidor, aplicar filtros locais se necessário
  const produtosFiltrados = useMemo(() => {
    let resultado = produtos;

    // Aplicar busca local UNIVERSAL
    if (searchTerm.trim()) {
      const termo = searchTerm.toLowerCase();
      resultado = resultado.filter(p => 
        (p.descricao || '').toLowerCase().includes(termo) ||
        (p.codigo || '').toLowerCase().includes(termo) ||
        (p.codigo_barras || '').includes(termo) ||
        (p.grupo || '').toLowerCase().includes(termo) ||
        (p.grupo_produto_nome || '').toLowerCase().includes(termo) ||
        (p.marca_nome || '').toLowerCase().includes(termo) ||
        (p.setor_atividade_nome || '').toLowerCase().includes(termo) ||
        (p.tipo_item || '').toLowerCase().includes(termo) ||
        (p.fornecedor_principal || '').toLowerCase().includes(termo) ||
        (p.ncm || '').includes(termo) ||
        (p.cest || '').includes(termo) ||
        (p.subgrupo || '').toLowerCase().includes(termo) ||
        (p.localizacao || '').toLowerCase().includes(termo) ||
        (p.observacoes || '').toLowerCase().includes(termo)
      );
    }

    // Aplicar filtro de categoria
    if (selectedCategoria !== 'todos') {
      resultado = resultado.filter(p => p.grupo === selectedCategoria);
    }

    return resultado;
  }, [produtos, searchTerm, selectedCategoria]);

  const movimentacoesFiltradas = movimentacoes;

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
      props: { 
        produtos: produtosFiltrados,
        isLoading: loadingProdutos,
        currentPage: currentPageProdutos,
        totalItems: totalProdutos,
        itemsPerPage: itemsPerPageProdutos,
        onPageChange: setCurrentPageProdutos,
        onItemsPerPageChange: setItemsPerPageProdutos,
        searchTerm,
        onSearchChange: setSearchTerm,
        selectedCategoria,
        onCategoriaChange: setSelectedCategoria
      }
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