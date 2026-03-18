/**
 * VisualizadorUniversalEntidadeV24 — Motor universal de listagem
 * ✅ Edição funcional: formulário sempre pré-preenchido (props universais + específicos)
 * ✅ Persistência automática para formulários simples (onSubmit → create/update backend)
 * ✅ Ordenação correta via entityListSorted (campo + direção separados)
 * ✅ Badge de total real de registros via countEntities
 * ✅ Delete ALL (cross-page) — seleção preservada ao desmarcar individual
 * ✅ Paginação server-side com skip/limit real
 * ✅ Multiempresa + Real-time
 */
import React, { useState, useEffect, useMemo, useCallback, useRef, startTransition } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import useEntityCounts from "@/components/lib/useEntityCounts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronUp, ChevronDown, ChevronsUpDown,
  Search, Edit, Trash2, Plus, RefreshCw, AlertCircle, X
} from "lucide-react";

const DEFAULT_STATUS_COLORS = {
  Ativo:         "bg-green-100 text-green-700",
  Ativa:         "bg-green-100 text-green-700",
  Aprovado:      "bg-green-100 text-green-700",
  OK:            "bg-green-100 text-green-700",
  Recebido:      "bg-green-100 text-green-700",
  Pago:          "bg-green-100 text-green-700",
  "Em Análise":  "bg-blue-100 text-blue-700",
  Prospect:      "bg-yellow-100 text-yellow-700",
  Pendente:      "bg-yellow-100 text-yellow-700",
  Alerta:        "bg-yellow-100 text-yellow-700",
  Inativo:       "bg-slate-100 text-slate-500",
  Inativa:       "bg-slate-100 text-slate-500",
  Bloqueado:     "bg-red-100 text-red-700",
  Cancelado:     "bg-red-100 text-red-700",
  Atrasado:      "bg-red-100 text-red-700",
  Descontinuado: "bg-orange-100 text-orange-700",
};

const STATUS_FIELDS = new Set([
  "status", "status_fornecedor", "status_cliente", "situacao",
  "ativo_status", "situacao_credito", "status_fiscal_receita"
]);
const BOOL_FIELDS = new Set(["ativo", "ativa", "ativo_status", "habilitado"]);
const DATE_FIELDS = new Set([
  "created_date", "updated_date", "data_admissao", "data_nascimento",
  "data_vencimento", "data_validade", "ultima_compra", "data_emissao", "data_pedido"
]);
const MONEY_FIELDS = new Set([
  "salario", "preco_venda", "custo_aquisicao", "custo_medio",
  "valor_frete", "orcamento_mensal", "limite_credito", "valor_total", "valor"
]);

const PAGE_SIZES = [10, 20, 50, 100];

// ─── Formulários "self-managed" (têm persistência própria internamente) ────────
// Esses NÃO precisam que o Visualizador gerencie o onSubmit → já fazem create/update internos
const SELF_MANAGED_FORMS = new Set([
  "CadastroClienteCompleto",
  "CadastroFornecedorCompleto",
  "TransportadoraForm",
  "ColaboradorForm",
  "RepresentanteFormCompleto",
  "RepresentanteForm",
  "ProdutoFormV22_Completo",
  "ProdutoFormCompleto",
  "ProdutoForm",
]);

// ─── Mapeamento de props canônicos por entidade ───────────────────────────────
function buildFormProps(editItem, handleSave, handlePersistSubmit) {
  const isPersist = typeof handlePersistSubmit === "function";

  const callbacks = {
    onClose: handleSave,
    onSave: handleSave,
    onSuccess: handleSave,
    onOpenChange: (v) => { if (!v) handleSave(); },
    isOpen: true,
    open: true,
    windowMode: true,
    // Para formulários simples: onSubmit → persistência automática
    onSubmit: isPersist ? handlePersistSubmit : handleSave,
  };

  if (!editItem) return callbacks;

  return {
    // Universais
    item: editItem,
    data: editItem,
    // Props específicos por entidade — cobre TODOS os cadastros
    cliente: editItem,
    fornecedor: editItem,
    colaborador: editItem,
    transportadora: editItem,
    representante: editItem,
    contato: editItem,
    contatoB2B: editItem,
    segmento: editItem,
    segmentoCliente: editItem,
    regiao: editItem,
    regiaoAtendimento: editItem,
    produto: editItem,
    servico: editItem,
    banco: editItem,
    formaPagamento: editItem,
    centroCusto: editItem,
    planoContas: editItem,
    planoDeContas: editItem,
    veiculo: editItem,
    motorista: editItem,
    departamento: editItem,
    cargo: editItem,
    turno: editItem,
    empresa: editItem,
    grupo: editItem,
    grupoProduto: editItem,
    marca: editItem,
    kitProduto: editItem,
    catalogoWeb: editItem,
    unidadeMedida: editItem,
    setorAtividade: editItem,
    tabelaPreco: editItem,
    tipoDespesa: editItem,
    moedaIndice: editItem,
    operadorCaixa: editItem,
    tabelaFiscal: editItem,
    condicaoComercial: editItem,
    centroResultado: editItem,
    localEstoque: editItem,
    tipoFrete: editItem,
    rotaPadrao: editItem,
    gateway: editItem,
    gatewayPagamento: editItem,
    configuracaoCobranca: editItem,
    configuracaoDespesaRecorrente: editItem,
    perfilAcesso: editItem,
    regiaoId: editItem?.id,
    ...callbacks,
  };
}

