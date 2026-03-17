import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ERPDataTable from '@/components/ui/erp/DataTable';
import SearchInputIsolado from '@/components/ui/SearchInputIsolado';
import {
  Search, Eye, Edit2, Trash2, Download, RefreshCw,
  Grid3x3, List, ArrowUpDown, Plus, Table as TableIcon, AlertCircle
} from 'lucide-react';
import { useWindow } from '@/components/lib/useWindow';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import usePermissions from '@/components/lib/usePermissions';
import { useToast } from "@/components/ui/use-toast";
import ProtectedAction from "@/components/ProtectedAction";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Configurações por entidade ───────────────────────────────────────────────

const OPCOES_ORDENACAO = {
  Cliente: [
    { value: 'nome_asc', label: 'Nome (A-Z)' },
    { value: 'nome_desc', label: 'Nome (Z-A)' },
    { value: 'cidade_asc', label: 'Cidade (A-Z)' },
    { value: 'mais_compras', label: 'Que Mais Compra' },
    { value: 'recent', label: 'Mais Recentes' }
  ],
  Fornecedor: [
    { value: 'nome_asc', label: 'Nome (A-Z)' },
    { value: 'nome_desc', label: 'Nome (Z-A)' },
    { value: 'razao_social_asc', label: 'Razão Social (A-Z)' },
    { value: 'recent', label: 'Mais Recentes' }
  ],
  Transportadora: [
    { value: 'razao_social_asc', label: 'Razão Social (A-Z)' },
    { value: 'razao_social_desc', label: 'Razão Social (Z-A)' },
    { value: 'recent', label: 'Mais Recentes' }
  ],
  Produto: [
    { value: 'descricao_asc', label: 'Descrição (A-Z)' },
    { value: 'descricao_desc', label: 'Descrição (Z-A)' },
    { value: 'codigo_asc', label: 'Código ↑' },
    { value: 'estoque_asc', label: 'Estoque (Menor→Maior)' },
    { value: 'estoque_desc', label: 'Estoque (Maior→Menor)' },
    { value: 'preco_asc', label: 'Preço ↑' },
    { value: 'preco_desc', label: 'Preço ↓' },
    { value: 'recent', label: 'Mais Recentes' }
  ],
  Colaborador: [
    { value: 'nome_asc', label: 'Nome (A-Z)' },
    { value: 'nome_desc', label: 'Nome (Z-A)' },
    { value: 'cargo_asc', label: 'Cargo (A-Z)' },
    { value: 'recent', label: 'Mais Recentes' }
  ],
  default: [{ value: 'recent', label: 'Mais Recentes' }]
};

// Mapa de valor de ordenação → { field, direction }
const ORDENACAO_MAP = {
  recent: { f: 'updated_date', d: 'desc' },
  nome_asc: { f: 'nome', d: 'asc' }, nome_desc: { f: 'nome', d: 'desc' },
  razao_social_asc: { f: 'razao_social', d: 'asc' }, razao_social_desc: { f: 'razao_social', d: 'desc' },
  descricao_asc: { f: 'descricao', d: 'asc' }, descricao_desc: { f: 'descricao', d: 'desc' },
  codigo_asc: { f: 'codigo', d: 'asc' }, codigo_desc: { f: 'codigo', d: 'desc' },
  cargo_asc: { f: 'cargo', d: 'asc' },
  cidade_asc: { f: 'endereco_principal.cidade', d: 'asc' },
  mais_compras: { f: 'valor_compras_12meses', d: 'desc' },
  estoque_asc: { f: 'estoque_atual', d: 'asc' }, estoque_desc: { f: 'estoque_atual', d: 'desc' },
  preco_asc: { f: 'preco_venda', d: 'asc' }, preco_desc: { f: 'preco_venda', d: 'desc' },
};

const ENTITY_DEFAULTS = {
  Produto: { f: 'descricao', d: 'asc' }, Cliente: { f: 'nome', d: 'asc' },
  Fornecedor: { f: 'nome', d: 'asc' }, Transportadora: { f: 'razao_social', d: 'asc' },
  Colaborador: { f: 'nome_completo', d: 'asc' }, CentroCusto: { f: 'codigo', d: 'asc' },
  PlanoDeContas: { f: 'codigo', d: 'asc' },
};

