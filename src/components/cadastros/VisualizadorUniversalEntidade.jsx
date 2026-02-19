import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PaginationControls from '@/components/ui/PaginationControls';
import ERPDataTable from '@/components/ui/erp/DataTable';
import SearchInputIsolado from '@/components/ui/SearchInputIsolado';
import { 
  Search, 
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
import ProtectedAction from "@/components/ProtectedAction";

const OPCOES_ORDENACAO = {
  Cliente: [
    { value: 'nome', label: 'Nome (A-Z)' },
    { value: 'nome_desc', label: 'Nome (Z-A)' },
    { value: 'cidade', label: 'Cidade (A-Z)' },
    { value: 'limite_credito', label: 'Limite de Crédito (Maior)' },
    { value: 'mais_compras', label: 'Que Mais Compra' },
    { value: 'recent', label: 'Mais Recentes' }
  ],
  Fornecedor: [
    { value: 'nome', label: 'Nome (A-Z)' },
    { value: 'nome_desc', label: 'Nome (Z-A)' },
    { value: 'razao_social', label: 'Razão Social (A-Z)' },
    { value: 'razao_social_desc', label: 'Razão Social (Z-A)' },
    { value: 'recent', label: 'Mais Recentes' }
  ],
  Transportadora: [
    { value: 'razao_social', label: 'Razão Social (A-Z)' },
    { value: 'razao_social_desc', label: 'Razão Social (Z-A)' },
    { value: 'nome_fantasia', label: 'Nome Fantasia (A-Z)' },
    { value: 'nome_fantasia_desc', label: 'Nome Fantasia (Z-A)' },
    { value: 'recent', label: 'Mais Recentes' }
  ],
  Produto: [
    { value: 'descricao', label: 'Descrição (A-Z)' },
    { value: 'descricao_desc', label: 'Descrição (Z-A)' },
    { value: 'codigo', label: 'Código (Crescente)' },
    { value: 'codigo_desc', label: 'Código (Decrescente)' },
    { value: 'recent', label: 'Mais Recentes' }
  ],
  Colaborador: [
    { value: 'nome_completo', label: 'Nome (A-Z)' },
    { value: 'nome_completo_desc', label: 'Nome (Z-A)' },
    { value: 'cargo', label: 'Cargo' },
    { value: 'departamento', label: 'Departamento' },
    { value: 'recent', label: 'Mais Recentes' }
  ],
  Representante: [
    { value: 'nome', label: 'Nome (A-Z)' },
    { value: 'nome_desc', label: 'Nome (Z-A)' },
    { value: 'percentual_comissao', label: '% Comissão (Maior)' },
    { value: 'recent', label: 'Mais Recentes' }
  ],
  ContatoB2B: [
    { value: 'nome', label: 'Nome (A-Z)' },
    { value: 'empresa', label: 'Empresa (A-Z)' },
    { value: 'recent', label: 'Mais Recentes' }
  ],
  Marca: [
    { value: 'nome_marca', label: 'Marca (A-Z)' },
    { value: 'nome_marca_desc', label: 'Marca (Z-A)' },
    { value: 'recent', label: 'Mais Recentes' }
  ],
  GrupoProduto: [
    { value: 'nome_grupo', label: 'Grupo (A-Z)' },
    { value: 'nome_grupo_desc', label: 'Grupo (Z-A)' },
    { value: 'codigo', label: 'Código (Crescente)' },
    { value: 'codigo_desc', label: 'Código (Decrescente)' },
    { value: 'recent', label: 'Mais Recentes' }
  ],
  SetorAtividade: [
    { value: 'nome', label: 'Nome (A-Z)' },
    { value: 'nome_desc', label: 'Nome (Z-A)' },
    { value: 'tipo_operacao', label: 'Tipo' },
    { value: 'recent', label: 'Mais Recentes' }
  ],
  UnidadeMedida: [
    { value: 'sigla', label: 'Sigla (A-Z)' },
    { value: 'sigla_desc', label: 'Sigla (Z-A)' },
    { value: 'recent', label: 'Mais Recentes' }
  ],
  SegmentoCliente: [
    { value: 'nome_segmento', label: 'Segmento (A-Z)' },
    { value: 'nome_segmento_desc', label: 'Segmento (Z-A)' },
    { value: 'recent', label: 'Mais Recentes' }
  ],
  RegiaoAtendimento: [
    { value: 'nome_regiao', label: 'Região (A-Z)' },
    { value: 'nome_regiao_desc', label: 'Região (Z-A)' },
    { value: 'recent', label: 'Mais Recentes' }
  ],
  default: [
    { value: 'recent', label: 'Mais Recentes' }
  ]
};

const COLUNAS_ORDENACAO = {
  Produto: [
    { campo: 'codigo', label: 'Código', getValue: (item) => item.codigo || '', isNumeric: true },
    { campo: 'descricao', label: 'Descrição', getValue: (item) => item.descricao || '' },
    { campo: 'tipo_item', label: 'Tipo', getValue: (item) => item.tipo_item || '' },
    { campo: 'setor_atividade_nome', label: 'Setor', getValue: (item) => item.setor_atividade_nome || '' },
    { campo: 'grupo_produto_nome', label: 'Categoria', getValue: (item) => item.grupo_produto_nome || '' },
    { campo: 'marca_nome', label: 'Marca', getValue: (item) => item.marca_nome || '' },
    { campo: 'status', label: 'Status', getValue: (item) => item.status || '' },
    { campo: 'estoque_atual', label: 'Estoque', getValue: (item) => item.estoque_atual ?? 0, isNumeric: true },
    { campo: 'preco_venda', label: 'Preço', getValue: (item) => item.preco_venda ?? 0, isNumeric: true }
  ],
  Cliente: [
    { campo: 'nome', label: 'Nome', getValue: (item) => item.nome || '' },
    { campo: 'tipo', label: 'Tipo', getValue: (item) => item.tipo || '' },
    { campo: 'status', label: 'Status', getValue: (item) => item.status || '' }
  ],
  Fornecedor: [
    { campo: 'nome', label: 'Nome', getValue: (item) => item.nome || '' },
    { campo: 'razao_social', label: 'Razão Social', getValue: (item) => item.razao_social || '' },
    { campo: 'cnpj', label: 'CNPJ', getValue: (item) => item.cnpj || '' },
    { campo: 'categoria', label: 'Categoria', getValue: (item) => item.categoria || '' },
    { campo: 'status', label: 'Status', getValue: (item) => item.status || '' }
  ],
  Transportadora: [
    { campo: 'razao_social', label: 'Razão Social', getValue: (item) => item.razao_social || '' },
    { campo: 'nome_fantasia', label: 'Nome Fantasia', getValue: (item) => item.nome_fantasia || '' },
    { campo: 'cnpj', label: 'CNPJ', getValue: (item) => item.cnpj || '' },
    { campo: 'status', label: 'Status', getValue: (item) => item.status || '' }
  ],
  Colaborador: [
    { campo: 'nome_completo', label: 'Nome', getValue: (item) => item.nome_completo || '' },
    { campo: 'cargo', label: 'Cargo', getValue: (item) => item.cargo || '' },
    { campo: 'departamento', label: 'Departamento', getValue: (item) => item.departamento || '' },
    { campo: 'status', label: 'Status', getValue: (item) => item.status || '' }
  ],
  Representante: [
    { campo: 'nome', label: 'Nome', getValue: (item) => item.nome || '' },
    { campo: 'tipo_representante', label: 'Tipo', getValue: (item) => item.tipo_representante || '' },
    { campo: 'percentual_comissao', label: '% Comissão', getValue: (item) => item.percentual_comissao ?? 0, isNumeric: true }
  ],
  ContatoB2B: [
    { campo: 'nome', label: 'Nome', getValue: (item) => item.nome || '' },
    { campo: 'empresa', label: 'Empresa', getValue: (item) => item.empresa || '' },
    { campo: 'cargo', label: 'Cargo', getValue: (item) => item.cargo || '' },
    { campo: 'email', label: 'E-mail', getValue: (item) => item.email || '' },
    { campo: 'telefone', label: 'Telefone', getValue: (item) => item.telefone || '' }
  ],
  Marca: [
    { campo: 'nome_marca', label: 'Marca', getValue: (item) => item.nome_marca || '' },
    { campo: 'pais_origem', label: 'País', getValue: (item) => item.pais_origem || '' }
  ],
  GrupoProduto: [
    { campo: 'nome_grupo', label: 'Grupo', getValue: (item) => item.nome_grupo || '' },
    { campo: 'codigo', label: 'Código', getValue: (item) => item.codigo || '' },
    { campo: 'descricao', label: 'Descrição', getValue: (item) => item.descricao || '' }
  ],
  SetorAtividade: [
    { campo: 'nome', label: 'Nome', getValue: (item) => item.nome || '' },
    { campo: 'tipo_operacao', label: 'Tipo', getValue: (item) => item.tipo_operacao || '' },
    { campo: 'descricao', label: 'Descrição', getValue: (item) => item.descricao || '' }
  ],
  UnidadeMedida: [
    { campo: 'sigla', label: 'Sigla', getValue: (item) => item.sigla || '' },
    { campo: 'descricao', label: 'Descrição', getValue: (item) => item.descricao || '' }
  ],
  SegmentoCliente: [
    { campo: 'nome_segmento', label: 'Segmento', getValue: (item) => item.nome_segmento || '' },
    { campo: 'descricao', label: 'Descrição', getValue: (item) => item.descricao || '' }
  ],
  RegiaoAtendimento: [
    { campo: 'nome_regiao', label: 'Região', getValue: (item) => item.nome_regiao || '' },
    { campo: 'tipo_regiao', label: 'Tipo', getValue: (item) => item.tipo_regiao || '' }
  ],
  default: [
    { campo: 'nome_generico', label: 'Nome', getValue: (item) => item.nome || item.nome_completo || item.razao_social || item.nome_fantasia || item.titulo || item.descricao || '' },
    { campo: 'descricao_generica', label: 'Descrição', getValue: (item) => item.descricao || item.observacoes || item.observacao || item.cargo || item.departamento || '' }
  ]
};

const ALIAS_QUERY_KEYS = {
  Produto: ['produtos'],
  Cliente: ['clientes'],
  Fornecedor: ['fornecedores']
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
  const [buscaLocal, setBuscaLocal] = useState('');
  const [buscaBackend, setBuscaBackend] = useState('');
  const [visualizacao, setVisualizacao] = useState('table');
  const [expandidos, setExpandidos] = useState({});
  const [ordenacao, setOrdenacao] = useState('recent');
  const [colunaOrdenacao, setColunaOrdenacao] = useState(null);
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState('asc');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [columnFilters, setColumnFilters] = useState({});
  const [hiddenCols, setHiddenCols] = useState(new Set());
  
  const { openWindow, closeWindow } = useWindow();
  const { empresaAtual } = useContextoVisual();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const moduloPermissao = React.useMemo(() => {
    const estoque = ['Produto','UnidadeMedida','LocalEstoque','GrupoProduto','Marca'];
    if (estoque.includes(nomeEntidade)) return 'Estoque';
    return 'Cadastros';
  }, [nomeEntidade, columnFilters]);

  const opcoesOrdenacao = OPCOES_ORDENACAO[nomeEntidade] || OPCOES_ORDENACAO.default;
  let colunasOrdenacao = COLUNAS_ORDENACAO[nomeEntidade] || COLUNAS_ORDENACAO.default;
  if (Array.isArray(camposPrincipais) && camposPrincipais.length > 0) {
    colunasOrdenacao = camposPrincipais.map((c) => ({
      campo: c,
      label: c.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()),
      getValue: (item) => item?.[c] ?? ''
    }));
  }

  const override = (typeof legacyQueryKey !== 'undefined' ? legacyQueryKey : queryKeyOverride);
  const queryKey = Array.isArray(override) ? override : [override || nomeEntidade.toLowerCase()];

  const { getFiltroContexto, createInContext, updateInContext, deleteInContext } = useContextoVisual();

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setBuscaBackend(buscaLocal);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [buscaLocal, columnFilters]);

  useEffect(() => {
    const saved = localStorage.getItem(`ord_${nomeEntidade}_${empresaAtual?.id || 'all'}`);
    if (saved) {
      try {
        const s = JSON.parse(saved);
        if (s.field) setSortField(s.field);
        if (s.direction) setSortDirection(s.direction);
      } catch {}
    }
  }, [nomeEntidade, empresaAtual?.id, columnFilters]);

  useEffect(() => {
    if (sortField) {
      localStorage.setItem(
        `ord_${nomeEntidade}_${empresaAtual?.id || 'all'}`,
        JSON.stringify({ field: sortField, direction: sortDirection })
      );
    }
  }, [sortField, sortDirection, nomeEntidade, empresaAtual?.id, columnFilters]);

  const getDefaultSortForEntity = useCallback(() => {
    if (colunaOrdenacao) {
      // Quando usuário clica no cabeçalho, mantemos ordenação 100% no cliente
      return undefined;
    }

    // Padrões por entidade (case-insensitive no backend via entityListSorted)
    const entityDefaults = {
      Produto: { field: 'descricao', direction: 'asc' },
      Cliente: { field: 'nome', direction: 'asc' },
      Fornecedor: { field: 'nome', direction: 'asc' },
      Pedido: { field: 'data_pedido', direction: 'desc' },
      ContaPagar: { field: 'data_vencimento', direction: 'asc' },
      ContaReceber: { field: 'data_vencimento', direction: 'asc' },
      OrdemCompra: { field: 'data_solicitacao', direction: 'desc' },
      User: { field: 'full_name', direction: 'asc' },
      CentroCusto: { field: 'codigo', direction: 'asc' },
      PlanoDeContas: { field: 'codigo', direction: 'asc' },
      PlanoContas: { field: 'codigo', direction: 'asc' }
    };

    return entityDefaults[nomeEntidade] || { field: 'updated_date', direction: 'desc' };
  }, [nomeEntidade, colunaOrdenacao]);

  const buildFilterWithSearch = useCallback(() => {
    const ENTITY_CONTEXT_FIELD = {
      Fornecedor: 'empresa_dona_id',
      Transportadora: 'empresa_dona_id',
      Colaborador: 'empresa_alocada_id',
    };
    const campoEmpresa = ENTITY_CONTEXT_FIELD[nomeEntidade] || 'empresa_id';
    const fc = getFiltroContexto(campoEmpresa, true) || {};

    // Ajuste especial para Cliente em contexto de empresa: considerar dono/compartilhado
    let filtroBase = { ...fc };
    if (nomeEntidade === 'Cliente' && (fc?.empresa_id || fc?.group_id)) {
      const empresaId = fc.empresa_id;
      const groupId = fc.group_id;
      const rest = { ...fc };
      if ('empresa_id' in rest) delete rest.empresa_id;
      if ('group_id' in rest) delete rest.group_id;
      const orConds = [];
      if (empresaId) {
        orConds.push(
          { empresa_id: empresaId },
          { empresa_dona_id: empresaId },
          { empresas_compartilhadas_ids: { $in: [empresaId] } }
        );
      }
      if (groupId) {
        orConds.push({ group_id: groupId });
      }
      filtroBase = { ...rest, ...(orConds.length ? { $or: orConds } : {}) };
    }
    
    if (!buscaBackend.trim()) {
      return filtroBase;
    }

    const termoBusca = buscaBackend.trim();
    const buscaFiltros = [];
    
    const camposBusca = {
      'Produto': ['descricao', 'codigo', 'codigo_barras', 'grupo_produto_nome', 'marca_nome', 'setor_atividade_nome'],
      'Cliente': ['nome', 'razao_social', 'nome_fantasia', 'cpf', 'cnpj', 'email'],
      'Fornecedor': ['nome', 'razao_social', 'cnpj', 'categoria', 'email'],
      'Colaborador': ['nome_completo', 'cpf', 'email', 'cargo', 'departamento'],
      'Transportadora': ['razao_social', 'nome_fantasia', 'cnpj'],
      'Representante': ['nome', 'tipo_representante', 'email', 'telefone'],
      'ContatoB2B': ['nome', 'empresa', 'cargo', 'email', 'telefone'],
      'Marca': ['nome_marca', 'pais_origem'],
      'GrupoProduto': ['nome_grupo', 'codigo', 'descricao'],
      'SetorAtividade': ['nome', 'tipo_operacao', 'descricao'],
      'UnidadeMedida': ['sigla', 'descricao'],
      'SegmentoCliente': ['nome_segmento', 'descricao'],
      'RegiaoAtendimento': ['nome_regiao', 'tipo_regiao', 'estados_abrangidos']
    };

    const campos = camposBusca[nomeEntidade] || ['nome', 'descricao', 'codigo'];
    
    campos.forEach(campo => {
      buscaFiltros.push({ [campo]: { $regex: termoBusca, $options: 'i' } });
    });

    const filtrosColunas = Object.entries(columnFilters || {}).filter(([, v]) => String(v || '').trim() !== '').map(([campo, val]) => ({ [campo]: { $regex: String(val).trim(), $options: 'i' } }));
    const combinado = { ...filtroBase };
    const and = [];
    if (buscaFiltros.length) and.push({ $or: buscaFiltros });
    if (filtrosColunas.length) and.push(...filtrosColunas);
    if (and.length) combinado.$and = and;
    return combinado;
  }, [getFiltroContexto, buscaBackend, nomeEntidade, columnFilters]);

  const { data: dados = [], isLoading, isFetching, refetch, error } = useQuery({
    queryKey: [...queryKey, empresaAtual?.id, buscaBackend, currentPage, itemsPerPage, sortField, sortDirection, JSON.stringify(columnFilters)],
    queryFn: async () => {
      const filtroBase = buildFilterWithSearch();
      // Ajuste especial Clientes: se só houver empresa_id, considerar dono/compartilhado
      const filtro = filtroBase;

      const skip = (currentPage - 1) * itemsPerPage;
      const def = getDefaultSortForEntity();
      const sf = sortField || def.field;
      const sd = sortDirection || def.direction;
      const resp = await base44.functions.invoke('entityListSorted', {
        entityName: nomeEntidade,
        filter: filtro,
        sortField: sf,
        sortDirection: sd,
        limit: itemsPerPage,
        skip
      });
      return resp.data || [];
    },
    enabled: !!empresaAtual?.id || !!getFiltroContexto('group_id', true)?.group_id,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchInterval: false
  });

  const { data: totalItemsCount = 0 } = useQuery({
    queryKey: [...queryKey, 'total-count', empresaAtual?.id, buscaBackend],
    queryFn: async () => {
      const filtro = buildFilterWithSearch();
      try {
        const response = await base44.functions.invoke('countEntities', {
          entityName: nomeEntidade,
          filter: filtro
        });
        return response.data?.count || 0;
      } catch (err) {
        // Fallback específico Cliente: considerar empresa_dona/compartilhado
        if (nomeEntidade === 'Cliente' && filtro?.empresa_id) {
          const empresaId = filtro.empresa_id; const rest = { ...filtro }; delete rest.empresa_id;
          try {
            const alt = await base44.functions.invoke('countEntities', { entityName: nomeEntidade, filter: { ...rest, $or: [ { empresa_id: empresaId }, { empresa_dona_id: empresaId }, { empresas_compartilhadas_ids: { $in: [empresaId] } } ] } });
            return alt.data?.count || 0;
          } catch (_) { return 0; }
        }
        return 0;
      }
    },
    enabled: !!empresaAtual?.id || !!getFiltroContexto('group_id', true)?.group_id,
    staleTime: Infinity,
    refetchOnWindowFocus: false
  });

  const aliasKeys = ALIAS_QUERY_KEYS[nomeEntidade] || [];
  
  const invalidateAllRelated = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey }),
      queryClient.invalidateQueries({ queryKey: [...queryKey, 'total-count'] }),
      ...aliasKeys.map((k) => queryClient.invalidateQueries({ queryKey: [k] }))
    , columnFilters]);
  }, [queryClient, queryKey, aliasKeys, columnFilters]);

  React.useEffect(() => {
    const unsubscribe = base44.entities[nomeEntidade].subscribe(() => {
      invalidateAllRelated();
    });
    return unsubscribe;
  }, [nomeEntidade, invalidateAllRelated, columnFilters]);

  const dadosBuscadosEOrdenados = useMemo(() => {
    let resultado = [...dados];

    // Ordenação local quando usuário clica no cabeçalho
    if (false && colunaOrdenacao && Array.isArray(resultado)) {
      const meta = (COLUNAS_ORDENACAO[nomeEntidade] || COLUNAS_ORDENACAO.default).find(c => c.campo === colunaOrdenacao);
      if (meta) {
        const getVal = (item) => (meta.getValue ? meta.getValue(item) : item[colunaOrdenacao, columnFilters]);
        const toNum = (v, campo) => {
          if (v == null || v === '') return Number.POSITIVE_INFINITY;
          if (typeof v === 'number') return v;
          const s = String(v);
          if (campo === 'codigo') {
            const digits = s.replace(/\D/g, '');
            return digits ? Number(digits) : Number.POSITIVE_INFINITY;
          }
          const m = s.match(/\d+(?:[\.,]\d+)?/);
          if (m) {
            return Number(m[0].replace(',', '.'));
          }
          const n = Number(s);
          return Number.isNaN(n) ? Number.POSITIVE_INFINITY : n;
        };
        const collator = new Intl.Collator('pt-BR', { numeric: true, sensitivity: 'base' });
        resultado.sort((a,b) => {
          const avRaw = getVal(a);
          const bvRaw = getVal(b);
          let comp;
          if (meta.isNumeric) {
            const an = toNum(avRaw, meta.campo);
            const bn = toNum(bvRaw, meta.campo);
            if (!Number.isFinite(an) || !Number.isFinite(bn)) {
              const as = (avRaw ?? '').toString();
              const bs = (bvRaw ?? '').toString();
              comp = collator.compare(as, bs);
            } else {
              comp = an - bn;
            }
          } else {
            const as = (avRaw ?? '').toString();
            const bs = (bvRaw ?? '').toString();
            comp = collator.compare(as, bs);
          }
          return direcaoOrdenacao === 'desc' ? -comp : comp;
        });
      }
    }
    
    if (filtroAdicional && typeof filtroAdicional === 'function') {
      resultado = resultado.filter(filtroAdicional);
    }
    
    return resultado;
  }, [dados, filtroAdicional, colunaOrdenacao, direcaoOrdenacao, nomeEntidade, columnFilters]);

  const allSelected = dadosBuscadosEOrdenados.length > 0 && selectedIds.size === dadosBuscadosEOrdenados.length;
  
  const toggleSelectAll = useCallback(() => {
    const ns = allSelected ? new Set() : new Set(dadosBuscadosEOrdenados.map(i => i.id));
    setSelectedIds(ns);
    if (typeof onSelectionChange === 'function') onSelectionChange(ns);
  }, [allSelected, dadosBuscadosEOrdenados, onSelectionChange, columnFilters]);

  const toggleItem = useCallback((id) => {
    setSelectedIds(prev => {
      const ns = new Set(prev);
      if (ns.has(id)) ns.delete(id); else ns.add(id);
      if (typeof onSelectionChange === 'function') onSelectionChange(ns);
      return ns;
    });
  }, [onSelectionChange, columnFilters]);
  
  const excluirSelecionados = async () => {
    if (selectedIds.size === 0) return;
    await Promise.all(Array.from(selectedIds).map(id => deleteInContext(nomeEntidade, id)));
    try { await base44.entities.AuditLog.create({ acao: 'Exclusão', modulo: moduloPermissao, entidade: nomeEntidade, descricao: `Exclusão em massa: ${selectedIds.size} registro(s)`, data_hora: new Date().toISOString() }); } catch {}
    setSelectedIds(new Set());
    await invalidateAllRelated();
  };

  const camposExibicao = camposPrincipais.length > 0 
    ? camposPrincipais 
    : Object.keys(dadosBuscadosEOrdenados[0] || {}).filter(k => 
        !['id', 'created_date', 'updated_date', 'created_by'].includes(k)
      ).slice(0, 6);

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
    URL.revokeObjectURL(url);
    try { base44.entities.AuditLog.create({ acao: 'Exportação', modulo: moduloPermissao, entidade: nomeEntidade, descricao: `Exportados ${dadosBuscadosEOrdenados.length} registro(s)`, data_hora: new Date().toISOString() }); } catch {}
  };

  const criarSugestoes = async () => {
    const campos = (Array.isArray(camposPrincipais) && camposPrincipais.length > 0)
      ? camposPrincipais
      : ['nome', 'descricao'];
    const baseNome = tituloDisplay || nomeEntidade;
    const exemplos = [1,2,3].map((i) => {
      const obj = {};
      campos.forEach((c) => {
        const lc = c.toLowerCase();
        if (lc.includes('nome')) obj[c] = `${baseNome} ${i}`;
        else if (lc.includes('descr')) obj[c] = `Sugestão automática (${i})`;
        else if (lc.includes('ativo')) obj[c] = true;
        else obj[c] = obj[c] ?? '';
      });
      return obj;
    });
    const ENTITY_CONTEXT_FIELD = { Fornecedor: 'empresa_dona_id', Transportadora: 'empresa_dona_id', Colaborador: 'empresa_alocada_id' };
    const campoEmpresa = ENTITY_CONTEXT_FIELD[nomeEntidade] || 'empresa_id';
    await Promise.all(exemplos.map((e) => createInContext(nomeEntidade, e, campoEmpresa)));
    await invalidateAllRelated();
  };

  const handleAbrirNovo = async () => {
    if (componenteEdicao) return abrirEdicao(null);
    // Se n e3o houver componente de edi e7 e3o, cria 3 sugest f5es quando a lista est e1 vazia
    if ((totalItemsCount || 0) === 0) {
      const exemplos = [1,2,3].map((i) => ({
        nome: `${tituloDisplay || nomeEntidade} ${i}`,
        descricao: `Cadastro sugerido automaticamente (${i})`,
        ativo: true
      }));
      await Promise.all(exemplos.map((e) => createInContext(nomeEntidade, e)));
      await invalidateAllRelated();
    }
  };

  const abrirEdicao = (item) => {
    if (componenteEdicao) {
      let winId;
      const closeSelf = () => closeWindow(winId);

      const handleSubmitForm = async (formData) => {
        try {
          if (formData._action === 'delete') {
            await deleteInContext(nomeEntidade, formData.id);
            toast({ title: `✅ ${nomeEntidade} excluído!` });
          } else if (formData.id) {
            const ENTITY_CONTEXT_FIELD = { Fornecedor: 'empresa_dona_id', Transportadora: 'empresa_dona_id', Colaborador: 'empresa_alocada_id' };
            const campoEmpresa = ENTITY_CONTEXT_FIELD[nomeEntidade] || 'empresa_id';
            await updateInContext(nomeEntidade, formData.id, formData, campoEmpresa);
            toast({ title: `✅ ${nomeEntidade} atualizado!` });
          } else {
            const ENTITY_CONTEXT_FIELD = { Fornecedor: 'empresa_dona_id', Transportadora: 'empresa_dona_id', Colaborador: 'empresa_alocada_id' };
            const campoEmpresa = ENTITY_CONTEXT_FIELD[nomeEntidade] || 'empresa_id';
            await createInContext(nomeEntidade, formData, campoEmpresa);
            toast({ title: `✅ ${nomeEntidade} criado!` });
          }
          await invalidateAllRelated();
          closeSelf();
        } catch(err) {
          toast({ title: `❌ Erro`, description: err.message, variant: "destructive" });
        }
      };

      const finalProps = {
        [nomeEntidade.toLowerCase()]: item,
        produto: item,
        cliente: item,
        fornecedor: item,
        windowMode: true,
        closeWindow: closeSelf,
        onSubmit: handleSubmitForm,
        onSuccess: async () => {
          await invalidateAllRelated();
          closeSelf();
        }
      };

      winId = openWindow(
        componenteEdicao,
        finalProps,
        {
          title: item ? `✏️ Editar ${tituloDisplay}`: `✨ Novo ${tituloDisplay}`,
          width: 1000,
          height: 700,
          onClose: invalidateAllRelated,
          uniqueKey: `edit-${nomeEntidade}-${item?.id || 'new'}`
        }
      );
    }
  };

  const abrirVisualizacao = (item) => {
    if (componenteVisualizacao) {
      let winId;
      const closeSelf = () => closeWindow(winId);
      winId = openWindow(
        componenteVisualizacao,
        { [nomeEntidade.toLowerCase()]: item, id: item.id, closeWindow: closeSelf },
        {
          title: `👁️ Detalhes de ${tituloDisplay}`,
          width: 900,
          height: 600,
          onClose: invalidateAllRelated,
          uniqueKey: `view-${nomeEntidade}-${item.id}`
        }
      );
    }
  };

  const toggleExpandir = (id) => {
    setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOrdenarPorColuna = (campo) => {
    setCurrentPage(1);
    if (colunaOrdenacao === campo) {
      setDirecaoOrdenacao(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setColunaOrdenacao(campo);
      setDirecaoOrdenacao('asc');
    }
    setOrdenacao('');
  };

  const Wrapper = ({ children }) => windowMode ? (
    <div className="w-full h-full flex flex-col overflow-hidden">{children}</div>
  ) : <>{children}</>;

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
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    ⚡ Real-Time
                  </Badge>
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  {dadosBuscadosEOrdenados.length} de {totalItemsCount} registros
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <ProtectedAction module={moduloPermissao} action="exportar" mode="disable">
                <Button variant="outline" size="sm" onClick={exportarDados} data-permission={`${moduloPermissao}.Relatorios.exportar`} data-sensitive>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </ProtectedAction>
              <ProtectedAction module={moduloPermissao} action="criar" mode="disable">
                <Button variant="primary" size="sm" onClick={handleAbrirNovo} data-permission={`${moduloPermissao}.Cadastro.criar`} data-sensitive>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo
                </Button>
              </ProtectedAction>
              <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                {allSelected ? 'Limpar' : 'Selecionar Todos'}
              </Button>
              <ProtectedAction module={moduloPermissao} action="excluir" mode="disable">
                <Button variant="outline" size="sm" onClick={excluirSelecionados} disabled={selectedIds.size === 0} className="border-red-300 text-red-700" data-permission={`${moduloPermissao}.Cadastro.excluir`} data-sensitive>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir ({selectedIds.size})
                </Button>
              </ProtectedAction>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
            <SearchInputIsolado
              value={buscaLocal}
              onChange={(val) => setBuscaLocal(val)}
              placeholder="🔍 Busca universal em todos os campos..."
              className="flex-1"
              debounceMs={500}
            />
            
            <Select value={ordenacao || 'recent'} onValueChange={(val) => {
              setCurrentPage(1);
              setOrdenacao(val);
              setColunaOrdenacao(null);
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

            <div className="flex items-center gap-1 border rounded-lg p-1 bg-white">
              <Button
                variant={visualizacao === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setVisualizacao('table')}
                className="h-8"
              >
                <TableIcon className="w-4 h-4" />
              </Button>
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

        <CardContent className={`p-6 ${windowMode ? 'flex-1 overflow-y-auto' : ''}`}>
          {(isLoading || (colunaOrdenacao && isFetching)) ? (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 mx-auto text-blue-600 animate-spin mb-3" />
              <p className="text-slate-600">Carregando...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-3" />
              <p className="text-slate-900 font-semibold mb-2">Erro ao carregar</p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          ) : dadosBuscadosEOrdenados.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Search className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-600 font-medium">
                {buscaBackend ? 'Nenhum resultado' : 'Nenhum registro'}
              </p>
              {!buscaBackend && (
                <Button size="sm" onClick={criarSugestoes} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-1" /> Criar 3 sugestões
                </Button>
              )}
            </div>
          ) : (
            <>
              {visualizacao === 'table' && (
                <ERPDataTable
                    columns={colunasOrdenacao.map(c => ({ key: c.campo, label: c.label, isNumeric: c.isNumeric }))}
                    data={dadosBuscadosEOrdenados.map(item => {
                      const row = { id: item.id };
                      colunasOrdenacao.forEach(c => { row[c.campo] = c.getValue ? c.getValue(item) : item[c.campo]; });
                      return row;
                    })}
                    entityName={nomeEntidade}
                    sortField={sortField || (getDefaultSortForEntity().field)}
                    sortDirection={sortDirection || (getDefaultSortForEntity().direction)}
                    onSortChange={(field, direction) => { setSortField(field); setSortDirection(direction); setCurrentPage(1); setOrdenacao(''); setColunaOrdenacao(null); }}
                    onToggleSelectAll={toggleSelectAll}
                    onToggleItem={(id) => toggleItem(id)}
                    allSelected={allSelected}
                    selectedIds={selectedIds}
                    enableColumnFilters
                    columnFilters={columnFilters}
                    onColumnFiltersChange={(next) => { setColumnFilters(next); setCurrentPage(1); }}
                    hiddenColumns={hiddenCols}
                    onHiddenColumnsChange={setHiddenCols}
                    footerTotals
                    page={currentPage}
                    pageSize={itemsPerPage}
                    totalItems={totalItemsCount}
                    onPageChange={(p) => { setCurrentPage(p); setSelectedIds(new Set()); }}
                    onPageSizeChange={(n) => { setItemsPerPage(n); setCurrentPage(1); setSelectedIds(new Set()); }}
                  />

              )}

              {visualizacao === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dadosBuscadosEOrdenados.map((item) => (
                    <Card key={item.id} className="border-2 hover:border-blue-400">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <input type="checkbox" className="h-4 w-4" checked={selectedIds.has(item.id)} onChange={() => toggleItem(item.id)} />
                        </div>
                        <div className="space-y-2">
                          {camposExibicao.slice(0, 3).map((campo) => {
                            const valor = item[campo];
                            if (!valor) return null;
                            return (
                              <div key={campo}>
                                <p className="text-xs text-slate-500 uppercase">{campo.replace(/_/g, ' ')}</p>
                                <p className="font-medium text-sm truncate">{String(valor)}</p>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                          {componenteVisualizacao && (
                            <Button size="sm" variant="outline" onClick={() => abrirVisualizacao(item)} className="flex-1">
                              <Eye className="w-3 h-3 mr-1" />
                              Ver
                            </Button>
                          )}
                          {componenteEdicao && (
                            <ProtectedAction module={moduloPermissao} action="editar" mode="disable">
                              <Button size="sm" onClick={() => abrirEdicao(item)} className="flex-1">
                                <Edit2 className="w-3 h-3 mr-1" />
                                Editar
                              </Button>
                            </ProtectedAction>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {visualizacao === 'list' && (
                <div className="space-y-2">
                  {dadosBuscadosEOrdenados.map((item) => (
                    <Card key={item.id} className="border hover:border-blue-400">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <input type="checkbox" className="mr-3 h-4 w-4" checked={selectedIds.has(item.id)} onChange={() => toggleItem(item.id)} />
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                            {camposExibicao.slice(0, 4).map((campo) => {
                              const valor = item[campo];
                              if (!valor) return null;
                              return (
                                <div key={campo}>
                                  <p className="text-xs text-slate-500">{campo.replace(/_/g, ' ')}</p>
                                  <p className="font-medium text-sm truncate">{String(valor)}</p>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button size="sm" variant="ghost" onClick={() => toggleExpandir(item.id)}>
                              {expandidos[item.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </Button>
                            {componenteVisualizacao && (
                              <Button size="sm" variant="outline" onClick={() => abrirVisualizacao(item)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            {componenteEdicao && (
                              <ProtectedAction module={moduloPermissao} action="editar" mode="disable">
                                <Button size="sm" onClick={() => abrirEdicao(item)}>
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              </ProtectedAction>
                            )}
                          </div>
                        </div>
                        {expandidos[item.id] && (
                          <div className="mt-3 pt-3 border-t grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.entries(item)
                              .filter(([key]) => !['id', 'created_date', 'updated_date', 'created_by'].includes(key))
                              .map(([key, value]) => (
                                <div key={key}>
                                  <p className="text-xs text-slate-500">{key.replace(/_/g, ' ')}</p>
                                  <p className="text-sm font-medium">{value ? String(value).substring(0, 100) : '-'}</p>
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

          {/* Paginação consolidada no ERPDataTable (padrão global) */}
        </CardContent>
      </Card>
    </Wrapper>
  );
}