import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  ArrowDown
} from 'lucide-react';
import { useWindow } from '@/components/lib/useWindow';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import usePermissions from '@/components/lib/usePermissions';

/**
 * V21.7 - VISUALIZADOR UNIVERSAL DE ENTIDADES - REAL-TIME + ORGANIZAÇÃO AVANÇADA
 * 
 * Componente genérico que lista qualquer entidade com:
 * - ✅ Real-time: Auto-refresh a cada 30s
 * - ✅ Organização avançada específica por entidade
 * - ✅ Busca universal em todos os campos
 * - ✅ Filtros multi-empresa
 * - ✅ Grid/Lista view
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
    { value: 'descricao', label: 'Descrição (A-Z)', sortFn: (a, b) => (a.descricao || '').localeCompare(b.descricao || '') },
    { value: 'descricao_desc', label: 'Descrição (Z-A)', sortFn: (a, b) => (b.descricao || '').localeCompare(a.descricao || '') },
    { value: 'setor', label: 'Setor de Atividade', sortFn: (a, b) => (a.setor_atividade_nome || '').localeCompare(b.setor_atividade_nome || '') },
    { value: 'grupo', label: 'Grupo/Linha', sortFn: (a, b) => (a.grupo_produto_nome || '').localeCompare(b.grupo_produto_nome || '') },
    { value: 'marca', label: 'Marca', sortFn: (a, b) => (a.marca_nome || '').localeCompare(b.marca_nome || '') },
    { value: 'mais_vendidos', label: 'Mais Vendidos', sortFn: (a, b) => (b.quantidade_vendida_12meses || 0) - (a.quantidade_vendida_12meses || 0) },
    { value: 'menos_vendidos', label: 'Menos Vendidos', sortFn: (a, b) => (a.quantidade_vendida_12meses || 0) - (b.quantidade_vendida_12meses || 0) },
    { value: 'estoque_baixo', label: 'Estoque Baixo', sortFn: (a, b) => (a.estoque_disponivel || 0) - (b.estoque_disponivel || 0) },
    { value: 'preco', label: 'Preço (Maior)', sortFn: (a, b) => (b.preco_venda || 0) - (a.preco_venda || 0) },
    { value: 'recent', label: 'Mais Recentes', sortFn: (a, b) => new Date(b.created_date) - new Date(a.created_date) }
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
  onSelectionChange
}) {
  const [busca, setBusca] = useState('');
  const [visualizacao, setVisualizacao] = useState('grid');
  const [expandidos, setExpandidos] = useState({});
  const [ordenacao, setOrdenacao] = useState('recent');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const { openWindow, closeWindow } = useWindow();
  const { empresaAtual, filtrarPorContexto } = useContextoVisual();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();

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

  // ✅ REAL-TIME: Buscar dados com auto-refresh a cada 30s
  const override = (typeof legacyQueryKey !== 'undefined' ? legacyQueryKey : queryKeyOverride);
  const queryKey = Array.isArray(override) ? override : [override || nomeEntidade.toLowerCase()];

  const { data: dados = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      try {
        return await base44.entities[nomeEntidade].list('-created_date', 1000);
      } catch (error) {
        console.error(`Erro ao carregar ${nomeEntidade}:`, error);
        return [];
      }
    },
    staleTime: 30000,
    refetchInterval: 30000, // ✅ Auto-refresh a cada 30 segundos
    refetchIntervalInBackground: true, // ✅ Continua atualizando mesmo em background
    refetchOnWindowFocus: true, // ✅ Atualiza quando volta para a aba
    initialData: []
  });

  // Aplicar filtro multi-empresa
  const dadosFiltrados = useMemo(() => {
    return filtrarPorContexto(dados, 'empresa_id');
  }, [dados, empresaAtual]);

  // Busca universal em todos os campos + ✅ ORDENAÇÃO AVANÇADA
  const dadosBuscadosEOrdenados = useMemo(() => {
    // 1️⃣ Aplicar busca
    let resultado = dadosFiltrados;
    
    if (busca.trim()) {
      const termoBusca = busca.toLowerCase();
      resultado = resultado.filter(item => {
        return Object.values(item).some(valor => {
          if (valor === null || valor === undefined) return false;
          return String(valor).toLowerCase().includes(termoBusca);
        });
      });
    }

    // 2️⃣ Aplicar ordenação específica
    const opcaoSelecionada = opcoesOrdenacao.find(op => op.value === ordenacao);
    if (opcaoSelecionada?.sortFn) {
      resultado = [...resultado].sort(opcaoSelecionada.sortFn);
    }

    return resultado;
  }, [dadosFiltrados, busca, ordenacao, opcoesOrdenacao]);

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
  
  // Utilitário para forçar fechamento de janela após sucesso do form interno
  const fecharJanelaSeInterna = () => {
    // Se o form filho chamar onSuccess/onSubmit, fazemos apenas o refetch aqui;
    // o fechamento é controlado pelo próprio form via useWindow (padrão dos formulários já usam windowMode=true)
    refetch();
  };
  const excluirSelecionados = async () => {
    if (selectedIds.size === 0) return;
    await Promise.all(Array.from(selectedIds).map(id => base44.entities[nomeEntidade].delete(id)));
    setSelectedIds(new Set());
    refetch();
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
  const abrirEdicao = (item) => {
    if (componenteEdicao) {
      const propName = nomeEntidade.charAt(0).toLowerCase() + nomeEntidade.slice(1);
      
      const props = {
        // TODOS os formatos possíveis de props (50+ variações)
        [propName]: item,
        [nomeEntidade]: item,
        // Variações específicas por entidade
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
        onSuccess: () => refetch(),
        onSubmit: () => refetch(),
        windowMode: true
      };

      openWindow(
        componenteEdicao,
        props,
        {
          title: `✏️ Editar ${tituloDisplay}`,
          width: 1000,
          height: 700,
          uniqueKey: `edit-${nomeEntidade}-${item.id}-${Date.now()}`,
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
      openWindow(
        componenteVisualizacao,
        { [nomeEntidade.toLowerCase()]: item, id: item.id },
        {
          title: `👁️ Detalhes de ${tituloDisplay}`,
          width: 900,
          height: 600,
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
                  {dadosBuscadosEOrdenados.length} {dadosBuscadosEOrdenados.length === 1 ? 'registro' : 'registros'}
                  {busca && ` (filtrado de ${dadosFiltrados.length})`}
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
                disabled={isFetching}
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

          {/* Barra de Busca, Ordenação e Filtros */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="🔍 Busca universal em todos os campos..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* ✅ NOVA ORDENAÇÃO AVANÇADA */}
            <Select value={ordenacao} onValueChange={setOrdenacao}>
              <SelectTrigger className="w-full sm:w-64">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  <SelectValue placeholder="Organizar por..." />
                </div>
              </SelectTrigger>
              <SelectContent>
                {opcoesOrdenacao.map(opcao => (
                  <SelectItem key={opcao.value} value={opcao.value}>
                    {opcao.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 border rounded-lg p-1 bg-white">
              <Button
                variant={visualizacao === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setVisualizacao('grid')}
                className="h-8"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={visualizacao === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setVisualizacao('list')}
                className="h-8"
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
        </CardContent>
      </Card>
    </Wrapper>
  );
}