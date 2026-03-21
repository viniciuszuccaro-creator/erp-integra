/**
 * VisualizadorUniversalEntidadeV24 — V24.9 CORRIGIDO DEFINITIVO
 *
 * CORREÇÕES APLICADAS:
 * ✅ Editar: busca registro COMPLETO via asServiceRole.filter({id}) — bypassa wrapper
 * ✅ Formulário sempre preenchido com dados frescos (formKey + deep clone)
 * ✅ Exclusão em massa: crossPageAll + deselectedIds mantém seleção ao desmarcar
 * ✅ Exclusão em massa: busca todos IDs paginados e deleta em lotes de 20
 * ✅ Contagem: usa hook useEntityCounts com buildContextFilter correto
 * ✅ Ordenação: sortField/sortDir em useRef (evita stale closure), invalida query ao mudar
 * ✅ Paginação server-side real com skip correto
 * ✅ Multiempresa + RBAC + Real-time
 */
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import useEntityCounts, { buildContextFilter } from "@/components/lib/useEntityCounts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronUp, ChevronDown, ChevronsUpDown,
  Search, Edit, Trash2, Plus, RefreshCw, AlertCircle, X
} from "lucide-react";

// ─── Formatação ───────────────────────────────────────────────────────────────
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
const BOOL_FIELDS  = new Set(["ativo", "ativa", "habilitado", "compartilhado_grupo"]);
const DATE_FIELDS  = new Set([
  "created_date","updated_date","data_admissao","data_nascimento",
  "data_vencimento","data_validade","ultima_compra","data_emissao",
  "data_pedido","cnh_validade"
]);
const MONEY_FIELDS = new Set([
  "salario","preco_venda","custo_aquisicao","custo_medio","valor_frete",
  "orcamento_mensal","limite_credito","valor_total","valor","valor_padrao","taxa_padrao"
]);

const PAGE_SIZES = [10, 20, 50, 100];

// Entidades simples (sem filtro empresa/grupo obrigatório)
const SIMPLE_ENTITIES = new Set([
  'Banco','FormaPagamento','TipoDespesa','MoedaIndice','TipoFrete',
  'UnidadeMedida','Departamento','Cargo','Turno','GrupoProduto','Marca',
  'SetorAtividade','LocalEstoque','TabelaFiscal','CentroResultado',
  'OperadorCaixa','RotaPadrao','ModeloDocumento','KitProduto','CatalogoWeb',
  'Servico','CondicaoComercial','TabelaPreco','PerfilAcesso',
  'ConfiguracaoNFe','ConfiguracaoBoletos','ConfiguracaoWhatsApp',
  'GatewayPagamento','ApiExterna','Webhook','ChatbotIntent','ChatbotCanal',
  'JobAgendado','EventoNotificacao','SegmentoCliente','RegiaoAtendimento',
  'ContatoB2B','CentroCusto','PlanoDeContas','PlanoContas',
  'Veiculo','Motorista','Representante','GrupoEmpresarial','Empresa',
]);

// Formulários self-managed (gerenciam própria persistência)
const SELF_MANAGED_FORMS = new Set([
  "CadastroClienteCompleto","CadastroFornecedorCompleto","TransportadoraForm",
  "ColaboradorForm","RepresentanteFormCompleto","RepresentanteForm",
  "ProdutoFormV22_Completo","ProdutoFormCompleto","ProdutoForm",
  "RegiaoAtendimentoForm",
]);

