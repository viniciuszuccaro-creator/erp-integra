import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SearchInput from '@/components/ui/SearchInput';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PaginationControls from '@/components/ui/PaginationControls';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit2, 
  Trash2, 
  Download,
  RefreshCw,
  Grid3x3,
  List,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Table as TableIcon,
  AlertCircle
  } from 'lucide-react';
import { useWindow } from '@/components/lib/useWindow';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import usePermissions from '@/components/lib/usePermissions';
import { useToast } from "@/components/ui/use-toast";

/**
 * V21.7 - VISUALIZADOR UNIVERSAL DE ENTIDADES - REAL-TIME + ORGANIZAÇÃO AVANÇADA
 * 
 * Componente genérico que lista qualquer entidade com:
 * - ✅ Real-time: Auto-refresh a cada 30s
 * - ✅ Organização avançada específica por entidade
 * - ✅ Ordenação por clique nas colunas (visualização tabela)
 * - ✅ Busca universal em todos os campos
 * - ✅ Filtros multi-empresa
 * - ✅ Grid/Lista/Tabela view
 * - ✅ Ações de editar/visualizar/excluir
 * - ✅ Exportação
 * - ✅ w-full/h-full responsivo
 */

// CONFIGURAÇÕES DE ORDENAÇÃO POR TIPO DE ENTIDADE
const OPCOES_ORDENACAO = {
  Cliente: [
    { value: 'nome', label: 'Nome (A-Z)', sortFn: (a, b) => (a.nome || '').localeCompare(b.nome || '') },
    { value: 'nome_desc', label: 'Nome (Z-A)', sortFn: (a, b) => (b.nome || '').localeCompare(a.nome || '') },
    { value: 'cidade', label: 'Cidade (A-Z)', sortFn: (a, b) => (a.endereco_principal?.cidade || '').localeCompare(b.endereco_principal?.cidade || '') },
    { value: 'limite_credito', label: 'Limite de Crédito (Maior)', sortFn: (a, b) => (b.condicao_comercial?.limite_credito || 0) - (a.condicao_comercial?.limite_credito || 0) },
    { value: 'limite_credito_menor', label: 'Limite de Crédito (Menor)', sortFn: (a, b) => (a.condicao_comercial?.limite_credito || 0) - (b.condicao_comercial?.limite_credito || 0) },
    { value: 'mais_compras', label: 'Que Mais Compra', sortFn: (a, b) => (b.valor_compras_12meses || 0) - (a.valor_compras_12meses || 0) },
    { value: 'menos_compras', label: 'Que Menos Compra', sortFn: (a, b) => (a.valor_compras_12meses || 0) - (b.valor_compras_12meses || 0) },
    { value: 'status', label: 'Status', sortFn: (a, b) => (a.status || '').localeCompare(b.status || '') },
    { value: 'recent', label: 'Mais Recentes', sortFn: (a, b) => new Date(b.created_date) - new Date(a.created_date) }
  ],
  Fornecedor: [
    { value: 'nome', label: 'Nome (A-Z)', sortFn: (a, b) => (a.nome || '').localeCompare(b.nome || '') },
    { value: 'nome_desc', label: 'Nome (Z-A)', sortFn: (a, b) => (b.nome || '').localeCompare(a.nome || '') },
    { value: 'cidade', label: 'Cidade (A-Z)', sortFn: (a, b) => (a.endereco_principal?.cidade || '').localeCompare(b.endereco_principal?.cidade || '') },
    { value: 'nota_media', label: 'Melhor Avaliação', sortFn: (a, b) => (b.nota_media || 0) - (a.nota_media || 0) },
    { value: 'mais_compras', label: 'Mais Comprado', sortFn: (a, b) => (b.valor_total_compras || 0) - (a.valor_total_compras || 0) },
    { value: 'recent', label: 'Mais Recentes', sortFn: (a, b) => new Date(b.created_date) - new Date(a.created_date) }
  ],
  Transportadora: [
    { value: 'razao_social', label: 'Razão Social (A-Z)', sortFn: (a, b) => (a.razao_social || '').localeCompare(b.razao_social || '') },
    { value: 'cidade', label: 'Cidade (A-Z)', sortFn: (a, b) => (a.cidade || '').localeCompare(b.cidade || '') },
    { value: 'nota_media', label: 'Melhor Avaliação', sortFn: (a, b) => (b.nota_media || 0) - (a.nota_media || 0) },
    { value: 'entregas_prazo', label: 'Entregas no Prazo (%)', sortFn: (a, b) => (b.percentual_entregas_prazo || 0) - (a.percentual_entregas_prazo || 0) },
    { value: 'recent', label: 'Mais Recentes', sortFn: (a, b) => new Date(b.created_date) - new Date(a.created_date) }
  ],
  Produto: [
    { value: 'descricao', label: 'Descrição (A-Z)' },
    { value: 'descricao_desc', label: 'Descrição (Z-A)' },
    { value: 'codigo', label: 'Código (Crescente) ⬆️' },
    { value: 'codigo_desc', label: 'Código (Decrescente) ⬇️' },
    { value: 'tipo', label: 'Tipo (A-Z)' },
    { value: 'tipo_desc', label: 'Tipo (Z-A)' },
    { value: 'setor', label: 'Setor de Atividade (A-Z)' },
    { value: 'setor_desc', label: 'Setor de Atividade (Z-A)' },
    { value: 'grupo', label: 'Categoria/Grupo (A-Z)' },
    { value: 'grupo_desc', label: 'Categoria/Grupo (Z-A)' },
    { value: 'marca', label: 'Marca (A-Z)' },
    { value: 'marca_desc', label: 'Marca (Z-A)' },
    { value: 'status', label: 'Status (A-Z)' },
    { value: 'status_desc', label: 'Status (Z-A)' },
    { value: 'mais_vendidos', label: 'Mais Vendidos' },
    { value: 'menos_vendidos', label: 'Menos Vendidos' },
    { value: 'estoque_baixo', label: 'Estoque Baixo' },
    { value: 'estoque_alto', label: 'Estoque Alto' },
    { value: 'preco', label: 'Preço (Maior)' },
    { value: 'preco_menor', label: 'Preço (Menor)' },
    { value: 'recent', label: 'Mais Recentes' }
  ],
  Colaborador: [
    { value: 'nome', label: 'Nome (A-Z)', sortFn: (a, b) => (a.nome_completo || '').localeCompare(b.nome_completo || '') },
    { value: 'cargo', label: 'Cargo', sortFn: (a, b) => (a.cargo || '').localeCompare(b.cargo || '') },
    { value: 'departamento', label: 'Departamento', sortFn: (a, b) => (a.departamento || '').localeCompare(b.departamento || '') },
    { value: 'admissao', label: 'Data Admissão', sortFn: (a, b) => new Date(b.data_admissao || 0) - new Date(a.data_admissao || 0) },
    { value: 'salario', label: 'Salário (Maior)', sortFn: (a, b) => (b.salario || 0) - (a.salario || 0) }
  ],
  // Genérico para outras entidades
  default: [
    { value: 'recent', label: 'Mais Recentes', sortFn: (a, b) => new Date(b.created_date) - new Date(a.created_date) },
    { value: 'oldest', label: 'Mais Antigos', sortFn: (a, b) => new Date(a.created_date) - new Date(b.created_date) }
  ]
};

