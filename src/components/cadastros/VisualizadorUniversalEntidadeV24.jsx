/**
 * VisualizadorUniversalEntidadeV24 — V26 CORRIGIDO
 * FIXES:
 * ✅ Editar: formProps recalcula quando editItem muda (deps corretas)
 * ✅ Ordenação: queryKey e queryFn usam mesmo estado (sem ref stale)
 * ✅ Exclusão em massa cross-page: lógica robusta com deselectedIds
 * ✅ Contagem: usa v5 do hook
 * ✅ Formulário preenchido: fetchFullRecord via asServiceRole
 * ✅ Entidades simples: sem bloqueio por contexto
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import useEntityCounts, { buildContextFilter, SIMPLE_CATALOG } from "@/components/lib/useEntityCounts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronUp, ChevronDown, ChevronsUpDown,
  Search, Edit, Trash2, Plus, RefreshCw, AlertCircle, X
} from "lucide-react";

// ─── constantes de formatação ────────────────────────────────────────────────
const STATUS_COLORS = {
  Ativo:"bg-green-100 text-green-700", Ativa:"bg-green-100 text-green-700",
  Aprovado:"bg-green-100 text-green-700", OK:"bg-green-100 text-green-700",
  Pago:"bg-green-100 text-green-700", Recebido:"bg-green-100 text-green-700",
  "Em Análise":"bg-blue-100 text-blue-700",
  Pendente:"bg-yellow-100 text-yellow-700", Prospect:"bg-yellow-100 text-yellow-700",
  Alerta:"bg-yellow-100 text-yellow-700",
  Inativo:"bg-slate-100 text-slate-500", Inativa:"bg-slate-100 text-slate-500",
  Bloqueado:"bg-red-100 text-red-700", Cancelado:"bg-red-100 text-red-700",
  Atrasado:"bg-red-100 text-red-700", Descontinuado:"bg-orange-100 text-orange-700",
};
const STATUS_FIELDS = new Set(["status","status_fornecedor","status_cliente","situacao","situacao_credito","status_fiscal_receita","status_fornecedor"]);
const BOOL_FIELDS   = new Set(["ativo","ativa","habilitado","compartilhado_grupo","ativo_status"]);
const DATE_FIELDS   = new Set(["created_date","updated_date","data_admissao","data_nascimento","data_vencimento","data_validade","ultima_compra","data_emissao","data_pedido","cnh_validade","vigencia"]);
const MONEY_FIELDS  = new Set(["salario","preco_venda","custo_aquisicao","custo_medio","valor_frete","orcamento_mensal","limite_credito","valor_total","valor","valor_padrao","taxa_padrao","desconto_maximo"]);
const PAGE_SIZES    = [10, 20, 50, 100];

// Campos de busca por entidade
const SEARCH_FIELDS = {
  Banco:['nome','nome_banco','codigo_banco'],
  FormaPagamento:['nome','descricao','codigo'],
  Cliente:['nome','razao_social','cpf','cnpj'],
  Fornecedor:['nome','razao_social','cnpj'],
  Colaborador:['nome_completo','cpf','email'],
  Transportadora:['razao_social','nome_fantasia'],
  Produto:['descricao','codigo','codigo_barras'],
  Departamento:['nome','descricao'],
  Cargo:['nome','departamento'],
  Turno:['descricao','nome'],
  Veiculo:['placa','descricao','modelo'],
  Motorista:['nome','cpf'],
  Servico:['nome','descricao'],
  Representante:['nome','email'],
  SegmentoCliente:['nome_segmento','descricao'],
  RegiaoAtendimento:['nome_regiao','descricao'],
  GrupoProduto:['nome_grupo','descricao','codigo'],
  Marca:['nome_marca','descricao'],
  SetorAtividade:['nome','descricao'],
  TabelaPreco:['nome','descricao'],
  UnidadeMedida:['sigla','descricao'],
  CentroCusto:['codigo','descricao'],
  PlanoDeContas:['codigo','descricao'],
  TipoDespesa:['codigo','nome'],
  MoedaIndice:['moeda','indice'],
  GrupoEmpresarial:['nome','cnpj'],
  Empresa:['razao_social','nome_fantasia','cnpj'],
  ApiExterna:['nome','descricao'],
  ChatbotCanal:['nome'],
  ChatbotIntent:['nome','descricao'],
  GatewayPagamento:['nome'],
  JobAgendado:['nome'],
  Webhook:['nome','url'],
  ConfiguracaoNFe:['ambiente','descricao'],
  LocalEstoque:['descricao','codigo'],
  RotaPadrao:['nome_rota','regiao'],
  ModeloDocumento:['tipo','descricao'],
  TipoFrete:['descricao','modalidade'],
  CentroResultado:['codigo','descricao'],
  OperadorCaixa:['nome','matricula'],
  CondicaoComercial:['nome'],
  TabelaFiscal:['descricao','uf'],
  ContatoB2B:['nome','empresa','email'],
  KitProduto:['nome_kit','descricao'],
  CatalogoWeb:['titulo','slug'],
  ConfiguracaoDespesaRecorrente:['descricao'],
};

// Formulários que gerenciam seu próprio submit (self-managed)
const SELF_MANAGED = new Set([
  "CadastroClienteCompleto","CadastroFornecedorCompleto","TransportadoraForm",
  "ColaboradorForm","RepresentanteFormCompleto","RepresentanteForm",
  "ProdutoFormV22_Completo","ProdutoFormCompleto","ProdutoForm","RegiaoAtendimentoForm",
]);

// ─── helpers ─────────────────────────────────────────────────────────────────
function formatValue(value, col, extraColors = {}) {
  if (value === null || value === undefined || value === "") return "—";
  const allColors = { ...STATUS_COLORS, ...extraColors };

  if (BOOL_FIELDS.has(col.field)) {
    return value
      ? <Badge variant="outline" className="text-xs rounded-sm bg-green-100 text-green-700 border-green-300">Sim</Badge>
      : <Badge variant="outline" className="text-xs rounded-sm bg-slate-100 text-slate-500 border-slate-300">Não</Badge>;
  }
  if (STATUS_FIELDS.has(col.field) && typeof value === "string") {
    const cls = allColors[value] || "bg-slate-100 text-slate-600";
    return <Badge variant="outline" className={`text-xs rounded-sm ${cls}`}>{value}</Badge>;
  }
  if (DATE_FIELDS.has(col.field) || col.type === "date") {
    try {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.toLocaleDateString("pt-BR");
    } catch {}
  }
  if (MONEY_FIELDS.has(col.field) || col.type === "currency") {
    const n = Number(value);
    if (!isNaN(n)) return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
  if (col.type === "number") {
    const n = Number(value);
    return isNaN(n) ? String(value) : n.toLocaleString("pt-BR");
  }
  if (typeof value === "boolean") return value ? "✓" : "—";
  if (typeof value === "object") return Array.isArray(value) ? `[${value.length}]` : "–";
  return String(value).substring(0, 100);
}

// Busca o registro completo via asServiceRole (contorna wrapping do Layout)
async function fetchFullRecord(entityName, itemId) {
  if (!entityName || !itemId) return null;

  // Tentativa 1: asServiceRole filter por id
  try {
    const api = base44.asServiceRole?.entities?.[entityName];
    if (api?.filter) {
      const res = await api.filter({ id: itemId }, '-updated_date', 1, 0);
      if (Array.isArray(res) && res[0]?.id) return JSON.parse(JSON.stringify(res[0]));
    }
  } catch (_) {}

  // Tentativa 2: asServiceRole get
  try {
    const api = base44.asServiceRole?.entities?.[entityName];
    if (api?.get) {
      const rec = await api.get(itemId);
      if (rec?.id) return JSON.parse(JSON.stringify(rec));
    }
  } catch (_) {}

  // Tentativa 3: entities normais filter
  try {
    const api = base44.entities?.[entityName];
    if (api?.filter) {
      const res = await api.filter({ id: itemId }, '-updated_date', 1, 0);
      if (Array.isArray(res) && res[0]?.id) return JSON.parse(JSON.stringify(res[0]));
    }
  } catch (_) {}

  return null;
}

// Monta props do formulário — CRÍTICO: editItem deve estar nas deps
function buildFormProps(editItem, onClose, onSubmit) {
  const base = {
    onClose, onSave: onClose, onSuccess: onClose,
    onOpenChange: (v) => { if (!v) onClose(); },
    isOpen: true, open: true, windowMode: true,
    onSubmit,
  };
  if (!editItem) return base;

  // Passa o mesmo objeto como TODOS os possíveis nomes de prop
  const itemProps = {};
  const aliases = [
    'item','data','initialData','defaultValues','record','entity','value',
    'cliente','fornecedor','colaborador','transportadora','representante',
    'contato','contatoB2B','segmento','segmentoCliente','regiao','regiaoAtendimento',
    'produto','servico','banco','conta','formaPagamento','centroCusto','planoContas',
    'planoDeContas','veiculo','motorista','departamento','cargo','turno',
    'empresa','grupo','grupoEmpresarial','grupoProduto','marca','kitProduto',
    'catalogoWeb','unidade','unidadeMedida','setor','setorAtividade','tabelaPreco',
    'tipoDespesa','tipo','moedaIndice','moeda','operadorCaixa','operador',
    'tabelaFiscal','condicaoComercial','centroResultado','centro',
    'localEstoque','local','tipoFrete','rotaPadrao','rota',
    'gateway','gatewayPagamento','configuracaoCobranca',
    'configuracaoDespesaRecorrente','despesaRecorrente','configuracao',
    'perfilAcesso','perfil','modeloDocumento','apiExterna',
    'webhook','chatbotIntent','chatbotCanal','jobAgendado','eventoNotificacao',
  ];
  aliases.forEach(a => { itemProps[a] = editItem; });
  return { ...base, ...itemProps, id: editItem.id };
}

// ─── componente principal ─────────────────────────────────────────────────────
export default function VisualizadorUniversalEntidadeV24({
  nomeEntidade, tituloDisplay, icone: IconeProp,
  camposPrincipais = [], componenteEdicao: FormComponent,
  windowMode = false, entityName, columns,
  pageSize: pageSizeProp = 20,
  statusColors: extraColors = {},
}) {
  const ENTITY = nomeEntidade || entityName || "";
  const TITULO = tituloDisplay || ENTITY;
  const isSimple = SIMPLE_CATALOG.has(ENTITY);
  const isSelfManaged = FormComponent
    ? SELF_MANAGED.has(FormComponent.displayName || FormComponent.name || "")
    : false;

  const queryClient = useQueryClient();
  const { empresaAtual, grupoAtual, empresasDoGrupo } = useContextoVisual();
  const empresaId = empresaAtual?.id || null;
  const groupId   = grupoAtual?.id  || null;

  // Colunas
  const COLUMNS = useMemo(() => {
    if (columns?.length > 0) return columns;
    if (camposPrincipais?.length > 0) {
      return camposPrincipais.map(campo => ({
        field: campo,
        label: campo.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        sortable: true,
      }));
    }
    return [
      { field: "nome", label: "Nome", sortable: true },
      { field: "status", label: "Status", sortable: false },
    ];
  }, [JSON.stringify(columns), JSON.stringify(camposPrincipais)]); // eslint-disable-line

  // ── estado ──
  const [sortField, setSortField] = useState("updated_date");
  const [sortDir,   setSortDir]   = useState("desc");
  const [search,    setSearch]    = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page,      setPage]      = useState(1);
  const [pageSize,  setPageSize]  = useState(pageSizeProp);

  // Formulário
  const [showForm,       setShowForm]       = useState(false);
  const [editItem,       setEditItem]       = useState(null);   // objeto completo
  const [formKey,        setFormKey]        = useState(0);
  const [isLoadingEdit,  setIsLoadingEdit]  = useState(false);
  const [editError,      setEditError]      = useState(null);
  const [isSavingForm,   setIsSavingForm]   = useState(false);

  // Seleção
  const [selectedIds,   setSelectedIds]   = useState(new Set());
  const [crossPageAll,  setCrossPageAll]  = useState(false);
  const [deselectedIds, setDeselectedIds] = useState(new Set());

  // Debounce busca
  const debounceRef = useRef(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Contagem total (para o badge e cross-page)
  const { total: totalCount } = useEntityCounts(ENTITY ? [ENTITY] : []);

  // Filtro de contexto
  const ctxFilter = useMemo(() => {
    const f = buildContextFilter(ENTITY, empresaId, groupId, empresasDoGrupo);
    return f === null ? {} : (f || {});
  }, [ENTITY, empresaId, groupId, JSON.stringify(empresasDoGrupo)]); // eslint-disable-line

  const skip = (page - 1) * pageSize;

  // Query key inclui sortField e sortDir no estado (não em ref) → consistente
  const queryKey = [
    ENTITY, "viz-v26",
    sortField, sortDir,
    page, pageSize,
    debouncedSearch,
    empresaId, groupId
  ];

  const { data: items = [], isLoading, isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!ENTITY) return [];
      if (!isSimple && !empresaId && !groupId) return [];

      const api = base44.asServiceRole?.entities?.[ENTITY];
      if (!api?.filter) return [];

      // Ordenação: prefixo "-" para desc
      const order = `${sortDir === "desc" ? "-" : ""}${sortField}`;

      let filter = { ...ctxFilter };

      // Adicionar busca textual
      if (debouncedSearch?.trim()) {
        const fields = SEARCH_FIELDS[ENTITY] || ['nome', 'descricao', 'codigo'];
        const rx = { $regex: debouncedSearch.trim(), $options: 'i' };
        const orConds = fields.map(f => ({ [f]: rx }));
        const hasCtx = Object.keys(filter).length > 0;
        filter = hasCtx
          ? { $and: [filter, { $or: orConds }] }
          : { $or: orConds };
      }

      const result = await api.filter(filter, order, pageSize, skip);
      return Array.isArray(result) ? result : [];
    },
    staleTime: 30_000,
    gcTime: 180_000,
    refetchOnWindowFocus: false,
    placeholderData: prev => prev,
    enabled: !!ENTITY && (isSimple || !!(empresaId || groupId)),
  });

  // Subscribe para invalidar quando entidade muda
  useEffect(() => {
    if (!ENTITY) return;
    const api = base44.entities?.[ENTITY];
    if (!api?.subscribe) return;
    const unsub = api.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: [ENTITY, "viz-v26"] });
      queryClient.invalidateQueries({ queryKey: ['entityCounts_v5'] });
    });
    return () => { if (typeof unsub === "function") unsub(); };
  }, [ENTITY, queryClient]);

  // ── ordenação ──
  const handleSort = useCallback((field) => {
    setSortField(prev => {
      const newDir = prev === field ? (sortDir === "desc" ? "asc" : "desc") : "desc";
      setSortDir(newDir);
      return field;
    });
    setPage(1);
  }, [sortDir]);

  const handleSortDropdown = useCallback((value) => {
    const idx = value.lastIndexOf("|");
    if (idx === -1) return;
    const f = value.slice(0, idx);
    const d = value.slice(idx + 1);
    setSortField(f);
    setSortDir(d);
    setPage(1);
  }, []);

  // ── formulário ──
  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setEditItem(null);
    setEditError(null);
    queryClient.invalidateQueries({ queryKey: [ENTITY, "viz-v26"] });
    queryClient.invalidateQueries({ queryKey: ['entityCounts_v5'] });
  }, [ENTITY, queryClient]);

  const handlePersistSubmit = useCallback(async (formData) => {
    if (!formData || !ENTITY) return;
    if (formData._action === "delete") {
      if (formData.id) {
        try { await (base44.asServiceRole?.entities?.[ENTITY] || base44.entities[ENTITY]).delete(formData.id); } catch (_) {}
      }
      handleCloseForm(); return;
    }
    setIsSavingForm(true);
    try {
      const { _action, ...clean } = formData;
      const payload = { ...clean };
      if (!isSimple) {
        if (!payload.empresa_id && empresaId) payload.empresa_id = empresaId;
        if (!payload.group_id  && groupId)   payload.group_id   = groupId;
      }
      const api = base44.asServiceRole?.entities?.[ENTITY] || base44.entities[ENTITY];
      if (editItem?.id) {
        await api.update(editItem.id, payload);
      } else {
        await api.create(payload);
      }
      handleCloseForm();
    } catch (e) {
      alert("Erro ao salvar: " + (e?.message || String(e)));
    } finally {
      setIsSavingForm(false);
    }
  }, [ENTITY, editItem, empresaId, groupId, handleCloseForm, isSimple]);

  const handleNewItem = useCallback(() => {
    setEditItem(null);
    setEditError(null);
    setFormKey(k => k + 1);
    setShowForm(true);
  }, []);

  const handleEditItem = useCallback(async (item) => {
    if (!item?.id) return;
    setIsLoadingEdit(true);
    setShowForm(false);
    setEditItem(null);
    setEditError(null);
    try {
      const full = await fetchFullRecord(ENTITY, item.id);
      setFormKey(k => k + 1);
      if (full) {
        setEditItem(full);
      } else {
        setEditError("Não foi possível carregar todos os dados. Exibindo dados parciais.");
        setEditItem(JSON.parse(JSON.stringify(item)));
      }
      setShowForm(true);
    } catch (err) {
      console.error("[Viz] fetchFullRecord error:", err);
      setFormKey(k => k + 1);
      setEditItem(JSON.parse(JSON.stringify(item)));
      setShowForm(true);
    } finally {
      setIsLoadingEdit(false);
    }
  }, [ENTITY]);

  // CRÍTICO: formProps recalcula TODA VEZ que editItem muda
  // Não usar useMemo com deps omitidas — passar editItem diretamente
  const formProps = buildFormProps(
    editItem,
    handleCloseForm,
    isSelfManaged ? handleCloseForm : handlePersistSubmit
  );

  // ── exclusão unitária ──
  const handleDelete = useCallback(async (item) => {
    const label = item.nome || item.razao_social || item.nome_completo || item.descricao || item.id;
    if (!window.confirm(`Confirma exclusão de "${label}"?`)) return;
    try {
      const api = base44.asServiceRole?.entities?.[ENTITY] || base44.entities[ENTITY];
      await api.delete(item.id);
      queryClient.invalidateQueries({ queryKey: [ENTITY, "viz-v26"] });
      queryClient.invalidateQueries({ queryKey: ['entityCounts_v5'] });
      setSelectedIds(prev => { const n = new Set(prev); n.delete(item.id); return n; });
    } catch (e) {
      alert("Erro ao excluir: " + (e?.message || String(e)));
    }
  }, [ENTITY, queryClient]);

  // ── exclusão em massa ──
  const handleDeleteSelected = useCallback(async () => {
    const effectiveCount = crossPageAll
      ? Math.max(0, totalCount - deselectedIds.size)
      : selectedIds.size;
    if (effectiveCount === 0) return;

    const msg = crossPageAll
      ? `⚠️ ATENÇÃO: Isso irá excluir ${effectiveCount} registro(s) permanentemente!\n\nDeseja continuar?`
      : `Confirma exclusão de ${effectiveCount} registro(s)?`;
    if (!window.confirm(msg)) return;

    try {
      let idsToDelete = [];

      if (crossPageAll) {
        // Buscar TODOS os IDs respeitando filtro de contexto
        const api = base44.asServiceRole?.entities?.[ENTITY];
        if (!api?.filter) return;
        let skipAcc = 0;
        const BATCH = 500;
        while (true) {
          const arr = await api.filter(ctxFilter, '-updated_date', BATCH, skipAcc);
          if (!Array.isArray(arr) || arr.length === 0) break;
          const validIds = arr.map(i => i.id).filter(id => id && !deselectedIds.has(id));
          idsToDelete = idsToDelete.concat(validIds);
          if (arr.length < BATCH) break;
          skipAcc += BATCH;
        }
      } else {
        idsToDelete = Array.from(selectedIds);
      }

      if (idsToDelete.length === 0) return;

      // Excluir em lotes de 20
      const CONC = 20;
      for (let i = 0; i < idsToDelete.length; i += CONC) {
        const batch = idsToDelete.slice(i, i + CONC);
        await Promise.all(batch.map(id => {
          const api = base44.asServiceRole?.entities?.[ENTITY] || base44.entities[ENTITY];
          return api.delete(id).catch(() => {});
        }));
      }

      queryClient.invalidateQueries({ queryKey: [ENTITY, "viz-v26"] });
      queryClient.invalidateQueries({ queryKey: ['entityCounts_v5'] });
      setSelectedIds(new Set());
      setDeselectedIds(new Set());
      setCrossPageAll(false);
      setPage(1);
    } catch (e) {
      alert("Erro ao excluir: " + (e?.message || String(e)));
    }
  }, [ENTITY, crossPageAll, totalCount, selectedIds, deselectedIds, ctxFilter, queryClient]);

  // ── seleção ──
  const isItemSelected = useCallback((id) =>
    crossPageAll ? !deselectedIds.has(id) : selectedIds.has(id),
  [crossPageAll, deselectedIds, selectedIds]);

  const handleItemCheck = useCallback((id, checked) => {
    if (crossPageAll) {
      setDeselectedIds(prev => {
        const n = new Set(prev);
        if (checked) n.delete(id); else n.add(id);
        return n;
      });
    } else {
      setSelectedIds(prev => {
        const n = new Set(prev);
        if (checked) n.add(id); else n.delete(id);
        return n;
      });
    }
  }, [crossPageAll]);

  const allPageSelected  = items.length > 0 && items.every(i => isItemSelected(i.id));
  const somePageSelected = items.some(i => isItemSelected(i.id));

  const handleToggleSelectPage = useCallback(() => {
    if (crossPageAll) {
      // Em modo cross-page: toggle desmarcar/marcar todos da página
      setDeselectedIds(prev => {
        const n = new Set(prev);
        if (allPageSelected) {
          items.forEach(i => n.add(i.id));
        } else {
          items.forEach(i => n.delete(i.id));
        }
        return n;
      });
    } else if (allPageSelected) {
      setSelectedIds(prev => {
        const n = new Set(prev);
        items.forEach(i => n.delete(i.id));
        return n;
      });
    } else {
      setSelectedIds(prev => {
        const n = new Set(prev);
        items.forEach(i => n.add(i.id));
        return n;
      });
    }
  }, [crossPageAll, allPageSelected, items]);

  const handleActivateCrossPage = useCallback(() => {
    setCrossPageAll(true);
    setDeselectedIds(new Set());
    setSelectedIds(new Set());
  }, []);

  const handleCancelSelection = useCallback(() => {
    setCrossPageAll(false);
    setDeselectedIds(new Set());
    setSelectedIds(new Set());
  }, []);

  // Ícone de ordenação
  const getSortIcon = (field) => {
    if (sortField !== field) return <ChevronsUpDown className="w-3 h-3 text-slate-300 opacity-0 group-hover/th:opacity-100 transition-opacity" />;
    return sortDir === "desc"
      ? <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
      : <ChevronUp className="w-3.5 h-3.5 text-blue-500" />;
  };

  const effectiveSelectedCount = crossPageAll
    ? Math.max(0, totalCount - deselectedIds.size)
    : selectedIds.size;

  const showCrossPageBanner = !crossPageAll
    && selectedIds.size > 0
    && allPageSelected
    && totalCount > items.length;

  const needsContext = !isSimple && !empresaId && !groupId;

  // ── render ──
  const content = (
    <div className="flex flex-col h-full gap-3 min-h-0 w-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap shrink-0">
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-sm font-semibold text-slate-700 truncate">{TITULO}:</span>
          <Badge variant="outline" className="rounded-sm bg-blue-50 text-blue-700 border-blue-200 font-bold tabular-nums">
            {totalCount}
          </Badge>
        </div>

        <div className="relative flex-1 min-w-[140px]">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <Input
            placeholder={`Buscar ${TITULO}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-9 rounded-sm text-sm bg-white border-slate-200"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <select
          value={pageSize}
          onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
          className="border border-slate-200 rounded-sm h-9 px-2 text-sm text-slate-700 bg-white cursor-pointer"
        >
          {PAGE_SIZES.map(ps => <option key={ps} value={ps}>{ps} / pág.</option>)}
        </select>

        <select
          value={`${sortField}|${sortDir}`}
          onChange={e => handleSortDropdown(e.target.value)}
          className="border border-slate-200 rounded-sm h-9 px-2 text-sm text-slate-700 bg-white cursor-pointer"
          title="Ordenação"
        >
          <option value="updated_date|desc">↓ Mais Recentes</option>
          <option value="updated_date|asc">↑ Mais Antigos</option>
          <option value="created_date|desc">↓ Criação</option>
          <option value="created_date|asc">↑ Criação</option>
          {COLUMNS.filter(c => c.sortable !== false && !["updated_date","created_date"].includes(c.field)).flatMap(c => [
            <option key={`${c.field}|asc`}  value={`${c.field}|asc`}>{c.label} ↑</option>,
            <option key={`${c.field}|desc`} value={`${c.field}|desc`}>{c.label} ↓</option>,
          ])}
        </select>

        <button
          type="button"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: [ENTITY, "viz-v26"] });
            queryClient.invalidateQueries({ queryKey: ['entityCounts_v5'] });
          }}
          className="h-9 w-9 flex items-center justify-center border border-slate-200 rounded-sm bg-white hover:bg-slate-50"
          title="Recarregar"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-blue-500" : "text-slate-500"}`} />
        </button>

        {FormComponent && (
          <Button
            size="sm"
            onClick={handleNewItem}
            className="h-9 rounded-sm gap-1"
            disabled={isLoadingEdit}
          >
            <Plus className="w-4 h-4" /> Novo
          </Button>
        )}

        {effectiveSelectedCount > 0 && (
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDeleteSelected}
            className="h-9 rounded-sm gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Excluir {effectiveSelectedCount === totalCount ? "TODOS" : effectiveSelectedCount}
          </Button>
        )}
      </div>

      {/* Banner seleção cross-page */}
      {showCrossPageBanner && (
        <div className="bg-amber-50 border border-amber-200 rounded-sm px-3 py-2 text-sm text-amber-800 flex items-center gap-2 shrink-0 flex-wrap">
          <span className="font-medium">{selectedIds.size} selecionados nesta página.</span>
          <button
            onClick={handleActivateCrossPage}
            className="text-blue-600 hover:text-blue-800 underline text-xs font-semibold"
          >
            Selecionar todos os {totalCount} registros
          </button>
          <button onClick={handleCancelSelection} className="ml-auto text-slate-500 hover:text-slate-700 underline text-xs">
            Cancelar
          </button>
        </div>
      )}

      {crossPageAll && (
        <div className="bg-blue-50 border border-blue-200 rounded-sm px-3 py-2 text-sm text-blue-700 flex items-center gap-2 shrink-0 flex-wrap">
          <span>
            ✓ {deselectedIds.size > 0
              ? `${effectiveSelectedCount} de ${totalCount} selecionados (${deselectedIds.size} desmarcado${deselectedIds.size > 1 ? "s" : ""})`
              : `Todos os ${totalCount} registros de "${TITULO}" selecionados`}
          </span>
          <button onClick={handleCancelSelection} className="ml-auto text-blue-500 hover:text-blue-700 underline text-xs">
            Cancelar seleção
          </button>
        </div>
      )}

      {/* Tabela */}
      <div className="flex-1 overflow-auto rounded-sm border border-slate-200 bg-white min-h-0">
        {isLoading && items.length === 0 ? (
          <div className="space-y-1.5 p-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className={`h-8 rounded-sm ${i % 3 === 0 ? "w-3/4" : "w-full"}`} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
            <Search className="w-8 h-8 opacity-30" />
            <span className="text-sm">
              {debouncedSearch
                ? `Nenhum resultado para "${debouncedSearch}"`
                : `Nenhum ${TITULO} encontrado`}
            </span>
            {needsContext && (
              <span className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Selecione uma empresa ou grupo
              </span>
            )}
          </div>
        ) : (
          <table className="w-full text-sm table-auto">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
              <tr>
                <th className="px-3 py-2.5 text-center w-9 shrink-0">
                  <input
                    type="checkbox"
                    ref={el => { if (el) el.indeterminate = somePageSelected && !allPageSelected; }}
                    checked={allPageSelected}
                    onChange={handleToggleSelectPage}
                    className="w-4 h-4 cursor-pointer"
                  />
                </th>
                {COLUMNS.map(col => (
                  <th
                    key={col.field}
                    className={`group/th px-3 py-2.5 text-left font-semibold text-slate-600 whitespace-nowrap select-none
                      ${col.sortable !== false ? "cursor-pointer hover:bg-slate-100 transition-colors" : ""}`}
                    onClick={() => col.sortable !== false && handleSort(col.field)}
                  >
                    <div className="flex items-center gap-1">
                      <span>{col.label}</span>
                      {col.sortable !== false && getSortIcon(col.field)}
                    </div>
                  </th>
                ))}
                <th className="px-3 py-2.5 text-center font-semibold text-slate-600 w-20 whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map(item => {
                const checked = isItemSelected(item.id);
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-blue-50/30 transition-colors group/row ${checked ? "bg-blue-50/40" : ""}`}
                  >
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={e => handleItemCheck(item.id, e.target.checked)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    {COLUMNS.map(col => (
                      <td key={col.field} className="px-3 py-2 text-slate-600 max-w-[260px] truncate">
                        {formatValue(item[col.field], col, extraColors)}
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                        {FormComponent && (
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); handleEditItem(item); }}
                            title="Editar"
                            disabled={isLoadingEdit}
                            className="h-7 w-7 flex items-center justify-center rounded-sm text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-40"
                          >
                            {isLoadingEdit
                              ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              : <Edit className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          title="Excluir"
                          className="h-7 w-7 flex items-center justify-center rounded-sm text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer paginação */}
      <div className="flex items-center justify-between text-xs text-slate-500 shrink-0 flex-wrap gap-2">
        <span>
          {isFetching && items.length > 0 && (
            <span className="inline-flex items-center gap-1 text-blue-500 mr-2">
              <RefreshCw className="w-3 h-3 animate-spin" /> Atualizando…
            </span>
          )}
          Pág. {page} · {items.length} exibidos · {totalCount} total
        </span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            className="h-7 px-2 border border-slate-200 rounded-sm bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Anterior
          </button>
          <span className="flex items-center justify-center h-7 min-w-[28px] px-2 border border-slate-200 rounded-sm bg-white font-medium text-slate-700">
            {page}
          </span>
          <button
            type="button"
            onClick={() => setPage(p => p + 1)}
            disabled={items.length < pageSize || isLoading}
            className="h-7 px-2 border border-slate-200 rounded-sm bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Próxima →
          </button>
        </div>
      </div>

      {/* Modal formulário */}
      {FormComponent && showForm && (
        <>
          <div className="fixed inset-0 z-[1099] bg-black/50" onClick={handleCloseForm} />
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 pointer-events-none">
            <div
              className="bg-white rounded-xl w-full max-w-4xl max-h-[92vh] overflow-auto shadow-2xl pointer-events-auto flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10 rounded-t-xl shrink-0">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    {editItem?.id ? `Editar ${TITULO}` : `Novo ${TITULO}`}
                  </h2>
                  {editError && (
                    <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {editError}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isSavingForm && (
                    <span className="text-xs text-blue-600 animate-pulse flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Salvando...
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 flex-1 overflow-auto">
                {/* key garante remontagem total quando editItem ou formKey muda */}
                <FormComponent
                  key={`form-${ENTITY}-${editItem?.id || "new"}-${formKey}`}
                  {...formProps}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col p-4 bg-white overflow-hidden">
        {IconeProp && (
          <div className="flex items-center gap-2 mb-3 shrink-0">
            <IconeProp className="w-5 h-5 text-slate-500" />
            <h2 className="text-base font-semibold text-slate-800">{TITULO}</h2>
          </div>
        )}
        <div className="flex-1 min-h-0">{content}</div>
      </div>
    );
  }
  return content;
}