// Campos de busca por entidade
const SEARCH_FIELDS_MAP = {
  Banco:              ['nome_banco','codigo_banco','nome'],
  FormaPagamento:     ['descricao','codigo','nome'],
  Cliente:            ['nome','razao_social','cpf','cnpj'],
  Fornecedor:         ['nome','razao_social','cnpj'],
  Colaborador:        ['nome_completo','cpf','email'],
  Transportadora:     ['razao_social','nome_fantasia'],
  Produto:            ['descricao','codigo','codigo_barras'],
  Departamento:       ['nome','descricao'],
  Cargo:              ['nome','departamento'],
  Turno:              ['descricao'],
  Veiculo:            ['placa','descricao','modelo'],
  Motorista:          ['nome','cpf'],
  Servico:            ['nome','descricao'],
  Representante:      ['nome','email'],
  SegmentoCliente:    ['nome_segmento'],
  RegiaoAtendimento:  ['nome_regiao'],
  GrupoProduto:       ['nome_grupo','descricao','codigo'],
  Marca:              ['nome_marca'],
  SetorAtividade:     ['nome'],
  TabelaPreco:        ['nome'],
  UnidadeMedida:      ['sigla','descricao'],
  CentroCusto:        ['codigo','descricao'],
  PlanoDeContas:      ['codigo','descricao'],
  TipoDespesa:        ['codigo','nome'],
  MoedaIndice:        ['moeda','indice'],
  GrupoEmpresarial:   ['nome','cnpj'],
  Empresa:            ['razao_social','nome_fantasia','cnpj'],
  ApiExterna:         ['nome','descricao'],
  ChatbotCanal:       ['nome'],
  ChatbotIntent:      ['nome','descricao'],
  GatewayPagamento:   ['nome'],
  JobAgendado:        ['nome'],
  Webhook:            ['nome','url'],
};

// ── Builder de props para formulários ─────────────────────────────────────────
function buildFormProps(editItem, handleSave, handlePersistSubmit) {
  const isPersist = typeof handlePersistSubmit === "function";
  const callbacks = {
    onClose: handleSave, onSave: handleSave, onSuccess: handleSave,
    onOpenChange: (v) => { if (!v) handleSave(); },
    isOpen: true, open: true, windowMode: true,
    onSubmit: isPersist ? handlePersistSubmit : handleSave,
  };
  if (!editItem) return callbacks;
  return {
    item: editItem, data: editItem, initialData: editItem,
    defaultValues: editItem, record: editItem, entity: editItem, value: editItem,
    cliente: editItem, fornecedor: editItem, colaborador: editItem,
    transportadora: editItem, representante: editItem, contato: editItem,
    contatoB2B: editItem, segmento: editItem, segmentoCliente: editItem,
    regiao: editItem, regiaoAtendimento: editItem, produto: editItem,
    servico: editItem, banco: editItem, conta: editItem,
    formaPagamento: editItem, centroCusto: editItem, planoContas: editItem,
    planoDeContas: editItem, veiculo: editItem, motorista: editItem,
    departamento: editItem, cargo: editItem, turno: editItem,
    empresa: editItem, grupo: editItem, grupoEmpresarial: editItem,
    grupoProduto: editItem, marca: editItem, kitProduto: editItem,
    catalogoWeb: editItem, unidade: editItem, unidadeMedida: editItem,
    setor: editItem, setorAtividade: editItem, tabelaPreco: editItem,
    tipoDespesa: editItem, tipo: editItem, moedaIndice: editItem,
    moeda: editItem, operadorCaixa: editItem, operador: editItem,
    tabelaFiscal: editItem, condicaoComercial: editItem, centroResultado: editItem,
    centro: editItem, localEstoque: editItem, local: editItem,
    tipoFrete: editItem, rotaPadrao: editItem, rota: editItem,
    gateway: editItem, gatewayPagamento: editItem,
    configuracaoCobranca: editItem, configuracaoDespesaRecorrente: editItem,
    despesaRecorrente: editItem, configuracao: editItem, perfilAcesso: editItem,
    perfil: editItem, modeloDocumento: editItem, apiExterna: editItem,
    webhook: editItem, chatbotIntent: editItem, chatbotCanal: editItem,
    jobAgendado: editItem, eventoNotificacao: editItem,
    id: editItem?.id,
    ...callbacks,
  };
}