const COLUNAS_TABELA = {
  Produto: [
    { campo: 'codigo', label: 'Código', isNumeric: false },
    { campo: 'descricao', label: 'Descrição' },
    { campo: 'tipo_item', label: 'Tipo' },
    { campo: 'setor_atividade_nome', label: 'Setor' },
    { campo: 'grupo_produto_nome', label: 'Grupo' },
    { campo: 'marca_nome', label: 'Marca' },
    { campo: 'status', label: 'Status' },
    { campo: 'estoque_atual', label: 'Estoque', isNumeric: true },
    { campo: 'preco_venda', label: 'Preço (R$)', isNumeric: true }
  ],
  Cliente: [
    { campo: 'nome', label: 'Nome' },
    { campo: 'cpf', label: 'CPF/CNPJ' },
    { campo: 'tipo', label: 'Tipo' },
    { campo: 'status', label: 'Status' }
  ],
  Fornecedor: [
    { campo: 'nome', label: 'Nome' },
    { campo: 'razao_social', label: 'Razão Social' },
    { campo: 'cnpj', label: 'CNPJ' },
    { campo: 'categoria', label: 'Categoria' },
    { campo: 'status', label: 'Status' }
  ],
  Transportadora: [
    { campo: 'razao_social', label: 'Razão Social' },
    { campo: 'nome_fantasia', label: 'Nome Fantasia' },
    { campo: 'cnpj', label: 'CNPJ' },
    { campo: 'status', label: 'Status' }
  ],
  Colaborador: [
    { campo: 'nome_completo', label: 'Nome' },
    { campo: 'cpf', label: 'CPF' },
    { campo: 'cargo', label: 'Cargo' },
    { campo: 'departamento', label: 'Departamento' },
    { campo: 'status', label: 'Status' }
  ],
  Representante: [
    { campo: 'nome', label: 'Nome' },
    { campo: 'tipo_representante', label: 'Tipo' },
    { campo: 'percentual_comissao', label: '% Comissão', isNumeric: true }
  ],
  ContatoB2B: [
    { campo: 'nome', label: 'Nome' },
    { campo: 'empresa', label: 'Empresa' },
    { campo: 'cargo', label: 'Cargo' },
    { campo: 'email', label: 'E-mail' }
  ],
  Marca: [{ campo: 'nome_marca', label: 'Marca' }, { campo: 'pais_origem', label: 'País' }],
  GrupoProduto: [{ campo: 'nome_grupo', label: 'Grupo' }, { campo: 'codigo', label: 'Código' }],
  SetorAtividade: [{ campo: 'nome', label: 'Nome' }, { campo: 'tipo_operacao', label: 'Tipo' }],
  UnidadeMedida: [{ campo: 'sigla', label: 'Sigla' }, { campo: 'descricao', label: 'Descrição' }],
  SegmentoCliente: [{ campo: 'nome_segmento', label: 'Segmento' }, { campo: 'descricao', label: 'Descrição' }],
  RegiaoAtendimento: [{ campo: 'nome_regiao', label: 'Região' }, { campo: 'tipo_regiao', label: 'Tipo' }],
  Banco: [{ campo: 'codigo', label: 'Código' }, { campo: 'descricao', label: 'Nome' }, { campo: 'status', label: 'Status' }],
  FormaPagamento: [{ campo: 'descricao', label: 'Descrição' }, { campo: 'codigo', label: 'Código' }, { campo: 'status', label: 'Status' }],
  Departamento: [{ campo: 'nome', label: 'Nome' }, { campo: 'sigla', label: 'Sigla' }, { campo: 'status', label: 'Status' }],
  Cargo: [{ campo: 'nome', label: 'Cargo' }, { campo: 'nivel', label: 'Nível' }, { campo: 'status', label: 'Status' }],
  Turno: [{ campo: 'nome', label: 'Turno' }, { campo: 'hora_inicio', label: 'Início' }, { campo: 'hora_fim', label: 'Fim' }],
  CentroCusto: [{ campo: 'codigo', label: 'Código' }, { campo: 'descricao', label: 'Descrição' }, { campo: 'tipo', label: 'Tipo' }, { campo: 'status', label: 'Status' }],
  default: [
    { campo: '_nome', label: 'Nome' },
    { campo: '_descricao', label: 'Descrição' }
  ]
};

const CAMPOS_BUSCA = {
  Produto: ['descricao', 'codigo', 'codigo_barras', 'grupo_produto_nome', 'marca_nome', 'setor_atividade_nome'],
  Cliente: ['nome', 'razao_social', 'nome_fantasia', 'cpf', 'cnpj'],
  Fornecedor: ['nome', 'razao_social', 'cnpj', 'categoria'],
  Colaborador: ['nome_completo', 'cpf', 'email', 'cargo', 'departamento'],
  Transportadora: ['razao_social', 'nome_fantasia', 'cnpj'],
  Representante: ['nome', 'tipo_representante', 'email'],
  ContatoB2B: ['nome', 'empresa', 'cargo', 'email'],
  Marca: ['nome_marca'], GrupoProduto: ['nome_grupo', 'codigo'],
  SetorAtividade: ['nome', 'tipo_operacao'],
  UnidadeMedida: ['sigla', 'descricao'],
  SegmentoCliente: ['nome_segmento'], RegiaoAtendimento: ['nome_regiao'],
  Banco: ['codigo', 'descricao'], FormaPagamento: ['descricao', 'codigo'],
  Departamento: ['nome', 'sigla'], Cargo: ['nome'], Turno: ['nome'],
  CentroCusto: ['codigo', 'descricao'],
  default: ['nome', 'descricao', 'codigo', 'razao_social']
};