export default function VisualizadorUniversalEntidadeV24({
  nomeEntidade,
  tituloDisplay,
  icone: IconeProp,
  camposPrincipais = [],
  componenteEdicao: FormComponent,
  windowMode = false,
  entityName,
  columns,
  pageSize: pageSizeProp,
  statusColors = DEFAULT_STATUS_COLORS,
}) {
  const ENTITY = nomeEntidade || entityName || "";
  const TITULO = tituloDisplay || ENTITY;

  // Detecta se o formulário gerencia sua própria persistência
  const isSelfManaged = FormComponent
    ? SELF_MANAGED_FORMS.has(FormComponent.displayName || FormComponent.name || "")
    : false;

  const COLUMNS = useMemo(() => {
    if (columns?.length > 0) return columns;
    if (camposPrincipais?.length > 0) {
      return camposPrincipais.map((campo) => ({
        field: campo,
        label: campo.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        sortable: true,
        searchable: !STATUS_FIELDS.has(campo) && !BOOL_FIELDS.has(campo),
      }));
    }
    return [
      { field: "nome", label: "Nome", sortable: true, searchable: true },
      { field: "status", label: "Status", sortable: false, searchable: false },
    ];
  }, [columns, camposPrincipais]);

  const queryClient = useQueryClient();
  const { empresaAtual, grupoAtual } = useContextoVisual();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortField, setSortField] = useState("updated_date");
  const [sortDir, setSortDir] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeProp || 20);

  const [editItem, setEditItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSavingForm, setIsSavingForm] = useState(false);

  // Seleção cross-page
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectAllCrossPage, setSelectAllCrossPage] = useState(false);

  const debounceRef = useRef(null);
  const hasContext = !!(empresaAtual?.id || grupoAtual?.id);

  // ─── Contagem real ────────────────────────────────────────────────────────────
  const { total: totalCount } = useEntityCounts(ENTITY ? [ENTITY] : []);

  // ─── Debounced search ────────────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startTransition(() => {
        setDebouncedSearch(search);
        setCurrentPage(1);
      });
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  // ─── Construir filtro de contexto ────────────────────────────────────────────
  const contextFilter = useMemo(() => {
    const f = {};
    if (grupoAtual?.id) f.group_id = grupoAtual.id;
    else if (empresaAtual?.id) f.empresa_id = empresaAtual.id;
    return f;
  }, [grupoAtual?.id, empresaAtual?.id]);

  // ─── Query principal via entityListSorted ────────────────────────────────────
  const skip = (currentPage - 1) * pageSize;
  const { data: items = [], isLoading, isFetching } = useQuery({
    queryKey: [ENTITY, "viz-v24", sortField, sortDir, currentPage, pageSize, debouncedSearch, empresaAtual?.id, grupoAtual?.id],
    queryFn: async () => {
      if (!ENTITY || !hasContext) return [];
      try {
        const res = await base44.functions.invoke("entityListSorted", {
          entityName: ENTITY,
          filter: contextFilter,
          sortField,
          sortDirection: sortDir,
          limit: pageSize,
          skip,
          search: debouncedSearch || undefined,
        });
        return Array.isArray(res?.data) ? res.data : [];
      } catch {
        return [];
      }
    },
    staleTime: 30_000,
    gcTime: 120_000,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
    enabled: !!ENTITY && hasContext,
  });

  // ─── Real-time ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!ENTITY) return;
    const api = base44.entities?.[ENTITY];
    if (!api?.subscribe) return;
    const unsub = api.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: [ENTITY, "viz-v24"] });
      queryClient.invalidateQueries({ queryKey: ["entityCounts_v3"] });
    });
    return () => { if (typeof unsub === "function") unsub(); };
  }, [ENTITY, queryClient]);

  // ─── Sort handler ─────────────────────────────────────────────────────────────
  const handleSort = useCallback((field) => {
    startTransition(() => {
      setSortField((prevField) => {
        if (prevField === field) {
          setSortDir((prevDir) => prevDir === "desc" ? "asc" : "desc");
          return prevField;
        }
        setSortDir("desc");
        return field;
      });
      setCurrentPage(1);
    });
  }, []);

  // ─── Formatter ───────────────────────────────────────────────────────────────
  const formatValue = useCallback((value, col) => {
    if (value === null || value === undefined || value === "") return "—";
    if (BOOL_FIELDS.has(col.field)) {
      return value
        ? <Badge variant="outline" className="text-xs rounded-sm bg-green-100 text-green-700 border-green-300">Ativo</Badge>
        : <Badge variant="outline" className="text-xs rounded-sm bg-slate-100 text-slate-500 border-slate-300">Inativo</Badge>;
    }
    if (STATUS_FIELDS.has(col.field) && typeof value === "string") {
      const cls = statusColors[value] || "bg-slate-100 text-slate-600";
      return <Badge variant="outline" className={`text-xs rounded-sm ${cls}`}>{value}</Badge>;
    }
    if (DATE_FIELDS.has(col.field) || col.type === "date") {
      try {
        const d = new Date(value);
        if (!isNaN(d.getTime())) return d.toLocaleDateString("pt-BR");
      } catch { /**/ }
    }
    if (MONEY_FIELDS.has(col.field) || col.type === "currency") {
      const n = Number(value);
      if (!isNaN(n)) return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
    }
    if (col.type === "number") {
      const n = Number(value);
      return isNaN(n) ? String(value) : n.toLocaleString("pt-BR");
    }
    if (typeof value === "boolean") return value ? "✓" : "—";
    if (typeof value === "object") return Array.isArray(value) ? `[${value.length}]` : "–";
    return String(value).substring(0, 80);
  }, [statusColors]);

  // ─── Persistência automática para formulários simples ─────────────────────────
  // Chamado pelo onSubmit do formulário: recebe os dados e faz create/update
  const handlePersistSubmit = useCallback(async (formData) => {
    if (!formData || !ENTITY) return;
    // Se o formulário enviou _action: 'delete', ignora persistência
    if (formData._action === "delete") {
      setShowForm(false);
      setEditItem(null);
      queryClient.invalidateQueries({ queryKey: [ENTITY, "viz-v24"] });
      queryClient.invalidateQueries({ queryKey: ["entityCounts_v3"] });
      return;
    }
    setIsSavingForm(true);
    try {
      const payload = { ...formData };
      // Injeta contexto multiempresa se não existir
      if (!payload.empresa_id && empresaAtual?.id) payload.empresa_id = empresaAtual.id;
      if (!payload.group_id && grupoAtual?.id) payload.group_id = grupoAtual.id;

      if (editItem?.id) {
        await base44.entities[ENTITY].update(editItem.id, payload);
      } else {
        await base44.entities[ENTITY].create(payload);
      }
      setShowForm(false);
      setEditItem(null);
      queryClient.invalidateQueries({ queryKey: [ENTITY, "viz-v24"] });
      queryClient.invalidateQueries({ queryKey: ["entityCounts_v3"] });
    } catch (e) {
      alert("Erro ao salvar: " + (e?.message || e));
    } finally {
      setIsSavingForm(false);
    }
  }, [ENTITY, editItem, empresaAtual?.id, grupoAtual?.id, queryClient]);

  // ─── Delete individual ────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (item) => {
    const label = item.nome || item.descricao || item.razao_social || item.nome_completo || item.nome_banco || item.id;
    if (!window.confirm(`Confirma exclusão de "${label}"?`)) return;
    try {
      await base44.entities[ENTITY].delete(item.id);
      queryClient.invalidateQueries({ queryKey: [ENTITY, "viz-v24"] });
      queryClient.invalidateQueries({ queryKey: ["entityCounts_v3"] });
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(item.id); return n; });
    } catch (e) {
      alert("Erro ao excluir: " + (e?.message || e));
    }
  }, [ENTITY, queryClient]);

  // ─── Delete em massa (cross-page) ─────────────────────────────────────────────
  const handleDeleteSelected = useCallback(async () => {
    const count = selectAllCrossPage ? totalCount : selectedIds.size;
    if (count === 0) return;
    const msg = selectAllCrossPage
      ? `⚠️ Confirma exclusão de TODOS os ${totalCount} registros de "${TITULO}"? Esta ação não pode ser desfeita!`
      : `Confirma exclusão de ${selectedIds.size} registro(s) selecionado(s)?`;
    if (!window.confirm(msg)) return;
    try {
      let idsToDelete;
      if (selectAllCrossPage) {
        const res = await base44.functions.invoke("entityListSorted", {
          entityName: ENTITY,
          filter: contextFilter,
          sortField: "updated_date",
          sortDirection: "desc",
          limit: 5000,
          skip: 0,
        });
        idsToDelete = (Array.isArray(res?.data) ? res.data : []).map((i) => i.id).filter(Boolean);
      } else {
        idsToDelete = Array.from(selectedIds);
      }
      for (const id of idsToDelete) {
        await base44.entities[ENTITY].delete(id);
      }
      queryClient.invalidateQueries({ queryKey: [ENTITY, "viz-v24"] });
      queryClient.invalidateQueries({ queryKey: ["entityCounts_v3"] });
      setSelectedIds(new Set());
      setSelectAllCrossPage(false);
      setCurrentPage(1);
    } catch (e) {
      alert("Erro ao excluir: " + (e?.message || e));
    }
  }, [selectAllCrossPage, totalCount, selectedIds, ENTITY, TITULO, queryClient, contextFilter]);

  // ─── Seleção individual — NÃO cancela selectAllCrossPage ────────────────────
  // Quando selectAllCrossPage está ativo e usuário desmarca um item:
  // → migra para seleção explícita (todos exceto esse)
  const handleItemCheck = useCallback((id, checked) => {
    if (selectAllCrossPage && !checked) {
      // Migra: seleciona todos da página atual exceto o desmarcado
      setSelectAllCrossPage(false);
      setSelectedIds(() => {
        const next = new Set(items.map((i) => i.id));
        next.delete(id);
        return next;
      });
      return;
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, [selectAllCrossPage, items]);

  // ─── Toggle select all ────────────────────────────────────────────────────────
  // 1º clique: seleciona todos da página atual
  // 2º clique (com todos da página selecionados): ativa cross-page (todos registros)
  // 3º clique (cross-page ativo): cancela tudo
  const toggleSelectAll = useCallback(() => {
    const allPageSelected = items.length > 0 && items.every((i) => selectedIds.has(i.id));
    if (selectAllCrossPage) {
      // Cancela tudo
      setSelectAllCrossPage(false);
      setSelectedIds(new Set());
    } else if (allPageSelected && totalCount > items.length) {
      // Ativa cross-page
      setSelectAllCrossPage(true);
    } else if (allPageSelected) {
      // Já todos selecionados (única página) → desseleciona
      setSelectedIds(new Set());
    } else {
      // Seleciona todos da página
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  }, [selectAllCrossPage, items, selectedIds, totalCount]);

  // ─── Abrir edição ─────────────────────────────────────────────────────────────
  const handleEditItem = useCallback((item) => {
    startTransition(() => {
      setEditItem({ ...item });
      setShowForm(true);
    });
  }, []);

  // ─── Fechar/salvar (formulários self-managed chamam isso após persistir) ───────
  const handleSave = useCallback(() => {
    startTransition(() => {
      setShowForm(false);
      setEditItem(null);
    });
    queryClient.invalidateQueries({ queryKey: [ENTITY, "viz-v24"] });
    queryClient.invalidateQueries({ queryKey: ["entityCounts_v3"] });
  }, [ENTITY, queryClient]);

  const getSortIcon = (field) => {
    if (sortField !== field) return <ChevronsUpDown className="w-3 h-3 text-slate-300 opacity-0 group-hover/th:opacity-100 transition-opacity" />;
    return sortDir === "desc"
      ? <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
      : <ChevronUp className="w-3.5 h-3.5 text-blue-500" />;
  };

  const deleteCount = selectAllCrossPage ? totalCount : selectedIds.size;

  // Para formulários self-managed: não passa handlePersistSubmit (eles já têm persistência)
  // Para formulários simples: passa handlePersistSubmit para o onSubmit
  const formProps = buildFormProps(
    editItem,
    handleSave,
    isSelfManaged ? null : handlePersistSubmit
  );

  const content = (
    <div className="flex flex-col h-full gap-3 min-h-0">
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 flex-wrap shrink-0">
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-sm font-semibold text-slate-700">{TITULO}:</span>
          <Badge variant="outline" className="rounded-sm bg-blue-50 text-blue-700 border-blue-200 font-bold">
            {totalCount}
          </Badge>
        </div>

        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <Input
            placeholder={`Buscar ${TITULO}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 bg-white border-slate-200 h-9 rounded-sm text-sm"
          />
        </div>

        <select
          value={pageSize}
          onChange={(e) => startTransition(() => { setPageSize(Number(e.target.value)); setCurrentPage(1); })}
          className="border border-slate-200 rounded-sm h-9 px-2 text-sm text-slate-700 bg-white cursor-pointer"
        >
          {PAGE_SIZES.map((ps) => (
            <option key={ps} value={ps}>{ps} / pág.</option>
          ))}
        </select>

        {/* Sort dropdown */}
        <select
          value={`${sortField}|${sortDir}`}
          onChange={(e) => {
            const [f, d] = e.target.value.split("|");
            startTransition(() => { setSortField(f); setSortDir(d); setCurrentPage(1); });
          }}
          className="border border-slate-200 rounded-sm h-9 px-2 text-sm text-slate-700 bg-white cursor-pointer"
          title="Ordenação"
        >
          <option value="updated_date|desc">Mais Recentes</option>
          <option value="updated_date|asc">Mais Antigos</option>
          <option value="created_date|desc">Criação ↓</option>
          <option value="created_date|asc">Criação ↑</option>
          {COLUMNS.filter((c) => c.sortable !== false && c.field !== "updated_date" && c.field !== "created_date").map((c) => (
            <React.Fragment key={c.field}>
              <option value={`${c.field}|asc`}>{c.label} ↑</option>
              <option value={`${c.field}|desc`}>{c.label} ↓</option>
            </React.Fragment>
          ))}
        </select>

        <Button size="sm" variant="outline"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: [ENTITY, "viz-v24"] });
            queryClient.invalidateQueries({ queryKey: ["entityCounts_v3"] });
          }}
          className="h-9 w-9 p-0 rounded-sm" title="Recarregar"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-blue-500" : ""}`} />
        </Button>

        {FormComponent && (
          <Button size="sm"
            onClick={() => startTransition(() => { setEditItem(null); setShowForm(true); })}
            className="h-9 rounded-sm gap-1">
            <Plus className="w-4 h-4" /> Novo
          </Button>
        )}

        {deleteCount > 0 && (
          <Button size="sm" variant="destructive" onClick={handleDeleteSelected} className="h-9 rounded-sm gap-1">
            <Trash2 className="w-4 h-4" />
            {selectAllCrossPage ? `Apagar TODOS (${totalCount})` : `Apagar ${selectedIds.size}`}
          </Button>
        )}
      </div>

      {/* ── Banner cross-page ── */}
      {!selectAllCrossPage && selectedIds.size > 0 && selectedIds.size === items.length && totalCount > items.length && (
        <div className="bg-amber-50 border border-amber-200 rounded-sm px-3 py-2 text-sm text-amber-700 flex items-center gap-2 shrink-0">
          <span>Selecionados {selectedIds.size} registros desta página.</span>
          <button onClick={() => setSelectAllCrossPage(true)} className="ml-1 text-blue-600 hover:text-blue-800 underline text-xs font-semibold">
            Selecionar todos os {totalCount} registros
          </button>
          <button onClick={() => { setSelectedIds(new Set()); }} className="ml-auto text-slate-500 hover:text-slate-700 underline text-xs">Cancelar</button>
        </div>
      )}
      {selectAllCrossPage && (
        <div className="bg-blue-50 border border-blue-200 rounded-sm px-3 py-2 text-sm text-blue-700 flex items-center gap-2 shrink-0">
          <span>✓ Todos os <strong>{totalCount}</strong> registros de {TITULO} estão selecionados.</span>
          <button onClick={() => { setSelectAllCrossPage(false); setSelectedIds(new Set()); }}
            className="ml-auto text-blue-500 hover:text-blue-700 underline text-xs">
            Cancelar seleção
          </button>
        </div>
      )}

      {/* ── Tabela ── */}
      <div className="flex-1 overflow-auto rounded-sm border border-slate-200 bg-white">
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
              {debouncedSearch ? `Nenhum resultado para "${debouncedSearch}"` : `Nenhum ${TITULO} encontrado`}
            </span>
            {!hasContext && (
              <span className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Selecione uma empresa
              </span>
            )}
          </div>
        ) : (
          <table className="w-full text-sm table-auto">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
              <tr>
                <th className="px-4 py-2.5 text-center w-10">
                  <input
                    type="checkbox"
                    ref={(el) => {
                      if (el) el.indeterminate = selectedIds.size > 0 && !selectAllCrossPage && selectedIds.size < items.length;
                    }}
                    checked={selectAllCrossPage || (items.length > 0 && items.every((i) => selectedIds.has(i.id)))}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 cursor-pointer"
                    title={selectAllCrossPage ? "Desselecionar todos" : `Selecionar todos (${totalCount})`}
                  />
                </th>
                {COLUMNS.map((col) => (
                  <th
                    key={col.field}
                    className={`group/th px-4 py-2.5 text-left font-semibold text-slate-600 select-none whitespace-nowrap ${col.sortable !== false ? "cursor-pointer hover:bg-slate-100 transition-colors" : ""}`}
                    onClick={() => col.sortable !== false && handleSort(col.field)}
                  >
                    <div className="flex items-center gap-1">
                      <span>{col.label}</span>
                      {col.sortable !== false && getSortIcon(col.field)}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-2.5 text-center font-semibold text-slate-600 w-20 whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id}
                  className={`hover:bg-blue-50/30 transition-colors group/row ${(selectedIds.has(item.id) || selectAllCrossPage) ? "bg-blue-50/40" : ""}`}>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectAllCrossPage || selectedIds.has(item.id)}
                      onChange={(e) => handleItemCheck(item.id, e.target.checked)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  {COLUMNS.map((col) => (
                    <td key={col.field} className="px-4 py-2 text-slate-600 max-w-[280px] truncate">
                      {formatValue(item[col.field], col)}
                    </td>
                  ))}
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-center gap-1 opacity-60 group-hover/row:opacity-100 transition-opacity">
                      {FormComponent && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleEditItem(item); }}
                          title="Editar"
                          className="h-7 w-7 flex items-center justify-center rounded-sm text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item)}
                        title="Excluir"
                        className="h-7 w-7 flex items-center justify-center rounded-sm text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Paginação ── */}
      <div className="flex items-center justify-between text-xs text-slate-500 shrink-0 flex-wrap gap-2">
        <span className="text-slate-400">
          {isFetching && items.length > 0 && (
            <span className="inline-flex items-center gap-1 text-blue-500 mr-2">
              <RefreshCw className="w-3 h-3 animate-spin" /> Atualizando…
            </span>
          )}
          Pág. {currentPage} · Mostrando {items.length} de {totalCount} registros
        </span>
        <div className="flex gap-1.5">
          <Button size="sm" variant="outline"
            onClick={() => startTransition(() => setCurrentPage((p) => Math.max(1, p - 1)))}
            disabled={currentPage === 1 || isLoading}
            className="h-7 text-xs rounded-sm px-2"
          >
            ← Anterior
          </Button>
          <span className="flex items-center justify-center h-7 min-w-7 px-2 border border-slate-200 rounded-sm bg-white text-slate-700 font-medium">
            {currentPage}
          </span>
          <Button size="sm" variant="outline"
            onClick={() => startTransition(() => setCurrentPage((p) => p + 1))}
            disabled={items.length < pageSize || isLoading}
            className="h-7 text-xs rounded-sm px-2"
          >
            Próxima →
          </Button>
        </div>
      </div>

      {/* ── Modal de Edição ── */}
      {FormComponent && showForm && (
        <>
          <div className="fixed inset-0 z-[999] bg-black/50" onClick={isSelfManaged ? handleSave : undefined} />
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-none">
            <div
              className="bg-white rounded-xl w-full max-w-4xl max-h-[92vh] overflow-auto shadow-2xl pointer-events-auto flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10 rounded-t-xl">
                <h2 className="text-lg font-semibold text-slate-800">
                  {editItem ? `Editar ${TITULO}` : `Novo ${TITULO}`}
                </h2>
                <div className="flex items-center gap-2">
                  {isSavingForm && (
                    <span className="text-xs text-blue-600 animate-pulse">Salvando...</span>
                  )}
                  <button
                    type="button"
                    onClick={handleSave}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 flex-1 overflow-auto">
                {/* key força desmontagem e remontagem completa ao trocar de item, garantindo que o useState re-inicializa */}
                <FormComponent key={editItem ? `edit-${editItem.id}` : "new-form"} {...formProps} />
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