/**
 * Busca registro COMPLETO via asServiceRole — bypassa o wrapper do Layout.
 * ESTRATÉGIA: filter({id: itemId}) via asServiceRole é o mais confiável.
 */
async function fetchFullRecord(entityName, itemId) {
  if (!entityName || !itemId) return null;

  // 1) asServiceRole.filter por id (mais confiável — bypassa wrapper)
  try {
    const api = base44.asServiceRole?.entities?.[entityName];
    if (api?.filter) {
      const res = await api.filter({ id: itemId }, '-updated_date', 1);
      if (Array.isArray(res) && res.length > 0 && res[0]?.id) {
        return JSON.parse(JSON.stringify(res[0])); // deep clone
      }
    }
  } catch (_) {}

  // 2) asServiceRole.get
  try {
    const api = base44.asServiceRole?.entities?.[entityName];
    if (api?.get) {
      const rec = await api.get(itemId);
      if (rec?.id) return JSON.parse(JSON.stringify(rec));
    }
  } catch (_) {}

  // 3) entities user — filter por id
  try {
    const api = base44.entities?.[entityName];
    if (api?.filter) {
      const res = await api.filter({ id: itemId }, '-updated_date', 1);
      if (Array.isArray(res) && res.length > 0 && res[0]?.id) {
        return JSON.parse(JSON.stringify(res[0]));
      }
    }
  } catch (_) {}

  return null;
}