const ENTITY_CONTEXT_FIELD = {
  Fornecedor: 'empresa_dona_id', Transportadora: 'empresa_dona_id', Colaborador: 'empresa_alocada_id'
};

// ─── Status badge visual ──────────────────────────────────────────────────────

const getStatusClass = (status) => {
  if (!status) return 'bg-slate-100 text-slate-600 border-slate-200';
  const s = String(status).toLowerCase();
  if (s.includes('bloque') || s.includes('deslig') || s.includes('inat') || s.includes('descontinu') || s.includes('crítico')) return 'bg-red-100 text-red-700 border-red-200';
  if (s.includes('prospect') || s.includes('pend') || s.includes('fer') || s.includes('afast') || s.includes('análise')) return 'bg-amber-100 text-amber-700 border-amber-200';
  if (s.includes('ativo') || s.includes('ok') || s.includes('aprovado') || s.includes('entregue')) return 'bg-green-100 text-green-700 border-green-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
};

// ─── Hook de dados backend ────────────────────────────────────────────────────

function useEntityData({ nomeEntidade, filtro, sortField, sortDirection, limit, skip, enabled }) {
  return useQuery({
    queryKey: ['vue', nomeEntidade, JSON.stringify(filtro), sortField, sortDirection, limit, skip],
    queryFn: async () => {
      const res = await base44.functions.invoke('entityListSorted', {
        entityName: nomeEntidade,
        filter: filtro,
        sortField,
        sortDirection,
        limit,
        skip,
      });
      return Array.isArray(res?.data) ? res.data : [];
    },
    enabled: !!enabled,
    staleTime: 60_000,
    gcTime: 300_000,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
    retryDelay: (i) => Math.min(800 * 2 ** i, 5000),
  });
}