// Mapeamento de chaves de cache (aliases) para manter atualização consistente entre módulos
const ALIAS_QUERY_KEYS = {
  Cliente: ['clientes'],
  Fornecedor: ['fornecedores'],
  Transportadora: ['transportadoras'],
  Colaborador: ['colaboradores'],
  Representante: ['representantes'],
  ContatoB2B: ['contatos-b2b'],
  Produto: ['produtos'],
  Servico: ['servicos'],
  SetorAtividade: ['setores-atividade'],
  GrupoProduto: ['grupos-produto'],
  Marca: ['marcas'],
  TabelaPreco: ['tabelas-preco'],
  CatalogoWeb: ['catalogo-web'],
  KitProduto: ['kits-produto'],
  Banco: ['bancos'],
  FormaPagamento: ['formas-pagamento'],
  OperadorCaixa: ['operadores-caixa'],
  PlanoDeContas: ['plano-contas'],
  CentroCusto: ['centrosCusto'],
  CentroResultado: ['centros-resultado'],
  TipoDespesa: ['tipos-despesa'],
  MoedaIndice: ['moedas-indices'],
  CondicaoComercial: ['condicoes-comerciais'],
  RegiaoAtendimento: ['regioes-atendimento'],
  UnidadeMedida: ['unidades-medida'],
  Veiculo: ['veiculos'],
  Motorista: ['motoristas'],
  TipoFrete: ['tipos-frete'],
  LocalEstoque: ['locais-estoque'],
  RotaPadrao: ['rotas-padrao'],
  ModeloDocumento: ['modelos-documento'],
  Empresa: ['empresas'],
  GrupoEmpresarial: ['grupos'],
  Departamento: ['departamentos'],
  Cargo: ['cargos'],
  Turno: ['turnos'],
  User: ['usuarios'],
  PerfilAcesso: ['perfis-acesso'],
  EventoNotificacao: ['eventos-notificacao'],
  ConfiguracaoIntegracaoMarketplace: ['configs-integracao-marketplace'],
  Webhook: ['webhooks'],
  ChatbotIntent: ['chatbotIntents'],
  ChatbotCanal: ['chatbotCanais'],
  ApiExterna: ['apis-externas'],
  JobAgendado: ['jobs-agendados'],
  IAConfig: ['configs-ia'],
  ParametroPortalCliente: ['parametros-portal'],
  ParametroOrigemPedido: ['parametros-origem-pedido'],
  ParametroRecebimentoNFe: ['parametros-recebimento-nfe'],
  ParametroRoteirizacao: ['parametros-roteirizacao'],
  ParametroConciliacaoBancaria: ['parametros-conciliacao'],
  ParametroCaixaDiario: ['parametros-caixa'],
  TabelaFiscal: ['tabelas-fiscais']
};