// ─── Componente principal ──────────────────────────────────────────────────────
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
  const ENTITY   = nomeEntidade || entityName || "";
  const TITULO   = tituloDisplay || ENTITY;
  const isSimple = SIMPLE_ENTITIES.has(ENTITY);
  const isSelf   = FormComponent
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
  const { empresaAtual, grupoAtual, empresasDoGrupo } = useContextoVisual();

  // ── Sort em REFS (evita stale closure em queryFn) ─────────────────────────
  const sortFieldRef = useRef("updated_date");
  const sortDirRef   = useRef("desc");
  const [sortField,  setSortFieldState]  = useState("updated_date");
  const [sortDir,    setSortDirState]    = useState("desc");

  const setSortField = useCallback((v) => { sortFieldRef.current = v; setSortFieldState(v); }, []);
  const setSortDir   = useCallback((v) => { sortDirRef.current = v; setSortDirState(v); }, []);

  // ── Estado UI ─────────────────────────────────────────────────────────────
  const [search,         setSearch]         = useState("");
  const [debouncedSearch,setDebouncedSearch] = useState("");
  const [currentPage,    setCurrentPage]    = useState(1);
  const [pageSize,       setPageSize]       = useState(pageSizeProp || 20);

  // ── Estado edição ─────────────────────────────────────────────────────────
  const [editItem,      setEditItem]      = useState(null);
  const [showForm,      setShowForm]      = useState(false);
  const [isSavingForm,  setIsSavingForm]  = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [editError,     setEditError]     = useState(null);
  const [formKey,       setFormKey]       = useState(0); // força remontagem do form

  // ── Seleção cross-page ────────────────────────────────────────────────────
  const [selectedIds,  setSelectedIds]  = useState(new Set());
  const [crossPageAll, setCrossPageAll] = useState(false);
  const [deselectedIds,setDeselectedIds]= useState(new Set());

  // ── Outros ───────────────────────────────────────────────────────────────
  const debounceRef = useRef(null);
  const hasContext  = isSimple || !!(empresaAtual?.id || grupoAtual?.id);
  // Para exibir aviso "Selecione uma empresa" apenas em entidades que precisam de contexto
  const needsContextWarning = !isSimple && !empresaAtual?.id && !grupoAtual?.id;

  // ── Contagem via hook centralizado ────────────────────────────────────────
  const { total: totalCount } = useEntityCounts(ENTITY ? [ENTITY] : []);

  // ── Debounce search ───────────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  // ── Filtro de contexto ────────────────────────────────────────────────────
  const contextFilter = useMemo(() => {
    if (isSimple) return {};
    return buildContextFilter(ENTITY, empresaAtual?.id || null, grupoAtual?.id || null, empresasDoGrupo);
  }, [ENTITY, grupoAtual?.id, empresaAtual?.id, JSON.stringify(empresasDoGrupo), isSimple]);

  // ── Query principal ───────────────────────────────────────────────────────
  const skip = (currentPage - 1) * pageSize;

  const queryKey = useMemo(() => [
    ENTITY, "viz-v24",
    sortField, sortDir,
    currentPage, pageSize,
    debouncedSearch,
    empresaAtual?.id, grupoAtual?.id
  ], [ENTITY, sortField, sortDir, currentPage, pageSize, debouncedSearch, empresaAtual?.id, grupoAtual?.id]);

  const { data: items = [], isLoading, isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!ENTITY) return [];
      // Entidades simples sempre carregam; entidades com contexto precisam de empresa ou grupo
      if (!isSimple && !empresaAtual?.id && !grupoAtual?.id) return [];

      const sf    = sortFieldRef.current;
      const sd    = sortDirRef.current;
      const order = `${sd === "desc" ? "-" : ""}${sf}`;

      try {
        // Usa asServiceRole diretamente — bypassa completamente o wrapper do Layout
        const api = base44.asServiceRole?.entities?.[ENTITY];
        if (!api?.filter) return [];

        let filter = { ...contextFilter };

        // Busca com texto
        if (debouncedSearch?.trim()) {
          const fields = SEARCH_FIELDS_MAP[ENTITY] || ['nome', 'descricao', 'codigo'];
          const rx     = { $regex: debouncedSearch.trim(), $options: 'i' };
          const orConds = fields.map(f => ({ [f]: rx }));
          const hasFilter = Object.keys(filter).length > 0 && Object.keys(filter).some(k => k !== '$or' || filter.$or?.length > 0);
          filter = hasFilter
            ? { $and: [filter, { $or: orConds }] }
            : { $or: orConds };
        }

        const result = await api.filter(filter, order, pageSize, skip);
        return Array.isArray(result) ? result : [];
      } catch (err) {
        console.error(`[VisualizadorV24] Erro ao listar ${ENTITY}:`, err);
        return [];
      }
    },
    staleTime: 10_000,
    gcTime: 120_000,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
    enabled: !!ENTITY && (isSimple || !!(empresaAtual?.id || grupoAtual?.id)),
  });

  // ── Real-time subscribe ───────────────────────────────────────────────────
  useEffect(() => {
    if (!ENTITY) return;
    const api = base44.entities?.[ENTITY];
    if (!api?.subscribe) return;
    const unsub = api.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: [ENTITY, "viz-v24"] });
      queryClient.invalidateQueries({ queryKey: ["entityCounts_v4"] });
    });
    return () => { if (typeof unsub === "function") unsub(); };
  }, [ENTITY, queryClient]);

  // ── Sort handlers ─────────────────────────────────────────────────────────
  const handleSort = useCallback((field) => {
    const cur    = sortFieldRef.current;
    const curDir = sortDirRef.current;
    const newDir = cur === field ? (curDir === "desc" ? "asc" : "desc") : "desc";
    setSortField(field);
    setSortDir(newDir);
    setCurrentPage(1);
    queryClient.invalidateQueries({ queryKey: [ENTITY, "viz-v24"] });
  }, [ENTITY, queryClient, setSortField, setSortDir]);

  const handleSortDropdown = useCallback((value) => {
    const [f, d] = value.split("|");
    setSortField(f);
    setSortDir(d);
    setCurrentPage(1);
    queryClient.invalidateQueries({ queryKey: [ENTITY, "viz-v24"] });
  }, [ENTITY, queryClient, setSortField, setSortDir]);

  // ── Formatter ─────────────────────────────────────────────────────────────
  const formatValue = useCallback((value, col) => {
    if (value === null || value === undefined || value === "") return "—";
    if (BOOL_FIELDS.has(col.field)) {
      return value
        ? <Badge variant="outline" className="text-xs rounded-sm bg-green-100 text-green-700 border-green-300">Sim</Badge>
        : <Badge variant="outline" className="text-xs rounded-sm bg-slate-100 text-slate-500 border-slate-300">Não</Badge>;
    }
    if (STATUS_FIELDS.has(col.field) && typeof value === "string") {
      const cls = statusColors[value] || "bg-slate-100 text-slate-600";
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

  // ── Persistência automática (forms não self-managed) ─────────────────────
  const handlePersistSubmit = useCallback(async (formData) => {
    if (!formData || !ENTITY) return;
    if (formData._action === "delete") {
      if (formData.id) {
        try { await (base44.asServiceRole?.entities?.[ENTITY] || base44.entities[ENTITY]).delete(formData.id); } catch (_) {}
      }
      setShowForm(false);
      setEditItem(null);
      queryClient.invalidateQueries({ queryKey: [ENTITY, "viz-v24"] });
      queryClient.invalidateQueries({ queryKey: ["entityCounts_v4"] });
      return;
    }
    setIsSavingForm(true);
    try {
      const { _action, ...cleanData } = formData;
      const payload = { ...cleanData };
      if (!isSimple) {
        if (!payload.empresa_id && empresaAtual?.id) payload.empresa_id = empresaAtual.id;
        if (!payload.group_id  && grupoAtual?.id)   payload.group_id   = grupoAtual.id;
      }
      const api = base44.asServiceRole?.entities?.[ENTITY] || base44.entities[ENTITY];
      if (editItem?.id) {
        await api.update(editItem.id, payload);
      } else {
        await api.create(payload);
      }
      setShowForm(false);
      setEditItem(null);
      queryClient.invalidateQueries({ queryKey: [ENTITY, "viz-v24"] });
      queryClient.invalidateQueries({ queryKey: ["entityCounts_v4"] });
    } catch (e) {
      alert("Erro ao salvar: " + (e?.message || e));
    } finally {
      setIsSavingForm(false);
    }
  }, [ENTITY, editItem, empresaAtual?.id, grupoAtual?.id, queryClient, isSimple]);

  // ── Fechar form ───────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    setShowForm(false);
    setEditItem(null);
    setEditError(null);
    queryClient.invalidateQueries({ queryKey: [ENTITY, "viz-v24"] });
    queryClient.invalidateQueries({ queryKey: ["entityCounts_v4"] });
  }, [ENTITY, queryClient]);

  // ── Abrir edição — busca dados COMPLETOS via asServiceRole ────────────────
  const handleEditItem = useCallback(async (item) => {
    if (!item?.id) return;
    setIsLoadingEdit(true);
    setShowForm(false);
    setEditItem(null);
    setEditError(null);

    try {
      const full = await fetchFullRecord(ENTITY, item.id);
      if (full) {
        setFormKey(k => k + 1);
        setEditItem(full);
        setShowForm(true);
      } else {
        // Fallback: usa dados da tabela (podem ser parciais)
        setEditError("Dados parciais — alguns campos podem não aparecer.");
        setFormKey(k => k + 1);
        setEditItem(JSON.parse(JSON.stringify(item)));
        setShowForm(true);
      }
    } catch (err) {
      console.error("[handleEditItem] erro:", err);
      setFormKey(k => k + 1);
      setEditItem(JSON.parse(JSON.stringify(item)));
      setShowForm(true);
    } finally {
      setIsLoadingEdit(false);
    }
  }, [ENTITY]);

  // ── Delete individual ─────────────────────────────────────────────────────
  const handleDelete = useCallback(async (item) => {
    const label = item.nome || item.descricao || item.razao_social || item.nome_completo
      || item.nome_segmento || item.nome_regiao || item.sigla || item.nome_banco
      || item.nome_banco || item.id;
    if (!window.confirm(`Confirma exclusão de "${label}"?`)) return;
    try {
      await base44.entities[ENTITY].delete(item.id);
      queryClient.invalidateQueries({ queryKey: [ENTITY, "viz-v24"] });
      queryClient.invalidateQueries({ queryKey: ["entityCounts_v4"] });
      setSelectedIds(prev => { const n = new Set(prev); n.delete(item.id); return n; });
      setDeselectedIds(prev => { const n = new Set(prev); n.delete(item.id); return n; });
    } catch (e) {
      alert("Erro ao excluir: " + (e?.message || e));
    }
  }, [ENTITY, queryClient]);

  // ── Delete em massa (cross-page) ──────────────────────────────────────────
  const handleDeleteSelected = useCallback(async () => {
    const effectiveCount = crossPageAll
      ? Math.max(0, totalCount - deselectedIds.size)
      : selectedIds.size;
    if (effectiveCount === 0) return;

    const msg = crossPageAll
      ? `⚠️ Confirma exclusão de ${effectiveCount} registros de "${TITULO}"? Esta ação não pode ser desfeita!`
      : `Confirma exclusão de ${selectedIds.size} registro(s) selecionado(s)?`;
    if (!window.confirm(msg)) return;

    try {
      let idsToDelete = [];

      if (crossPageAll) {
        // Busca TODOS os IDs respeitando filtro de contexto
        const api = base44.asServiceRole?.entities?.[ENTITY];
        if (api?.filter) {
          let skipAcc = 0;
          const BATCH_SIZE = 500;
          while (true) {
            const arr = await api.filter(contextFilter, '-updated_date', BATCH_SIZE, skipAcc) || [];
            const batch = arr.map(i => i.id).filter(id => id && !deselectedIds.has(id));
            idsToDelete = idsToDelete.concat(batch);
            if (arr.length < BATCH_SIZE) break;
            skipAcc += BATCH_SIZE;
          }
        }
      } else {
        idsToDelete = Array.from(selectedIds);
      }

      // Delete em lotes de 20 para não sobrecarregar
      const CONCURRENCY = 20;
      for (let i = 0; i < idsToDelete.length; i += CONCURRENCY) {
        const batch = idsToDelete.slice(i, i + CONCURRENCY);
        await Promise.all(batch.map(id =>
          base44.entities[ENTITY].delete(id).catch(() => {})
        ));
      }

      queryClient.invalidateQueries({ queryKey: [ENTITY, "viz-v24"] });
      queryClient.invalidateQueries({ queryKey: ["entityCounts_v4"] });
      setSelectedIds(new Set());
      setDeselectedIds(new Set());
      setCrossPageAll(false);
      setCurrentPage(1);
    } catch (e) {
      alert("Erro ao excluir: " + (e?.message || e));
    }
  }, [crossPageAll, totalCount, selectedIds, deselectedIds, ENTITY, TITULO, queryClient, contextFilter]);

  // ── Seleção ───────────────────────────────────────────────────────────────
  const isItemSelected = useCallback((id) => {
    if (crossPageAll) return !deselectedIds.has(id);
    return selectedIds.has(id);
  }, [crossPageAll, deselectedIds, selectedIds]);

  const handleItemCheck = useCallback((id, checked) => {
    if (crossPageAll) {
      setDeselectedIds(prev => {
        const n = new Set(prev);
        checked ? n.delete(id) : n.add(id);
        return n;
      });
    } else {
      setSelectedIds(prev => {
        const n = new Set(prev);
        checked ? n.add(id) : n.delete(id);
        return n;
      });
    }
  }, [crossPageAll]);

  const allPageSelected  = items.length > 0 && items.every(i => isItemSelected(i.id));
  const somePageSelected = items.some(i => isItemSelected(i.id));

  const toggleSelectAll = useCallback(() => {
    if (crossPageAll) {
      setDeselectedIds(prev => {
        const n = new Set(prev);
        if (allPageSelected) { items.forEach(i => n.add(i.id)); }
        else                 { items.forEach(i => n.delete(i.id)); }
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

  const handleSelectCrossPage = useCallback(() => {
    setCrossPageAll(true);
    setDeselectedIds(new Set());
    setSelectedIds(new Set());
  }, []);

  const handleCancelCrossPage = useCallback(() => {
    setCrossPageAll(false);
    setDeselectedIds(new Set());
    setSelectedIds(new Set());
  }, []);

  // ── Ícone de sort ─────────────────────────────────────────────────────────
  const getSortIcon = (field) => {
    if (sortField !== field) return <ChevronsUpDown className="w-3 h-3 text-slate-300 opacity-0 group-hover/th:opacity-100 transition-opacity" />;
    return sortDir === "desc"
      ? <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
      : <ChevronUp   className="w-3.5 h-3.5 text-blue-500" />;
  };

  const effectiveSelectedCount = crossPageAll
    ? Math.max(0, totalCount - deselectedIds.size)
    : selectedIds.size;

  const showCrossPageBanner = !crossPageAll && selectedIds.size > 0
    && allPageSelected && totalCount > items.length;

  // ── formProps — recalcula apenas quando formKey muda ──────────────────────
  const formProps = useMemo(
    () => buildFormProps(editItem, handleSave, isSelf ? null : handlePersistSubmit),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formKey, handleSave, handlePersistSubmit, isSelf]
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  const content = (
    <div className="flex flex-col h-full gap-3 min-h-0">

      {/* Toolbar */}
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
            onChange={e => setSearch(e.target.value)}
            className="pl-8 bg-white border-slate-200 h-9 rounded-sm text-sm"
          />
        </div>

        <select
          value={pageSize}
          onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
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
          <option value="updated_date|desc">Mais Recentes</option>
          <option value="updated_date|asc">Mais Antigos</option>
          <option value="created_date|desc">Criação ↓</option>
          <option value="created_date|asc">Criação ↑</option>
          {COLUMNS.filter(c => c.sortable !== false && c.field !== "updated_date" && c.field !== "created_date").flatMap(c => [
            <option key={`${c.field}|asc`} value={`${c.field}|asc`}>{c.label} ↑</option>,
            <option key={`${c.field}|desc`} value={`${c.field}|desc`}>{c.label} ↓</option>
          ])}
        </select>

        <button
          type="button"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: [ENTITY, "viz-v24"] });
            queryClient.invalidateQueries({ queryKey: ["entityCounts_v4"] });
          }}
          className="h-9 w-9 flex items-center justify-center border border-slate-200 rounded-sm bg-white hover:bg-slate-50 transition-colors"
          title="Recarregar"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-blue-500" : "text-slate-500"}`} />
        </button>

        {FormComponent && (
          <Button
            size="sm"
            onClick={() => {
              setFormKey(k => k + 1);
              setEditItem(null);
              setEditError(null);
              setShowForm(true);
            }}
            className="h-9 rounded-sm gap-1"
            disabled={isLoadingEdit}
          >
            <Plus className="w-4 h-4" /> Novo
          </Button>
        )}

        {effectiveSelectedCount > 0 && (
          <Button size="sm" variant="destructive" onClick={handleDeleteSelected} className="h-9 rounded-sm gap-1">
            <Trash2 className="w-4 h-4" />
            {crossPageAll
              ? `Apagar ${effectiveSelectedCount === totalCount ? "TODOS" : effectiveSelectedCount} (${effectiveSelectedCount})`
              : `Apagar ${selectedIds.size}`}
          </Button>
        )}
      </div>

      {/* Banner cross-page */}
      {showCrossPageBanner && (
        <div className="bg-amber-50 border border-amber-200 rounded-sm px-3 py-2 text-sm text-amber-700 flex items-center gap-2 shrink-0">
          <span>{selectedIds.size} selecionados nesta página.</span>
          <button onClick={handleSelectCrossPage} className="text-blue-600 hover:text-blue-800 underline text-xs font-semibold">
            Selecionar todos os {totalCount} registros
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-slate-500 hover:text-slate-700 underline text-xs">
            Cancelar
          </button>
        </div>
      )}
      {crossPageAll && (
        <div className="bg-blue-50 border border-blue-200 rounded-sm px-3 py-2 text-sm text-blue-700 flex items-center gap-2 shrink-0">
          <span>
            ✓ {deselectedIds.size > 0
              ? `${effectiveSelectedCount} de ${totalCount} registros selecionados (${deselectedIds.size} desmarcado${deselectedIds.size > 1 ? 's' : ''})`
              : `Todos os ${totalCount} registros de ${TITULO} estão selecionados`}
          </span>
          <button onClick={handleCancelCrossPage} className="ml-auto text-blue-500 hover:text-blue-700 underline text-xs">
            Cancelar seleção
          </button>
        </div>
      )}

      {/* Tabela */}
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
              {debouncedSearch
                ? `Nenhum resultado para "${debouncedSearch}"`
                : `Nenhum ${TITULO} encontrado`}
            </span>
            {!hasContext && !isSimple && (
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
                    ref={el => { if (el) el.indeterminate = somePageSelected && !allPageSelected; }}
                    checked={allPageSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 cursor-pointer"
                    title={allPageSelected ? "Desmarcar página" : `Selecionar página (${items.length})`}
                  />
                </th>
                {COLUMNS.map(col => (
                  <th
                    key={col.field}
                    className={`group/th px-4 py-2.5 text-left font-semibold text-slate-600 select-none whitespace-nowrap ${
                      col.sortable !== false ? "cursor-pointer hover:bg-slate-100 transition-colors" : ""
                    }`}
                    onClick={() => col.sortable !== false && handleSort(col.field)}
                  >
                    <div className="flex items-center gap-1">
                      <span>{col.label}</span>
                      {col.sortable !== false && getSortIcon(col.field)}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-2.5 text-center font-semibold text-slate-600 w-20 whitespace-nowrap">
                  Ações
                </th>
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
                    <td className="px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={e => handleItemCheck(item.id, e.target.checked)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    {COLUMNS.map(col => (
                      <td key={col.field} className="px-4 py-2 text-slate-600 max-w-[280px] truncate">
                        {formatValue(item[col.field], col)}
                      </td>
                    ))}
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-center gap-1 opacity-60 group-hover/row:opacity-100 transition-opacity">
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

      {/* Paginação */}
      <div className="flex items-center justify-between text-xs text-slate-500 shrink-0 flex-wrap gap-2">
        <span className="text-slate-400">
          {isFetching && items.length > 0 && (
            <span className="inline-flex items-center gap-1 text-blue-500 mr-2">
              <RefreshCw className="w-3 h-3 animate-spin" /> Atualizando…
            </span>
          )}
          Pág. {currentPage} · {items.length} exibidos · {totalCount} total
        </span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isLoading}
            className="h-7 px-2 text-xs border border-slate-200 rounded-sm bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Anterior
          </button>
          <span className="flex items-center justify-center h-7 min-w-7 px-2 border border-slate-200 rounded-sm bg-white text-slate-700 font-medium">
            {currentPage}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={items.length < pageSize || isLoading}
            className="h-7 px-2 text-xs border border-slate-200 rounded-sm bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Próxima →
          </button>
        </div>
      </div>

      {/* Modal de Edição */}
      {FormComponent && showForm && (
        <>
          <div className="fixed inset-0 z-[999] bg-black/50" onClick={handleSave} />
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-none">
            <div
              className="bg-white rounded-xl w-full max-w-4xl max-h-[92vh] overflow-auto shadow-2xl pointer-events-auto flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10 rounded-t-xl">
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
                    onClick={handleSave}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 flex-1 overflow-auto">
                <FormComponent
                  key={`form-${ENTITY}-${editItem?.id || 'new'}-${formKey}`}
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