function useEntityCount({ nomeEntidade, filtro, enabled }) {
  return useQuery({
    queryKey: ['vue-count', nomeEntidade, JSON.stringify(filtro)],
    queryFn: async () => {
      const res = await base44.functions.invoke('countEntities', {
        entities: [{ entityName: nomeEntidade, filter: filtro }]
      });
      return Number(res?.data?.counts?.[nomeEntidade] ?? 0);
    },
    enabled: !!enabled,
    staleTime: 90_000,
    gcTime: 300_000,
    placeholderData: (prev) => prev ?? 0,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

// ─── Monta filtro multiempresa ────────────────────────────────────────────────

function buildFilter({ nomeEntidade, empresaAtual, grupoAtual, empresasDoGrupo, busca, columnFilters }) {
  const campoEmpresa = ENTITY_CONTEXT_FIELD[nomeEntidade] || 'empresa_id';
  const empresaId = empresaAtual?.id;
  const groupId = grupoAtual?.id;

  const SHARED = new Set(['Cliente', 'Fornecedor', 'Transportadora']);
  const orConds = [];

  if (empresaId) {
    if (nomeEntidade === 'Cliente') {
      orConds.push({ empresa_id: empresaId }, { empresa_dona_id: empresaId });
    } else {
      orConds.push({ [campoEmpresa]: empresaId });
    }
    orConds.push({ empresas_compartilhadas_ids: { $in: [empresaId] } });
  }
  if (groupId) {
    orConds.push({ group_id: groupId });
    if (!empresaId && Array.isArray(empresasDoGrupo) && empresasDoGrupo.length) {
      const ids = empresasDoGrupo.map(e => e.id).filter(Boolean);
      if (ids.length) {
        if (nomeEntidade === 'Cliente') {
          orConds.push({ empresa_id: { $in: ids } }, { empresa_dona_id: { $in: ids } });
        } else {
          orConds.push({ [campoEmpresa]: { $in: ids } });
        }
        if (SHARED.has(nomeEntidade)) {
          orConds.push({ empresas_compartilhadas_ids: { $in: ids } });
        }
      }
    }
  }

  let filtroBase = orConds.length ? { $or: orConds } : {};

  // busca de texto
  if (busca && busca.trim()) {
    const campos = CAMPOS_BUSCA[nomeEntidade] || CAMPOS_BUSCA.default;
    const term = busca.trim();
    const orBusca = campos.map(c => ({ [c]: { $regex: term, $options: 'i' } }));
    filtroBase = { ...filtroBase, $and: [{ $or: orBusca }] };
  }

  // filtros de colunas
  const filtrosColunas = Object.entries(columnFilters || {})
    .filter(([, v]) => String(v || '').trim())
    .map(([k, v]) => ({ [k]: { $regex: String(v).trim(), $options: 'i' } }));
  if (filtrosColunas.length) {
    filtroBase.$and = [...(filtroBase.$and || []), ...filtrosColunas];
  }

  return filtroBase;
}

// ─── Componente principal ─────────────────────────────────────────────────────

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
  const [buscaDebounced, setBuscaDebounced] = useState('');
  const [visualizacao, setVisualizacao] = useState('table');
  const [ordenacao, setOrdenacao] = useState('recent');
  const [sortField, setSortField] = useState(() => {
    const d = ENTITY_DEFAULTS[nomeEntidade];
    return d?.f || 'updated_date';
  });
  const [sortDirection, setSortDirection] = useState(() => {
    const d = ENTITY_DEFAULTS[nomeEntidade];
    return d?.d || 'desc';
  });
  const [columnFilters, setColumnFilters] = useState({});
  const [hiddenCols, setHiddenCols] = useState(new Set());
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [iaFiltroAtivo, setIaFiltroAtivo] = useState(false);
  const [expandidos, setExpandidos] = useState({});

  const { openWindow, closeWindow } = useWindow();
  const { empresaAtual, grupoAtual, empresasDoGrupo, createInContext, updateInContext, deleteInContext } = useContextoVisual();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const lastInvalidateRef = useRef(0);

  // Debounce busca: 350ms
  useEffect(() => {
    const h = setTimeout(() => { setBuscaDebounced(busca); setCurrentPage(1); }, 350);
    return () => clearTimeout(h);
  }, [busca]);

  // Reset página ao mudar filtros
  useEffect(() => { setCurrentPage(1); }, [nomeEntidade, empresaAtual?.id, grupoAtual?.id, sortField, sortDirection, itemsPerPage]);

  const moduloPermissao = useMemo(() => {
    if (['Produto', 'UnidadeMedida', 'LocalEstoque', 'GrupoProduto', 'Marca'].includes(nomeEntidade)) return 'Estoque';
    return 'Cadastros';
  }, [nomeEntidade]);

  const opcoesOrdenacao = OPCOES_ORDENACAO[nomeEntidade] || OPCOES_ORDENACAO.default;

  // Colunas: usa camposPrincipais se fornecidos, senão configs predefinidas
  const colunas = useMemo(() => {
    if (Array.isArray(camposPrincipais) && camposPrincipais.length > 0) {
      return camposPrincipais.map(c => ({
        campo: c,
        label: c.replace(/_/g, ' ').replace(/\b\w/g, m => m.toUpperCase())
      }));
    }
    return COLUNAS_TABELA[nomeEntidade] || COLUNAS_TABELA.default;
  }, [nomeEntidade, camposPrincipais]);

  const filtro = useMemo(() => buildFilter({
    nomeEntidade, empresaAtual, grupoAtual, empresasDoGrupo,
    busca: buscaDebounced, columnFilters
  }), [nomeEntidade, empresaAtual?.id, grupoAtual?.id, JSON.stringify(empresasDoGrupo?.map(e => e.id)), buscaDebounced, JSON.stringify(columnFilters)]);

  const hasScope = !!(empresaAtual?.id || grupoAtual?.id);
  const skip = (currentPage - 1) * itemsPerPage;

  const { data: dados = [], isLoading, isFetching, refetch, error } = useEntityData({
    nomeEntidade, filtro, sortField, sortDirection,
    limit: itemsPerPage, skip, enabled: hasScope
  });

  const { data: totalCount = 0 } = useEntityCount({
    nomeEntidade, filtro, enabled: hasScope
  });

  // Filtros de IA (lado cliente, leve)
  const dadosFiltrados = useMemo(() => {
    let result = Array.isArray(dados) ? [...dados] : [];
    if (filtroAdicional && typeof filtroAdicional === 'function') result = result.filter(filtroAdicional);
    if (iaFiltroAtivo && nomeEntidade === 'Cliente') result = result.filter(c => (c?.condicao_comercial?.limite_credito_utilizado || 0) > (c?.condicao_comercial?.limite_credito || 0));
    if (iaFiltroAtivo && nomeEntidade === 'Produto') result = result.filter(p => (p?.estoque_atual ?? 0) < (p?.estoque_minimo ?? 0));
    return result;
  }, [dados, filtroAdicional, iaFiltroAtivo, nomeEntidade]);

  const allSelected = dadosFiltrados.length > 0 && selectedIds.size === dadosFiltrados.length;

  const iaCreditoCount = useMemo(() => nomeEntidade !== 'Cliente' ? 0 : dados.filter(c => (c?.condicao_comercial?.limite_credito_utilizado || 0) > (c?.condicao_comercial?.limite_credito || 0)).length, [dados, nomeEntidade]);
  const estoqueCount = useMemo(() => nomeEntidade !== 'Produto' ? 0 : dados.filter(p => (p?.estoque_atual ?? 0) < (p?.estoque_minimo ?? 0)).length, [dados, nomeEntidade]);

  // Invalidação de queries
  const override = legacyQueryKey ?? queryKeyOverride;
  const queryKey = Array.isArray(override) ? override : [override || nomeEntidade.toLowerCase()];

  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['vue', nomeEntidade] });
    await queryClient.invalidateQueries({ queryKey: ['vue-count', nomeEntidade] });
    await queryClient.invalidateQueries({ queryKey });
  }, [queryClient, nomeEntidade, queryKey]);

  // Realtime subscribe
  useEffect(() => {
    if (!base44.entities?.[nomeEntidade]?.subscribe) return;
    const unsub = base44.entities[nomeEntidade].subscribe((evt) => {
      if (!autoRefresh) return;
      const now = Date.now();
      if (now - lastInvalidateRef.current < 1000) return;
      lastInvalidateRef.current = now;
      setTimeout(() => invalidate(), 80);
    });
    return () => { if (typeof unsub === 'function') unsub(); };
  }, [nomeEntidade, autoRefresh, invalidate]);

  // Handlers ordenação
  const aplicarOrdenacao = useCallback((val) => {
    const m = ORDENACAO_MAP[val] || { f: 'updated_date', d: 'desc' };
    setOrdenacao(val);
    setSortField(m.f);
    setSortDirection(m.d);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((field, direction) => {
    setSortField(field);
    setSortDirection(direction);
    setOrdenacao('');
    setCurrentPage(1);
  }, []);

  // Seleção
  const toggleSelectAll = useCallback(() => {
    const ns = allSelected ? new Set() : new Set(dadosFiltrados.map(i => i.id));
    setSelectedIds(ns);
    if (typeof onSelectionChange === 'function') onSelectionChange(ns);
  }, [allSelected, dadosFiltrados, onSelectionChange]);

  const toggleItem = useCallback((id) => {
    setSelectedIds(prev => {
      const ns = new Set(prev);
      ns.has(id) ? ns.delete(id) : ns.add(id);
      if (typeof onSelectionChange === 'function') onSelectionChange(ns);
      return ns;
    });
  }, [onSelectionChange]);

  const campoEmpresa = ENTITY_CONTEXT_FIELD[nomeEntidade] || 'empresa_id';

  // CRUD
  const excluirIds = async (ids) => {
    if (!ids?.length) return;
    try {
      await Promise.all(ids.map(id => deleteInContext(nomeEntidade, id)));
      setSelectedIds(new Set());
      toast({ title: `✅ ${ids.length} registro(s) excluído(s)!` });
      await invalidate();
    } catch (err) {
      toast({ title: '❌ Erro ao excluir', description: err.message, variant: 'destructive' });
    }
  };

  const abrirEdicao = useCallback((item) => {
    if (!componenteEdicao) return;
    let winId;
    const closeSelf = () => closeWindow(winId);
    const handleSubmit = async (formData) => {
      try {
        if (formData._action === 'delete') {
          await deleteInContext(nomeEntidade, formData.id);
          toast({ title: `✅ Excluído!` });
        } else if (formData.id) {
          await updateInContext(nomeEntidade, formData.id, formData, campoEmpresa);
          toast({ title: `✅ Atualizado!` });
        } else {
          await createInContext(nomeEntidade, formData, campoEmpresa);
          toast({ title: `✅ Criado!` });
        }
        await invalidate();
        closeSelf();
      } catch (err) {
        toast({ title: '❌ Erro', description: err.message, variant: 'destructive' });
      }
    };
    const props = {
      [nomeEntidade.toLowerCase()]: item,
      produto: item, cliente: item, fornecedor: item,
      windowMode: true, closeWindow: closeSelf,
      onSubmit: handleSubmit,
      onSuccess: async () => { await invalidate(); closeSelf(); }
    };
    winId = openWindow(componenteEdicao, props, {
      title: item ? `✏️ Editar ${tituloDisplay}` : `✨ Novo ${tituloDisplay}`,
      width: 1000, height: 700,
      onClose: invalidate,
      uniqueKey: `edit-${nomeEntidade}-${item?.id || 'new'}`
    });
  }, [componenteEdicao, nomeEntidade, tituloDisplay, campoEmpresa, createInContext, updateInContext, deleteInContext, invalidate, openWindow, closeWindow, toast]);

  const abrirVisualizacao = useCallback((item) => {
    if (!componenteVisualizacao) return;
    let winId;
    const closeSelf = () => closeWindow(winId);
    winId = openWindow(componenteVisualizacao,
      { [nomeEntidade.toLowerCase()]: item, id: item.id, closeWindow: closeSelf },
      { title: `👁️ ${tituloDisplay}`, width: 900, height: 600, uniqueKey: `view-${nomeEntidade}-${item.id}` }
    );
  }, [componenteVisualizacao, nomeEntidade, tituloDisplay, openWindow, closeWindow]);

  // Exportar CSV
  const exportar = () => {
    const cols = colunas.map(c => c.campo);
    const rows = selectedIds.size > 0 ? dadosFiltrados.filter(i => selectedIds.has(i.id)) : dadosFiltrados;
    const csv = [cols.join(','), ...rows.map(r => cols.map(c => JSON.stringify(r[c] ?? '')).join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `${nomeEntidade}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Colunas para ERPDataTable
  const tabelaColunas = useMemo(() => colunas.map(c => ({
    key: c.campo,
    label: c.label,
    isNumeric: c.isNumeric,
    render: c.campo === 'status' || c.campo.endsWith('_status')
      ? (row) => {
          const val = row[c.campo];
          return val ? <Badge variant="outline" className={`text-xs ${getStatusClass(val)}`}>{val}</Badge> : null;
        }
      : undefined
  })), [colunas]);

  // Dados para tabela: mapeia campos virtuais (_nome, _descricao) para generics
  const tabelaDados = useMemo(() => dadosFiltrados.map(item => {
    const row = { id: item.id };
    colunas.forEach(c => {
      if (c.campo === '_nome') row[c.campo] = item.nome || item.nome_completo || item.razao_social || item.nome_fantasia || item.descricao || item.titulo || '';
      else if (c.campo === '_descricao') row[c.campo] = item.descricao || item.observacoes || item.cargo || '';
      else row[c.campo] = item[c.campo] ?? '';
    });
    return row;
  }), [dadosFiltrados, colunas]);

  const camposCard = colunas.slice(0, 4).map(c => c.campo);

  const Wrapper = ({ children }) => windowMode
    ? <div className="w-full h-full flex flex-col overflow-hidden">{children}</div>
    : <>{children}</>;

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  return (
    <Wrapper>
      <Card className={`${windowMode ? 'h-full flex flex-col' : ''} rounded-sm shadow-md`}>
        {/* ─── Header ─────────────────────────────────────────────────────── */}
        <CardHeader className="sticky top-0 z-10 border-b bg-gradient-to-r from-blue-50 to-purple-50 backdrop-blur supports-[backdrop-filter]:bg-white/70 pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3 min-w-0">
              {Icone && <div className="p-2 rounded-sm bg-blue-100"><Icone className="w-5 h-5 text-blue-700" /></div>}
              <div>
                <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                  {tituloDisplay}
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">⚡ RT</Badge>
                  {nomeEntidade === 'Cliente' && iaCreditoCount > 0 && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs cursor-pointer" onClick={() => setIaFiltroAtivo(v => !v)}>
                      Limite estourado: {iaCreditoCount}
                    </Badge>
                  )}
                  {nomeEntidade === 'Produto' && estoqueCount > 0 && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs cursor-pointer" onClick={() => setIaFiltroAtivo(v => !v)}>
                      Estoque crítico: {estoqueCount}
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isFetching && !isLoading ? 'Atualizando…' : `${dadosFiltrados.length} de ${totalCount} registros`}
                  {totalPages > 1 && ` • Pág. ${currentPage}/${totalPages}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-xs text-slate-500">Auto</span>
                <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              </div>
              <ProtectedAction module={moduloPermissao} action="criar" mode="disable">
                <Button size="sm" onClick={() => abrirEdicao(null)} className="bg-blue-600 hover:bg-blue-700 rounded-sm">
                  <Plus className="w-4 h-4 mr-1" /> Novo
                </Button>
              </ProtectedAction>
              <Button variant="outline" size="sm" className="rounded-sm" onClick={() => refetch()} disabled={isFetching}>
                <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              </Button>
              <ProtectedAction module={moduloPermissao} action="exportar" mode="disable">
                <Button variant="outline" size="sm" className="rounded-sm" onClick={exportar} disabled={dadosFiltrados.length === 0}>
                  <Download className="w-4 h-4" />
                </Button>
              </ProtectedAction>
              <ProtectedAction module={moduloPermissao} action="excluir" mode="disable">
                <Button variant="outline" size="sm" className="rounded-sm border-red-300 text-red-600 hover:bg-red-50" onClick={() => excluirIds(Array.from(selectedIds))} disabled={selectedIds.size === 0}>
                  <Trash2 className="w-4 h-4 mr-1" /> {selectedIds.size > 0 ? selectedIds.size : ''}
                </Button>
              </ProtectedAction>
            </div>
          </div>

          {/* Barra de busca e controles */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-3">
            <SearchInputIsolado
              value={busca} onChange={setBusca}
              placeholder="🔍 Busca universal rápida…"
              className="flex-1"
              debounceMs={350}
            />
            <Select value={ordenacao || 'recent'} onValueChange={aplicarOrdenacao}>
              <SelectTrigger className="w-full sm:w-52 rounded-sm text-sm">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <SelectValue placeholder="Ordenar…" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {opcoesOrdenacao.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1 border rounded-sm p-1 bg-white">
              {[['table', TableIcon], ['grid', Grid3x3], ['list', List]].map(([v, Icon]) => (
                <Button key={v} variant={visualizacao === v ? 'default' : 'ghost'} size="sm" className="h-7 w-7 p-0 rounded-sm" onClick={() => setVisualizacao(v)}>
                  <Icon className="w-3.5 h-3.5" />
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        {/* ─── Conteúdo ────────────────────────────────────────────────────── */}
        <CardContent className={`p-4 ${windowMode ? 'flex-1 overflow-y-auto' : ''}`}>
          {!hasScope && (
            <div className="mb-3 rounded-sm border border-amber-300 bg-amber-50 px-3 py-2 text-amber-800 text-sm">
              Selecione uma empresa ou grupo para carregar os registros.
            </div>
          )}

          {error && (
            <div className="text-center py-10">
              <AlertCircle className="w-10 h-10 mx-auto text-red-400 mb-2" />
              <p className="text-slate-600 mb-3">Erro ao carregar</p>
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente
              </Button>
            </div>
          )}

          {!error && (
            <>
              {/* ── Tabela ── */}
              {visualizacao === 'table' && (
                <div className="overflow-x-auto w-full">
                  <ERPDataTable
                    columns={tabelaColunas}
                    data={tabelaDados}
                    entityName={nomeEntidade}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSortChange={handleSortChange}
                    onToggleSelectAll={toggleSelectAll}
                    onToggleItem={toggleItem}
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
                    totalItems={totalCount}
                    onPageChange={(p) => { setCurrentPage(p); setSelectedIds(new Set()); }}
                    onPageSizeChange={(n) => { setItemsPerPage(n); setCurrentPage(1); setSelectedIds(new Set()); }}
                    isLoading={isLoading}
                    autoPersistSort={false}
                    showBulkBar
                    onBulkDeleteSelected={(ids) => excluirIds(ids)}
                    onBulkExportSelected={() => exportar()}
                    rowActionsRender={(row) => (
                      <div className="inline-flex items-center gap-1">
                        {componenteVisualizacao && (
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-sm hover:bg-blue-50" onClick={() => abrirVisualizacao(dadosFiltrados.find(i => i.id === row.id))}>
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                          </Button>
                        )}
                        {componenteEdicao && (
                          <ProtectedAction module={moduloPermissao} action="editar" mode="disable">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-sm hover:bg-slate-100" onClick={() => abrirEdicao(dadosFiltrados.find(i => i.id === row.id))}>
                              <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                            </Button>
                          </ProtectedAction>
                        )}
                      </div>
                    )}
                    rowContextMenuItems={(row) => {
                      const item = dadosFiltrados.find(i => i.id === row.id);
                      const items = [];
                      if (componenteVisualizacao) items.push({ key: 'ver', label: 'Ver detalhes', action: () => abrirVisualizacao(item) });
                      if (componenteEdicao) items.push({ key: 'editar', label: 'Editar', action: () => abrirEdicao(item) });
                      if (hasPermission(moduloPermissao, 'Cadastro', 'excluir')) items.push({ key: 'del', label: 'Excluir', action: () => excluirIds([row.id]) });
                      return items;
                    }}
                  />
                </div>
              )}

              {/* ── Grid ── */}
              {visualizacao === 'grid' && (
                <div>
                  {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="rounded-sm"><CardContent className="p-4 space-y-2">
                          <Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" />
                        </CardContent></Card>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {dadosFiltrados.map(item => (
                      <Card key={item.id} className={`rounded-sm border transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 cursor-pointer ${selectedIds.has(item.id) ? 'border-blue-400 ring-1 ring-blue-300' : 'hover:border-blue-300'}`}
                        onClick={() => toggleItem(item.id)}>
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <input type="checkbox" className="h-4 w-4 mt-0.5 rounded" checked={selectedIds.has(item.id)} onChange={() => toggleItem(item.id)} onClick={e => e.stopPropagation()} />
                            {item.status && <Badge variant="outline" className={`text-xs ${getStatusClass(item.status)}`}>{item.status}</Badge>}
                          </div>
                          <div className="space-y-1.5">
                            {camposCard.slice(0, 3).map(campo => {
                              const val = item[campo];
                              if (!val) return null;
                              return (
                                <div key={campo}>
                                  <p className="text-xs text-slate-400 uppercase tracking-wide">{campo.replace(/_/g, ' ')}</p>
                                  <p className="text-sm font-medium text-slate-800 truncate">{String(val)}</p>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex gap-2 mt-3 pt-2.5 border-t" onClick={e => e.stopPropagation()}>
                            {componenteVisualizacao && (
                              <Button size="sm" variant="outline" className="flex-1 rounded-sm text-xs h-7" onClick={() => abrirVisualizacao(item)}>
                                <Eye className="w-3 h-3 mr-1" /> Ver
                              </Button>
                            )}
                            {componenteEdicao && (
                              <Button size="sm" className="flex-1 rounded-sm text-xs h-7 bg-blue-600 hover:bg-blue-700" onClick={() => abrirEdicao(item)}>
                                <Edit2 className="w-3 h-3 mr-1" /> Editar
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Paginação no grid */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 text-sm">
                      <span className="text-slate-500">Pág. {currentPage}/{totalPages} • {totalCount} total</span>
                      <div className="flex items-center gap-2">
                        <select className="h-8 border rounded-sm px-2 text-sm" value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                          {[20, 50, 100].map(n => <option key={n} value={n}>{n}/pág</option>)}
                        </select>
                        <Button size="sm" variant="outline" className="rounded-sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>Ant.</Button>
                        <Button size="sm" variant="outline" className="rounded-sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>Próx.</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── List ── */}
              {visualizacao === 'list' && (
                <div>
                  {isLoading && (
                    <div className="space-y-2 mb-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-12 border rounded-sm flex items-center px-4 gap-3">
                          <Skeleton className="h-4 w-4 rounded" />
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-4 w-24 ml-auto" />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-1.5">
                    {dadosFiltrados.map(item => (
                      <Card key={item.id} className={`rounded-sm border transition-all duration-150 hover:shadow-sm ${selectedIds.has(item.id) ? 'border-blue-400 bg-blue-50/30' : 'hover:border-slate-300'}`}>
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <input type="checkbox" className="h-4 w-4 rounded flex-shrink-0" checked={selectedIds.has(item.id)} onChange={() => toggleItem(item.id)} />
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 min-w-0">
                              {camposCard.slice(0, 4).map(campo => {
                                const val = item[campo];
                                if (!val) return null;
                                return (
                                  <div key={campo} className="min-w-0">
                                    <p className="text-xs text-slate-400">{campo.replace(/_/g, ' ')}</p>
                                    <p className="text-sm font-medium truncate">{String(val)}</p>
                                  </div>
                                );
                              })}
                            </div>
                            {item.status && <Badge variant="outline" className={`text-xs flex-shrink-0 ${getStatusClass(item.status)}`}>{item.status}</Badge>}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {componenteVisualizacao && (
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-sm" onClick={() => abrirVisualizacao(item)}>
                                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                                </Button>
                              )}
                              {componenteEdicao && (
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-sm" onClick={() => abrirEdicao(item)}>
                                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-sm" onClick={() => setExpandidos(p => ({ ...p, [item.id]: !p[item.id] }))}>
                                <Search className="w-3.5 h-3.5 text-slate-400" />
                              </Button>
                            </div>
                          </div>
                          {expandidos[item.id] && (
                            <div className="mt-2 pt-2 border-t grid grid-cols-2 md:grid-cols-3 gap-2">
                              {Object.entries(item).filter(([k]) => !['id', 'created_date', 'updated_date', 'created_by'].includes(k)).map(([k, v]) => (
                                <div key={k}>
                                  <p className="text-xs text-slate-400">{k.replace(/_/g, ' ')}</p>
                                  <p className="text-xs font-medium">{v ? String(v).substring(0, 80) : '-'}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Paginação no list */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 text-sm">
                      <span className="text-slate-500">Pág. {currentPage}/{totalPages} • {totalCount} total</span>
                      <div className="flex items-center gap-2">
                        <select className="h-8 border rounded-sm px-2 text-sm" value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                          {[20, 50, 100].map(n => <option key={n} value={n}>{n}/pág</option>)}
                        </select>
                        <Button size="sm" variant="outline" className="rounded-sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>Ant.</Button>
                        <Button size="sm" variant="outline" className="rounded-sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>Próx.</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Empty state */}
              {!isLoading && hasScope && dadosFiltrados.length === 0 && totalCount === 0 && (
                <div className="text-center py-12 space-y-3">
                  <Search className="w-12 h-12 mx-auto text-slate-200" />
                  <p className="text-slate-500 font-medium">
                    {buscaDebounced ? `Sem resultados para "${buscaDebounced}"` : 'Nenhum registro cadastrado'}
                  </p>
                  {!buscaDebounced && componenteEdicao && (
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-sm" onClick={() => abrirEdicao(null)}>
                      <Plus className="w-4 h-4 mr-1" /> Criar primeiro registro
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Wrapper>
  );
}