// ✅ Mapeamento de colunas clicáveis para ordenação por entidade
const COLUNAS_ORDENACAO = {
  Produto: [
    { campo: 'codigo', label: 'Código', getValue: (item) => item.codigo || '', isNumeric: true },
    { campo: 'descricao', label: 'Descrição', getValue: (item) => item.descricao || '' },
    { campo: 'tipo_item', label: 'Tipo', getValue: (item) => item.tipo_item || '' },
    { campo: 'setor_atividade_nome', label: 'Setor', getValue: (item) => item.setor_atividade_nome || '' },
    { campo: 'grupo_produto_nome', label: 'Categoria', getValue: (item) => item.grupo_produto_nome || item.grupo || '' },
    { campo: 'marca_nome', label: 'Marca', getValue: (item) => item.marca_nome || '' },
    { campo: 'status', label: 'Status', getValue: (item) => item.status || '' },
    { campo: 'estoque_atual', label: 'Estoque', getValue: (item) => item.estoque_atual || 0, isNumeric: true },
    { campo: 'preco_venda', label: 'Preço', getValue: (item) => item.preco_venda || 0, isNumeric: true }
  ],
  Cliente: [
    { campo: 'nome', label: 'Nome', getValue: (item) => item.nome || '' },
    { campo: 'tipo', label: 'Tipo', getValue: (item) => item.tipo || '' },
    { campo: 'status', label: 'Status', getValue: (item) => item.status || '' },
    { campo: 'cidade', label: 'Cidade', getValue: (item) => item.endereco_principal?.cidade || '' },
    { campo: 'vendedor_responsavel', label: 'Vendedor', getValue: (item) => item.vendedor_responsavel || '' }
  ],
  Fornecedor: [
    { campo: 'nome', label: 'Nome', getValue: (item) => item.nome || '' },
    { campo: 'categoria', label: 'Categoria', getValue: (item) => item.categoria || '' },
    { campo: 'cidade', label: 'Cidade', getValue: (item) => item.endereco_principal?.cidade || '' },
    { campo: 'nota_media', label: 'Avaliação', getValue: (item) => item.nota_media || 0, isNumeric: true }
  ],
  default: [
    { campo: 'nome', label: 'Nome', getValue: (item) => item.nome || item.descricao || item.titulo || '' },
    { campo: 'status', label: 'Status', getValue: (item) => item.status || '' }
  ]
};

export default function VisualizadorUniversalEntidade({ 
  nomeEntidade,
  tituloDisplay,
  icone: Icone,
  camposPrincipais = [],
  componenteEdicao,
  componenteVisualizacao,
  windowMode = false,
  queryKeyOverride,
  queryKey: legacyQueryKey,
  onSelectionChange,
  filtroAdicional = null
}) {
  const [busca, setBusca] = useState('');
  const [visualizacao, setVisualizacao] = useState('table'); // ✅ Default: tabela
  const [expandidos, setExpandidos] = useState({});
  const [ordenacao, setOrdenacao] = useState('recent');
  const [colunaOrdenacao, setColunaOrdenacao] = useState(null);
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState('asc');
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  // V21.0 - Estados de Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100); // ✅ V22.0 ETAPA 2: Alterado de 50 para 100
  const { openWindow, closeWindow } = useWindow();
  const { empresaAtual, filtrarPorContexto } = useContextoVisual();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const moduloPermissao = React.useMemo(() => {
    const estoque = ['Produto','UnidadeMedida','LocalEstoque','GrupoProduto','Marca'];
    const financeiro = ['Banco','FormaPagamento','PlanoDeContas','CentroCusto','CentroResultado','TipoDespesa','MoedaIndice','CondicaoComercial','TabelaFiscal'];
    const expedicao = ['Transportadora','Veiculo','Motorista','TipoFrete','RotaPadrao','ModeloDocumento'];
    const rh = ['Colaborador','Departamento','Cargo','Turno'];
    if (estoque.includes(nomeEntidade)) return 'estoque';
    if (financeiro.includes(nomeEntidade)) return 'financeiro';
    if (expedicao.includes(nomeEntidade)) return 'expedicao';
    if (rh.includes(nomeEntidade)) return 'rh';
    return 'cadastros';
  }, [nomeEntidade]);

  // Obter opções de ordenação específicas da entidade
  const opcoesOrdenacao = OPCOES_ORDENACAO[nomeEntidade] || OPCOES_ORDENACAO.default;
  const colunasOrdenacao = COLUNAS_ORDENACAO[nomeEntidade] || COLUNAS_ORDENACAO.default;

  // ✅ REAL-TIME: Buscar dados com auto-refresh a cada 30s - SEM initialData
  const override = (typeof legacyQueryKey !== 'undefined' ? legacyQueryKey : queryKeyOverride);
  const queryKey = Array.isArray(override) ? override : [override || nomeEntidade.toLowerCase()];

  const { getFiltroContexto } = useContextoVisual();
  
  // ✅ Mapear ordenação do menu/coluna para string de ordenação do backend
  const getBackendSortString = () => {
    if (colunaOrdenacao) {
      // Ordenação numérica especial para código
      if (colunaOrdenacao === 'codigo' && nomeEntidade === 'Produto') {
        return direcaoOrdenacao === 'desc' ? '-codigo' : 'codigo';
      }
      return direcaoOrdenacao === 'desc' ? `-${colunaOrdenacao}` : colunaOrdenacao;
    }
    
    const sortMap = {
      'recent': '-created_date',
      'oldest': 'created_date',
      'nome': 'nome',
      'nome_desc': '-nome',
      'descricao': 'descricao',
      'descricao_desc': '-descricao',
      'codigo': 'codigo',
      'codigo_desc': '-codigo',
      'tipo': 'tipo_item',
      'tipo_desc': '-tipo_item',
      'setor': 'setor_atividade_nome',
      'setor_desc': '-setor_atividade_nome',
      'grupo': 'grupo_produto_nome',
      'grupo_desc': '-grupo_produto_nome',
      'marca': 'marca_nome',
      'marca_desc': '-marca_nome',
      'status': 'status',
      'status_desc': '-status',
      'preco': '-preco_venda',
      'preco_menor': 'preco_venda',
      'estoque_alto': '-estoque_atual',
      'estoque_baixo': 'estoque_disponivel',
      'mais_vendidos': '-quantidade_vendida_12meses',
      'menos_vendidos': 'quantidade_vendida_12meses',
      'cidade': 'endereco_principal.cidade',
      'limite_credito': '-condicao_comercial.limite_credito',
      'limite_credito_menor': 'condicao_comercial.limite_credito',
      'mais_compras': '-valor_compras_12meses',
      'menos_compras': 'valor_compras_12meses',
      'razao_social': 'razao_social',
      'nota_media': '-nota_media',
      'entregas_prazo': '-percentual_entregas_prazo',
      'cargo': 'cargo',
      'departamento': 'departamento',
      'admissao': '-data_admissao',
      'salario': '-salario'
    };
    
    return sortMap[ordenacao] || '-created_date';
  };

  // ✅ Construir filtro com busca integrada ao backend
  const buildFilterWithSearch = () => {
    const filtroContexto = getFiltroContexto('empresa_id', true);
    
    if (!busca.trim()) {
      console.log('🔍 Sem busca, retornando filtro contexto:', filtroContexto);
      return filtroContexto;
    }

    // Busca universal no backend - procura em múltiplos campos
    const termoBusca = busca.trim();
    const buscaFiltros = [];
    
    // Campos principais para busca conforme a entidade
    const camposBusca = {
      'Produto': ['descricao', 'codigo', 'codigo_barras', 'grupo_produto_nome', 'marca_nome', 'setor_atividade_nome'],
      'Cliente': ['nome', 'razao_social', 'nome_fantasia', 'cpf', 'cnpj'],
      'Fornecedor': ['nome', 'razao_social', 'nome_fantasia', 'cnpj'],
      'Colaborador': ['nome_completo', 'cpf', 'cargo', 'departamento'],
      'Transportadora': ['razao_social', 'nome_fantasia', 'cnpj']
    };

    const campos = camposBusca[nomeEntidade] || ['nome', 'descricao', 'codigo'];
    
    campos.forEach(campo => {
      buscaFiltros.push({ [campo]: { $regex: termoBusca, $options: 'i' } });
    });

    const filtroFinal = {
      ...filtroContexto,
      $or: buscaFiltros
    };
    
    console.log('🔍 Filtro com busca construído:', filtroFinal);
    
    return filtroFinal;
  };
  
  const { data: dados = [], isLoading, isFetching, refetch, error } = useQuery({
    queryKey: [...queryKey, empresaAtual?.id, ordenacao, colunaOrdenacao, direcaoOrdenacao, busca],
    queryFn: async () => {
      const filtro = buildFilterWithSearch();
      
      // ✅ CORREÇÃO: Para ordenação por código, buscar TODOS os produtos (não paginar)
      if (nomeEntidade === 'Produto' && (colunaOrdenacao === 'codigo' || ordenacao === 'codigo' || ordenacao === 'codigo_desc')) {
        console.log('🔢 Buscando TODOS os produtos para ordenação numérica por código');
        let todosOsProdutos = [];
        let skip = 0;
        const batchSize = 500;
        let hasMore = true;
        
        while (hasMore) {
          const batch = await base44.entities[nomeEntidade].filter(filtro, undefined, batchSize, skip);
          if (!batch || batch.length === 0) {
            hasMore = false;
          } else {
            todosOsProdutos = [...todosOsProdutos, ...batch];
            if (batch.length < batchSize) {
              hasMore = false;
            } else {
              skip += batchSize;
            }
          }
        }
        
        console.log('📦 Total de produtos carregados para ordenação:', todosOsProdutos.length);
        console.log('📦 Primeiros 10 códigos:', todosOsProdutos.slice(0, 10).map(p => p.codigo));
        return todosOsProdutos;
      }
      
      // Para outras ordenações, usar paginação normal
      const skip = (currentPage - 1) * itemsPerPage;
      const sortString = getBackendSortString();
      
      console.log('🔍 BUSCA BACKEND:', { filtro, sortString, limit: itemsPerPage, skip });
      
      const result = await base44.entities[nomeEntidade].filter(
        filtro, 
        sortString,
        itemsPerPage,
        skip
      );
      
      console.log('📦 RESULTADO:', result?.length, 'itens retornados');
      
      return result || [];
    },
    staleTime: 30000,
    gcTime: 60000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1
  });

  // ✅ CONTAGEM TOTAL via backend (necessária para paginação correta)
  const { data: totalItemsCount = 0, isLoading: isLoadingCount } = useQuery({
    queryKey: [...queryKey, 'total-count', empresaAtual?.id, busca],
    queryFn: async () => {
      const filtro = buildFilterWithSearch();
      console.log('📊 CONTAGEM BACKEND:', { entityName: nomeEntidade, filtro });
      const response = await base44.functions.invoke('countEntities', {
        entityName: nomeEntidade,
        filter: filtro
      });
      console.log('📊 CONTAGEM RESPOSTA:', response.data);
      return response.data?.count || 0;
    },
    staleTime: 60000,
    gcTime: 120000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  const isEstimateCount = false;

  const aliasKeys = ALIAS_QUERY_KEYS[nomeEntidade] || [];
  const invalidateAllRelated = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey }),
      queryClient.refetchQueries({ queryKey }),
      ...aliasKeys.map((k) => queryClient.invalidateQueries({ queryKey: [k] })),
      ...aliasKeys.map((k) => queryClient.refetchQueries({ queryKey: [k] })),
    ]);
  };

  // Dados já vêm filtrados do servidor, não precisa filtrar novamente no cliente
  const dadosFiltrados = dados;

  // ✅ Ordenação por clique em coluna - SEMPRE Resetar para página 1
  const handleOrdenarPorColuna = (campo) => {
    setCurrentPage(1); // ✅ PRIMEIRO reseta a página
    if (colunaOrdenacao === campo) {
      setDirecaoOrdenacao(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setColunaOrdenacao(campo);
      setDirecaoOrdenacao('asc');
    }
    setOrdenacao(''); // Limpa ordenação do menu
  };

  // ✅ Busca já aplicada no BACKEND, mas ordenação de código precisa ser numérica no FRONTEND
  const dadosBuscadosEOrdenados = useMemo(() => {
    let resultado = [...dados];
    
    // Aplicar filtro adicional se fornecido (ex: estoque baixo)
    if (filtroAdicional && typeof filtroAdicional === 'function') {
      resultado = resultado.filter(filtroAdicional);
    }
    
    // ✅ ORDENAÇÃO NUMÉRICA DE CÓDIGO NO FRONTEND - já vem tudo carregado quando ordenando por código
    if (nomeEntidade === 'Produto' && (colunaOrdenacao === 'codigo' || ordenacao === 'codigo' || ordenacao === 'codigo_desc')) {
      console.log('🔢 Ordenando por código numericamente - TODOS os produtos:', resultado.length);
      resultado.sort((a, b) => {
        const aNum = parseFloat(a.codigo) || 0;
        const bNum = parseFloat(b.codigo) || 0;
        const isDesc = ordenacao === 'codigo_desc' || (colunaOrdenacao === 'codigo' && direcaoOrdenacao === 'desc');
        const comparison = isDesc ? bNum - aNum : aNum - bNum;
        if (resultado.length < 10) {
          console.log(`Comparando: ${a.codigo}(${aNum}) vs ${b.codigo}(${bNum}) = ${comparison}`);
        }
        return comparison;
      });
      
      // ✅ Aplicar paginação MANUALMENTE após ordenar tudo
      const skip = (currentPage - 1) * itemsPerPage;
      const paginado = resultado.slice(skip, skip + itemsPerPage);
      console.log(`📄 Página ${currentPage}: mostrando ${paginado.length} itens (${skip} a ${skip + itemsPerPage})`);
      console.log('🔢 Primeiros códigos:', paginado.slice(0, 5).map(p => p.codigo));
      return paginado;
    }
    
    return resultado;
  }, [dados, filtroAdicional, nomeEntidade, colunaOrdenacao, ordenacao, direcaoOrdenacao, currentPage, itemsPerPage]);

  // Seleção em massa + exclusão
  const allSelected = dadosBuscadosEOrdenados.length > 0 && selectedIds.size === dadosBuscadosEOrdenados.length;
  const toggleSelectAll = () => {
    const ns = allSelected ? new Set() : new Set(dadosBuscadosEOrdenados.map(i => i.id));
    setSelectedIds(ns);
    if (typeof onSelectionChange === 'function') onSelectionChange(ns);
  };
  const toggleItem = (id) => {
    setSelectedIds(prev => {
      const ns = new Set(prev);
      if (ns.has(id)) ns.delete(id); else ns.add(id);
      if (typeof onSelectionChange === 'function') onSelectionChange(ns);
      return ns;
    });
  };
  
  const excluirSelecionados = async () => {
    if (selectedIds.size === 0) return;
    await Promise.all(Array.from(selectedIds).map(id => base44.entities[nomeEntidade].delete(id)));
    setSelectedIds(new Set());
    await invalidateAllRelated();
  };

  // Determinar campos a exibir
  const camposExibicao = camposPrincipais.length > 0 
    ? camposPrincipais 
    : Object.keys(dadosBuscadosEOrdenados[0] || {}).filter(k => 
        !['id', 'created_date', 'updated_date', 'created_by'].includes(k)
      ).slice(0, 6);

  // Função de exportação
  const exportarDados = () => {
    const csv = [
      camposExibicao.join(','),
      ...dadosBuscadosEOrdenados.map(item => 
        camposExibicao.map(campo => 
          JSON.stringify(item[campo] || '')
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nomeEntidade}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Abrir edição - V21.6.2 CORREÇÃO TOTAL: Passar TODOS os nomes possíveis + Z-index MÁXIMO
          const handleAbrirNovo = () => {
          abrirEdicao(null);
        }

        const abrirEdicao = (item) => {
    if (componenteEdicao) {
      const propName = nomeEntidade.charAt(0).toLowerCase() + nomeEntidade.slice(1);

      const props = {
        [propName]: item,
        [nomeEntidade]: item,
        cliente: item,
        fornecedor: item,
        transportadora: item,
        colaborador: item,
        representante: item,
        contatoB2B: item,
        produto: item,
        setor: item,
        setorAtividade: item,
        grupo: item,
        grupoProduto: item,
        marca: item,
        tabela: item,
        tabelaPreco: item,
        tabelaFiscal: item,
        servico: item,
        kitProduto: item,
        kit: item,
        unidadeMedida: item,
        unidade: item,
        catalogoWeb: item,
        catalogo: item,
        banco: item,
        formaPagamento: item,
        forma: item,
        planoDeContas: item,
        conta: item,
        centroCusto: item,
        centro: item,
        centroResultado: item,
        tipoDespesa: item,
        tipo: item,
        moedaIndice: item,
        moeda: item,
        condicaoComercial: item,
        condicao: item,
        veiculo: item,
        motorista: item,
        tipoFrete: item,
        localEstoque: item,
        local: item,
        rotaPadrao: item,
        rota: item,
        modeloDocumento: item,
        modelo: item,
        webhook: item,
        eventoNotificacao: item,
        evento: item,
        configuracaoIntegracaoMarketplace: item,
        config: item,
        chatbotIntent: item,
        intent: item,
        chatbotCanal: item,
        canal: item,
        apiExterna: item,
        api: item,
        jobAgendado: item,
        job: item,
        parametroPortalCliente: item,
        parametroOrigemPedido: item,
        parametroRecebimentoNFe: item,
        parametroRoteirizacao: item,
        parametroConciliacaoBancaria: item,
        parametroCaixaDiario: item,
        empresa: item,
        grupoEmpresarial: item,
        departamento: item,
        dept: item,
        cargo: item,
        turno: item,
        segmentoCliente: item,
        seg: item,
        regiaoAtendimento: item,
        regiao: item,
        windowMode: true
      };

      let winId;
      const closeSelf = () => closeWindow(winId);

      const handleSubmitForm = async (formData) => {
        const entityName = nomeEntidade;
        try {
            if (formData._action === 'delete') {
                await base44.entities[entityName].delete(formData.id);
                toast({ title: `✅ ${entityName} excluído com sucesso!` });
            } else if (formData.id) {
                await base44.entities[entityName].update(formData.id, formData);
                toast({ title: `✅ ${entityName} atualizado com sucesso!` });
            } else {
                await base44.entities[entityName].create(formData);
                toast({ title: `✅ ${entityName} criado com sucesso!` });
            }
            await invalidateAllRelated();
            closeSelf();
        } catch(err) {
            toast({ title: `❌ Erro ao salvar ${entityName}`, description: err.message, variant: "destructive" });
        }
      };

      const handleSuccess = async () => {
        await invalidateAllRelated();
        closeSelf();
      };

      const finalProps = {
        ...props,
        closeWindow: closeSelf,
        closeSelf,
        onSuccess: handleSuccess,
        onSubmit: handleSubmitForm,
      };

      winId = openWindow(
        componenteEdicao,
        finalProps,
        {
          title: item ? `✏️ Editar ${tituloDisplay}`: `✨ Novo ${tituloDisplay}`,
          width: 1000,
          height: 700,
onClose: invalidateAllRelated,
          uniqueKey: `edit-${nomeEntidade}-${item?.id || 'new'}-${Date.now()}`,
          zIndex: 99999999,
          bringToFront: true,
          forceTop: true,
          ensureOnTop: true
        }
      );
    }
  };

  // Abrir visualização - V21.6.2 CORREÇÃO: z-index alto
  const abrirVisualizacao = (item) => {
    if (componenteVisualizacao) {
      let winId;
      const closeSelf = () => closeWindow(winId);
      const finalProps = { [nomeEntidade.toLowerCase()]: item, id: item.id, closeWindow: closeSelf, closeSelf };
      winId = openWindow(
        componenteVisualizacao,
        finalProps,
        {
          title: `👁️ Detalhes de ${tituloDisplay}`,
          width: 900,
          height: 600,
onClose: invalidateAllRelated,
          uniqueKey: `view-${nomeEntidade}-${item.id}-${Date.now()}`,
          zIndex: 99999999,
          bringToFront: true
        }
      );
    }
  };

  // Toggle expandir item
  const toggleExpandir = (id) => {
    setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const containerClass = windowMode 
    ? 'w-full h-full flex flex-col overflow-hidden' 
    : '';

  const contentClass = windowMode 
    ? 'flex-1 overflow-y-auto' 
    : '';

  const Wrapper = ({ children }) => windowMode ? (
    <div className={containerClass}>{children}</div>
  ) : (
    <>{children}</>
  );

  return (
    <Wrapper>
      <Card className={windowMode ? 'h-full flex flex-col' : ''}>
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {Icone && <Icone className="w-6 h-6 text-blue-600" />}
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  {tituloDisplay}
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 animate-pulse">
                    ⚡ Real-Time
                  </Badge>
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Mostrando {dadosBuscadosEOrdenados.length} de {isEstimateCount ? `~${totalItemsCount}` : totalItemsCount} {totalItemsCount === 1 ? 'registro' : 'registros'}
                  {isEstimateCount && <span className="text-xs text-amber-600 ml-1">(estimativa)</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const aliases = ALIAS_QUERY_KEYS[nomeEntidade] || [];
                  await Promise.all([
                    queryClient.invalidateQueries({ queryKey }),
                    queryClient.refetchQueries({ queryKey }),
                    ...aliases.map((k) => queryClient.invalidateQueries({ queryKey: [k] })),
                    ...aliases.map((k) => queryClient.refetchQueries({ queryKey: [k] })),
                  ]);
                  await refetch();
                }}
                disabled={false}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportarDados}
                disabled={!hasPermission(moduloPermissao, 'exportar')}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button
                                variant="primary"
                                size="sm"
                                onClick={handleAbrirNovo}
                                disabled={!hasPermission(moduloPermissao, 'criar')}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Novo {tituloDisplay}
                              </Button>

                              <Button
                              variant="outline"
                              size="sm"
                              onClick={toggleSelectAll}
                            >
                {allSelected ? 'Limpar Seleção' : 'Selecionar Todos'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={excluirSelecionados}
                disabled={selectedIds.size === 0 || !hasPermission(moduloPermissao, 'deletar')}
                className="border-red-300 text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Selecionados
              </Button>
            </div>
          </div>

          {/* Barra de Busca, Ordenação e Filtros - CORREÇÃO: input nativo para garantir funcionamento */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
            <SearchInput
              value={busca}
              onChange={(val) => {
                setBusca(val);
                setCurrentPage(1);
              }}
              placeholder="🔍 Busca universal em todos os campos..."
              className="flex-1"
            />
            
            {/* ✅ ORDENAÇÃO POR MENU */}
            <Select value={ordenacao || 'recent'} onValueChange={(val) => {
              setCurrentPage(1); // ✅ PRIMEIRO reseta a página
              setOrdenacao(val);
              setColunaOrdenacao(null); // Limpa ordenação por coluna
            }}>
              <SelectTrigger className="w-full sm:w-64">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  <SelectValue placeholder="Organizar por..." />
                </div>
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={5}>
                {opcoesOrdenacao.map(opcao => (
                  <SelectItem key={opcao.value} value={opcao.value}>
                    {opcao.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* ✅ Indicador de ordenação ativa */}
            {colunaOrdenacao && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 px-3 py-2">
                Ordenado por: {colunasOrdenacao.find(c => c.campo === colunaOrdenacao)?.label || colunaOrdenacao} 
                {direcaoOrdenacao === 'asc' ? ' ↑' : ' ↓'}
              </Badge>
            )}

            <div className="flex items-center gap-1 border rounded-lg p-1 bg-white">
              <Button
                variant={visualizacao === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setVisualizacao('table')}
                className="h-8"
                title="Visualização em Tabela"
              >
                <TableIcon className="w-4 h-4" />
              </Button>
              <Button
                variant={visualizacao === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setVisualizacao('grid')}
                className="h-8"
                title="Visualização em Cards"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={visualizacao === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setVisualizacao('list')}
                className="h-8"
                title="Visualização em Lista"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className={`p-6 ${contentClass}`}>
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 mx-auto text-blue-600 animate-spin mb-3" />
              <p className="text-slate-600">Carregando dados...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-3" />
              <p className="text-slate-900 font-semibold mb-2">Erro ao carregar dados</p>
              <p className="text-slate-600 text-sm mb-4">{error.message || 'Verifique sua conexão com a internet'}</p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          ) : dadosBuscadosEOrdenados.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-600 font-medium">
                {busca ? 'Nenhum resultado encontrado' : 'Nenhum registro cadastrado'}
              </p>
              {busca && (
                <p className="text-sm text-slate-500 mt-2">
                  Tente ajustar os termos de busca
                </p>
              )}
            </div>
          ) : (
            <>
              {/* ✅ NOVA VISUALIZAÇÃO EM TABELA COM COLUNAS CLICÁVEIS */}
              {visualizacao === 'table' && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b-2 border-slate-200">
                        <th className="p-3 text-left">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={allSelected}
                            onChange={toggleSelectAll}
                          />
                        </th>
                        {colunasOrdenacao.map((coluna) => (
                          <th
                            key={coluna.campo}
                            className="p-3 text-left font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                            onClick={() => handleOrdenarPorColuna(coluna.campo)}
                          >
                            <div className="flex items-center gap-2">
                              <span>{coluna.label}</span>
                              {colunaOrdenacao === coluna.campo && (
                                direcaoOrdenacao === 'asc' ? (
                                  <ArrowUp className="w-4 h-4 text-blue-600" />
                                ) : (
                                  <ArrowDown className="w-4 h-4 text-blue-600" />
                                )
                              )}
                              {colunaOrdenacao !== coluna.campo && (
                                <ArrowUpDown className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                          </th>
                        ))}
                        <th className="p-3 text-right font-semibold text-slate-700">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dadosBuscadosEOrdenados.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-slate-100 hover:bg-blue-50 transition-colors"
                        >
                          <td className="p-3">
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={selectedIds.has(item.id)}
                              onChange={() => toggleItem(item.id)}
                            />
                          </td>
                          {colunasOrdenacao.map((coluna) => {
                            const valor = coluna.getValue(item);
                            return (
                              <td key={coluna.campo} className="p-3 text-sm">
                                {coluna.isNumeric ? (
                                  <span className="font-medium">
                                    {typeof valor === 'number' ? valor.toLocaleString('pt-BR') : valor}
                                  </span>
                                ) : (
                                  <span className="truncate max-w-xs block" title={String(valor)}>
                                    {String(valor)}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                          <td className="p-3">
                            <div className="flex items-center justify-end gap-2">
                              {componenteVisualizacao && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => abrirVisualizacao(item)}
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                              )}
                              {componenteEdicao && (
                                <Button
                                  size="sm"
                                  onClick={() => abrirEdicao(item)}
                                  disabled={!hasPermission(moduloPermissao, 'editar')}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Visualização em Grid */}
              {visualizacao === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dadosBuscadosEOrdenados.map((item) => (
                    <Card key={item.id} className="border-2 hover:border-blue-400 transition-all hover:shadow-lg">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={selectedIds.has(item.id)}
                            onChange={() => toggleItem(item.id)}
                          />
                        </div>
                        <div className="space-y-2">
                          {camposExibicao.slice(0, 3).map((campo) => {
                            const valor = item[campo];
                            if (!valor) return null;

                            return (
                              <div key={campo}>
                                <p className="text-xs text-slate-500 uppercase">{campo.replace(/_/g, ' ')}</p>
                                <p className="font-medium text-sm truncate" title={String(valor)}>
                                  {String(valor)}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                          {componenteVisualizacao && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => abrirVisualizacao(item)}
                              className="flex-1"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Ver
                            </Button>
                          )}
                          {componenteEdicao && (
                            <Button
                              size="sm"
                              onClick={() => abrirEdicao(item)}
                              className="flex-1"
                              disabled={!hasPermission(moduloPermissao, 'editar')}
                            >
                              <Edit2 className="w-3 h-3 mr-1" />
                              Editar
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Visualização em Lista */}
              {visualizacao === 'list' && (
                <div className="space-y-2">
                  {dadosBuscadosEOrdenados.map((item) => (
                    <Card key={item.id} className="border hover:border-blue-400 transition-all">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <input
                            type="checkbox"
                            className="mr-3 h-4 w-4"
                            checked={selectedIds.has(item.id)}
                            onChange={() => toggleItem(item.id)}
                          />
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                            {camposExibicao.slice(0, 4).map((campo) => {
                              const valor = item[campo];
                              if (!valor) return null;

                              return (
                                <div key={campo}>
                                  <p className="text-xs text-slate-500">{campo.replace(/_/g, ' ')}</p>
                                  <p className="font-medium text-sm truncate" title={String(valor)}>
                                    {String(valor)}
                                  </p>
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleExpandir(item.id)}
                            >
                              {expandidos[item.id] ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                            {componenteVisualizacao && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => abrirVisualizacao(item)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            {componenteEdicao && (
                              <Button
                                size="sm"
                                onClick={() => abrirEdicao(item)}
                                disabled={!hasPermission(moduloPermissao, 'editar')}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Detalhes Expandidos */}
                        {expandidos[item.id] && (
                          <div className="mt-3 pt-3 border-t grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.entries(item)
                              .filter(([key]) => !['id', 'created_date', 'updated_date', 'created_by'].includes(key))
                              .map(([key, value]) => (
                                <div key={key}>
                                  <p className="text-xs text-slate-500">{key.replace(/_/g, ' ')}</p>
                                  <p className="text-sm font-medium">
                                    {value ? String(value).substring(0, 100) : '-'}
                                  </p>
                                </div>
                              ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {/* V21.0 - Controles de Paginação */}
          {!isLoading && !isLoadingCount && totalItemsCount > 0 && (
            <PaginationControls
              currentPage={currentPage}
              totalItems={totalItemsCount}
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => {
                setCurrentPage(page);
                setSelectedIds(new Set());
              }}
              onItemsPerPageChange={(items) => {
                setItemsPerPage(items);
                setCurrentPage(1);
                setSelectedIds(new Set());
              }}
              isLoading={isFetching}
            />
          )}
        </CardContent>
      </Card>
    </Wrapper>
  );
}