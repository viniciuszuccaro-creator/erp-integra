/**
 * VisualizadorUniversalEntidadeV24 — V32 CORRIGIDO
 *
 * CORREÇÕES V32:
 * 1. BOTÃO EDITAR → sempre visível (removido opacity-0/group-hover que dependia de Tailwind JIT)
 * 2. ORDENAÇÃO → sort local como fallback para campos não-date
 * 3. CONTAGENS → canFetch sem exigir contexto, buildContextFilter retorna {}
 * 4. EDITAR EM BRANCO → fetchFullRecord mais robusto + fallback garantido
 * 5. EXCLUSÃO EM MASSA → crossPage funciona com totalCount correto
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import useEntityCounts, { SIMPLE_CATALOG, buildContextFilter } from "@/components/lib/useEntityCounts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronUp, ChevronDown, ChevronsUpDown,
  Search, Edit, Trash2, Plus, RefreshCw, AlertCircle, X
} from "lucide-react";

// ─── constantes visuais ───────────────────────────────────────────────────────
const STATUS_COLORS = {
  Ativo:"bg-green-100 text-green-700 border-green-200",
  Ativa:"bg-green-100 text-green-700 border-green-200",
  Aprovado:"bg-green-100 text-green-700 border-green-200",
  OK:"bg-green-100 text-green-700 border-green-200",
  Pago:"bg-green-100 text-green-700 border-green-200",
  Recebido:"bg-green-100 text-green-700 border-green-200",
  "Em Análise":"bg-blue-100 text-blue-700 border-blue-200",
  Pendente:"bg-yellow-100 text-yellow-700 border-yellow-200",
  Prospect:"bg-yellow-100 text-yellow-700 border-yellow-200",
  Alerta:"bg-yellow-100 text-yellow-700 border-yellow-200",
  Inativo:"bg-slate-100 text-slate-500 border-slate-200",
  Inativa:"bg-slate-100 text-slate-500 border-slate-200",
  Bloqueado:"bg-red-100 text-red-700 border-red-200",
  Cancelado:"bg-red-100 text-red-700 border-red-200",
  Atrasado:"bg-red-100 text-red-700 border-red-200",
  Descontinuado:"bg-orange-100 text-orange-700 border-orange-200",
};
const STATUS_FIELDS = new Set(["status","status_fornecedor","status_cliente","situacao","situacao_credito","status_fiscal_receita"]);
const BOOL_FIELDS   = new Set(["ativo","ativa","habilitado","compartilhado_grupo","ativo_sistema","principal","ativado"]);
const DATE_FIELDS   = new Set(["created_date","updated_date","data_admissao","data_nascimento","data_vencimento","data_validade","ultima_compra","data_emissao","data_pedido","cnh_validade","data_aprovacao","data_inicio","data_fim"]);
const MONEY_FIELDS  = new Set(["salario","preco_venda","custo_aquisicao","custo_medio","valor_frete","orcamento_mensal","limite_credito","valor_total","valor","valor_minimo","valor_maximo","percentual_comissao"]);
const PAGE_SIZES = [10, 20, 50, 100];
// Campos que o backend suporta ordenação nativa
const BACKEND_SORT_FIELDS = new Set(["updated_date","created_date","id"]);

const SEARCH_FIELDS = {
  Banco:["nome","nome_banco","codigo_banco"],
  FormaPagamento:["nome","descricao","codigo"],
  Cliente:["nome","razao_social","cpf","cnpj"],
  Fornecedor:["nome","razao_social","cnpj"],
  Colaborador:["nome_completo","cpf","email","cargo"],
  Transportadora:["razao_social","nome_fantasia","cnpj"],
  Produto:["descricao","codigo","codigo_barras"],
  Departamento:["nome","descricao"],
  Cargo:["nome","departamento"],
  Turno:["descricao","nome"],
  Veiculo:["placa","descricao","modelo"],
  Motorista:["nome","cpf"],
  Servico:["nome","descricao"],
  Representante:["nome","email"],
  SegmentoCliente:["nome_segmento","descricao"],
  RegiaoAtendimento:["nome_regiao","descricao"],
  GrupoProduto:["nome_grupo","descricao","codigo"],
  Marca:["nome_marca","descricao"],
  SetorAtividade:["nome","descricao"],
  TabelaPreco:["nome","descricao"],
  UnidadeMedida:["sigla","descricao"],
  CentroCusto:["codigo","descricao"],
  PlanoDeContas:["codigo","descricao"],
  TipoDespesa:["codigo","nome"],
  MoedaIndice:["moeda","indice","descricao"],
  GrupoEmpresarial:["nome","cnpj"],
  Empresa:["razao_social","nome_fantasia","cnpj"],
  ApiExterna:["nome","descricao"],
  ChatbotCanal:["nome"],
  ChatbotIntent:["nome","descricao"],
  GatewayPagamento:["nome"],
  JobAgendado:["nome"],
  Webhook:["nome","url"],
  ConfiguracaoNFe:["ambiente","descricao"],
  LocalEstoque:["descricao","codigo"],
  RotaPadrao:["nome_rota","regiao"],
  ModeloDocumento:["tipo","descricao"],
  TipoFrete:["descricao","modalidade"],
  CentroResultado:["codigo","descricao"],
  OperadorCaixa:["nome","matricula"],
  CondicaoComercial:["nome"],
  TabelaFiscal:["descricao","uf"],
  ContatoB2B:["nome","empresa","email"],
  KitProduto:["nome_kit","descricao"],
  CatalogoWeb:["titulo","slug"],
  ConfiguracaoDespesaRecorrente:["descricao"],
  PerfilAcesso:["nome_perfil","descricao"],
};

// Forms com save/delete próprio
const SELF_MANAGED_NAMES = new Set([
  "CadastroClienteCompleto","CadastroFornecedorCompleto","TransportadoraForm",
  "ColaboradorForm","RepresentanteFormCompleto","RepresentanteForm",
  "ProdutoFormV22_Completo","ProdutoFormCompleto","ProdutoForm","RegiaoAtendimentoForm",
  "ContatoB2BForm","SegmentoClienteForm",
]);

// Todos os aliases de prop possíveis para o item editado
const FORM_ALIASES = [
  "item","data","initialData","defaultValues","record","entity","value",
  "cliente","fornecedor","colaborador","transportadora","representante",
  "contato","contatoB2B","segmento","segmentoCliente","regiao","regiaoAtendimento",
  "produto","servico","banco","conta","formaPagamento","centroCusto","planoContas",
  "planoDeContas","veiculo","motorista","departamento","cargo","turno",
  "empresa","grupo","grupoEmpresarial","grupoProduto","marca","kitProduto",
  "catalogoWeb","unidade","unidadeMedida","setor","setorAtividade","tabelaPreco",
  "tipoDespesa","moedaIndice","moeda","operadorCaixa","operador",
  "tabelaFiscal","condicaoComercial","centroResultado","centro",
  "localEstoque","local","tipoFrete","rotaPadrao","rota",
  "gateway","gatewayPagamento","configuracaoDespesaRecorrente","despesaRecorrente",
  "perfilAcesso","perfil","modeloDocumento","apiExterna",
  "webhook","chatbotIntent","chatbotCanal","jobAgendado","eventoNotificacao",
];

// ─── helpers ──────────────────────────────────────────────────────────────────
function fmtValue(value, col, extraColors = {}) {
  if (value === null || value === undefined || value === "") return <span className="text-slate-300 text-xs">—</span>;
  const allColors = { ...STATUS_COLORS, ...extraColors };
  if (BOOL_FIELDS.has(col.field))
    return value
      ? <Badge variant="outline" className="text-xs rounded-sm bg-green-100 text-green-700 border-green-200">Sim</Badge>
      : <Badge variant="outline" className="text-xs rounded-sm bg-slate-100 text-slate-500 border-slate-200">Não</Badge>;
  if (STATUS_FIELDS.has(col.field) && typeof value === "string") {
    const cls = allColors[value] || "bg-slate-100 text-slate-600 border-slate-200";
    return <Badge variant="outline" className={`text-xs rounded-sm ${cls}`}>{value}</Badge>;
  }
  if (DATE_FIELDS.has(col.field) || col.type === "date") {
    try { const d = new Date(value); if (!isNaN(d.getTime())) return d.toLocaleDateString("pt-BR"); } catch {}
  }
  if (MONEY_FIELDS.has(col.field) || col.type === "currency") {
    const n = Number(value);
    if (!isNaN(n)) return n.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
  }
  if (col.type === "number") { const n = Number(value); return isNaN(n) ? String(value) : n.toLocaleString("pt-BR"); }
  if (typeof value === "boolean") return value ? "✓" : "—";
  if (typeof value === "object") return Array.isArray(value) ? `[${value.length}]` : "–";
  return String(value).substring(0, 130);
}

// Sort local para campos não suportados nativamente pelo backend
function localSort(arr, field, dir) {
  if (!arr || !arr.length || !field) return arr;
  return [...arr].sort((a, b) => {
    const va = a[field] ?? "";
    const vb = b[field] ?? "";
    if (typeof va === "number" && typeof vb === "number") return dir === "asc" ? va - vb : vb - va;
    const sa = String(va).toLowerCase();
    const sb = String(vb).toLowerCase();
    if (sa < sb) return dir === "asc" ? -1 : 1;
    if (sa > sb) return dir === "asc" ? 1 : -1;
    return 0;
  });
}

// Busca registro completo — 3 estratégias
async function fetchFullRecord(entityName, itemId) {
  if (!entityName || !itemId) return null;

  // Estratégia 1: função backend getEntityRecord (asServiceRole, sem filtros)
  try {
    const res = await base44.functions.invoke("getEntityRecord", { entityName, id: itemId });
    const rec = res?.data?.record || res?.data;
    if (rec && rec.id) return JSON.parse(JSON.stringify(rec));
  } catch (_) {}

  // Estratégia 2: entityListSorted com filtro por id
  try {
    const res = await base44.functions.invoke("entityListSorted", {
      entityName, filter: { id: itemId }, sortField: "id", sortDirection: "asc", limit: 1, skip: 0,
    });
    const arr = Array.isArray(res?.data) ? res.data : [];
    if (arr[0]?.id) return JSON.parse(JSON.stringify(arr[0]));
  } catch (_) {}

  // Estratégia 3: SDK direto
  try {
    const api = base44.entities?.[entityName];
    if (typeof api?.get === "function") {
      const rec = await api.get(itemId);
      if (rec?.id) return JSON.parse(JSON.stringify(rec));
    }
    if (typeof api?.filter === "function") {
      const recs = await api.filter({ id: itemId }, "-id", 1);
      if (Array.isArray(recs) && recs[0]?.id) return JSON.parse(JSON.stringify(recs[0]));
    }
  } catch (_) {}

  return null;
}

function buildFormProps(editItem, onClose, onSubmit) {
  const base = {
    onClose, onSave: onClose, onSuccess: onClose,
    onOpenChange: (v) => { if (!v) onClose(); },
    isOpen: true, open: true, windowMode: true, onSubmit,
  };
  if (!editItem) return base;
  const aliases = {};
  FORM_ALIASES.forEach(a => { aliases[a] = editItem; });
  return { ...base, ...aliases, id: editItem.id };
}

function invalidateAll(qc, entity) {
  // Invalida e faz refetch imediato de todas as páginas/ordenações desta entidade
  qc.invalidateQueries({ queryKey: ["viz-v32", entity], refetchType: "all" });
  qc.invalidateQueries({ queryKey: ["entityCounts_v5"], refetchType: "active" });
  qc.invalidateQueries({ queryKey: ["cadastros-all-counts"], refetchType: "active" });
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────
export default function VisualizadorUniversalEntidadeV24({
  nomeEntidade, tituloDisplay, icone: IconeProp,
  camposPrincipais = [], componenteEdicao: FormComponent,
  windowMode = false, entityName, columns,
  pageSize: pageSizeProp = 20,
  statusColors: extraColors = {},
}) {
  const ENTITY  = nomeEntidade || entityName || "";
  const TITULO  = tituloDisplay || ENTITY;
  const isSimple = SIMPLE_CATALOG.has(ENTITY);
  const isSelfManaged = useMemo(() => {
    if (!FormComponent) return false;
    const name = FormComponent?.displayName || FormComponent?.name || "";
    return SELF_MANAGED_NAMES.has(name);
  }, [FormComponent]);

  const queryClient = useQueryClient();
  const { empresaAtual, grupoAtual, empresasDoGrupo } = useContextoVisual();
  const empresaId = empresaAtual?.id || null;
  const groupId   = grupoAtual?.id   || null;

  const COLUMNS = useMemo(() => {
    if (columns?.length > 0) return columns;
    if (camposPrincipais?.length > 0)
      return camposPrincipais.map(c => ({
        field: c,
        label: c.replace(/_/g," ").replace(/\b\w/g, x => x.toUpperCase()),
        sortable: true,
      }));
    return [{ field:"nome", label:"Nome", sortable:true }, { field:"status", label:"Status", sortable:false }];
  }, [JSON.stringify(columns), JSON.stringify(camposPrincipais)]); // eslint-disable-line

  // ── estado ──────────────────────────────────────────────────────────────────
  const [sortField, setSortField] = useState("updated_date");
  const [sortDir,   setSortDir]   = useState("desc");
  const [search,    setSearch]    = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeProp);

  const [showForm,     setShowForm]     = useState(false);
  const [editItem,     setEditItem]     = useState(null);
  const [formKey,      setFormKey]      = useState(0);
  const [isLoadingEdit,setIsLoadingEdit]= useState(false);
  const [editError,    setEditError]    = useState(null);
  const [isSaving,     setIsSaving]     = useState(false);

  // Seleção multi-página
  const [selectedIds,  setSelectedIds]  = useState(() => new Set());
  const [crossPageAll, setCrossPageAll] = useState(false);
  const [deselectedIds,setDeselectedIds]= useState(() => new Set());

  // lastGoodData: evita mostrar [] durante refetch
  const lastGoodData = useRef([]);

  // Debounce busca
  const debRef = useRef(null);
  useEffect(() => {
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(debRef.current);
  }, [search]);

  // Contagem
  const { counts, isLoading: countsLoading } = useEntityCounts(ENTITY ? [ENTITY] : []);
  const totalCount = Number(counts[ENTITY] || 0);

  const skip = (page - 1) * pageSize;

  // Filtro de contexto: nunca null
  const readFilter = useMemo(() => {
    if (isSimple) return {};
    if (!empresaId && !groupId) return {};
    return buildContextFilter(ENTITY, empresaId, groupId, empresasDoGrupo) ?? {};
  }, [ENTITY, isSimple, empresaId, groupId, empresasDoGrupo]); // eslint-disable-line

  // Para sort, enviamos ao backend apenas campos suportados nativamente
  const backendSortField = BACKEND_SORT_FIELDS.has(sortField) ? sortField : "updated_date";
  const backendSortDir   = BACKEND_SORT_FIELDS.has(sortField) ? sortDir : "desc";

  const queryKey = useMemo(
    () => ["viz-v32", ENTITY, sortField, sortDir, page, pageSize, debouncedSearch, empresaId, groupId],
    [ENTITY, sortField, sortDir, page, pageSize, debouncedSearch, empresaId, groupId]
  );

  // ── query principal ──────────────────────────────────────────────────────────
  const { data: rawItems, isLoading, isFetching, isError, status } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!ENTITY) return [];

      let filter = { ...readFilter };

      if (debouncedSearch?.trim()) {
        const fields = SEARCH_FIELDS[ENTITY] || ["nome","descricao"];
        const rx = { $regex: debouncedSearch.trim(), $options: "i" };
        const searchOr = { $or: fields.map(f => ({ [f]: rx })) };
        if (filter.$or) {
          filter = { $and: [{ $or: filter.$or }, searchOr] };
        } else {
          filter = { ...filter, ...searchOr };
        }
      }

      const res = await base44.functions.invoke("entityListSorted", {
        entityName: ENTITY,
        filter,
        sortField: backendSortField,
        sortDirection: backendSortDir,
        limit: pageSize,
        skip,
      });
      const fetched = Array.isArray(res?.data) ? res.data : [];

      if (!BACKEND_SORT_FIELDS.has(sortField) && fetched.length > 0) {
        return localSort(fetched, sortField, sortDir);
      }
      return fetched;
    },
    staleTime: 10_000,
    gcTime: 300_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(500 * (attempt + 1), 2000),
    refetchOnWindowFocus: false,
    // Mantém dados da query ANTERIOR enquanto nova query carrega (evita lista sumir ao trocar sort/page/pageSize)
    placeholderData: (previousData) => previousData,
    enabled: !!ENTITY,
  });

  // items: regra absoluta — NUNCA mostra vazio enquanto há fetch ativo
  const items = useMemo(() => {
    // Com fetch em andamento: prefere rawItems (placeholderData) ou cache anterior
    if (isFetching) {
      if (Array.isArray(rawItems) && rawItems.length > 0) {
        lastGoodData.current = rawItems;
        return rawItems;
      }
      // Mantém dados anteriores enquanto busca — evita piscar lista
      if (lastGoodData.current.length > 0) return lastGoodData.current;
      return []; // Primeiro carregamento sem dados anteriores
    }
    // Erro: mantém último estado válido em vez de mostrar tela em branco
    if (isError) return lastGoodData.current;
    // Dados frescos recebidos
    if (Array.isArray(rawItems)) {
      lastGoodData.current = rawItems;
      return rawItems;
    }
    return lastGoodData.current;
  }, [rawItems, isFetching, isError]);

  // Reset cache ao mudar entidade/contexto
  useEffect(() => { lastGoodData.current = []; }, [ENTITY, empresaId, groupId]);

  // Subscribe para invalidar ao detectar writes externos
  useEffect(() => {
    if (!ENTITY) return;
    const api = base44.entities?.[ENTITY];
    if (!api?.subscribe) return;
    const unsub = api.subscribe(() => invalidateAll(queryClient, ENTITY));
    return () => { if (typeof unsub === "function") unsub(); };
  }, [ENTITY, queryClient]);

  // ── ordenação ────────────────────────────────────────────────────────────────
  const handleSort = useCallback((field) => {
    setSortDir(prev => sortField === field ? (prev === "desc" ? "asc" : "desc") : "asc");
    setSortField(field);
    setPage(1);
  }, [sortField]);

  const handleSortDropdown = useCallback((value) => {
    const idx = value.lastIndexOf("|");
    if (idx < 0) return;
    setSortField(value.slice(0, idx));
    setSortDir(value.slice(idx + 1));
    setPage(1);
  }, []);

  // ── formulário ───────────────────────────────────────────────────────────────
  const handleCloseForm = useCallback((wasSaved = false) => {
    setShowForm(false);
    setEditItem(null);
    setEditError(null);
    // Após salvar: volta para pag 1 com sort por mais recente (novo aparece no topo)
    if (wasSaved) {
      setSortField("updated_date");
      setSortDir("desc");
      setPage(1);
    }
    invalidateAll(queryClient, ENTITY);
  }, [ENTITY, queryClient]);

  const handlePersistSubmit = useCallback(async (formData) => {
    if (!formData || !ENTITY) return;
    if (formData._action === "delete") {
      if (formData.id) { try { await base44.entities[ENTITY].delete(formData.id); } catch (_) {} }
      handleCloseForm(); return;
    }
    setIsSaving(true);
    try {
      const { _action, ...clean } = { ...formData };
      if (!isSimple) {
        if (!clean.empresa_id && empresaId) clean.empresa_id = empresaId;
        if (!clean.group_id  && groupId)   clean.group_id   = groupId;
      }
      if (editItem?.id) await base44.entities[ENTITY].update(editItem.id, clean);
      else              await base44.entities[ENTITY].create(clean);
      handleCloseForm(true); // wasSaved=true: vai para pag 1 + sort recente
    } catch (e) { alert("Erro ao salvar: " + (e?.message || String(e))); }
    finally { setIsSaving(false); }
  }, [ENTITY, editItem, empresaId, groupId, handleCloseForm, isSimple]);

  const handleNewItem = useCallback(() => {
    setEditItem(null); setEditError(null);
    setFormKey(k => k + 1); setShowForm(true);
  }, []);

  const handleEditItem = useCallback((item) => {
    if (!item?.id) return;
    // entityListSorted já retorna objetos completos — sem necessidade de re-fetch
    setEditItem(JSON.parse(JSON.stringify(item)));
    setEditError(null);
    setIsLoadingEdit(false);
    setFormKey(k => k + 1);
    setShowForm(true);
  }, []);

  const formProps = useMemo(
    () => buildFormProps(editItem, handleCloseForm, isSelfManaged ? handleCloseForm : handlePersistSubmit),
    [editItem, handleCloseForm, isSelfManaged, handlePersistSubmit]
  );

  // ── exclusão unitária ────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (item) => {
    const label = item.nome || item.razao_social || item.nome_completo || item.descricao || item.id;
    if (!window.confirm(`Confirmar exclusão de "${label}"?`)) return;
    try { await base44.entities[ENTITY].delete(item.id); }
    catch (e) { alert("Erro: " + (e?.message || String(e))); return; }
    setSelectedIds(prev => { const n = new Set(prev); n.delete(item.id); return n; });
    if (items.length <= 1 && page > 1) setPage(p => Math.max(1, p - 1));
    invalidateAll(queryClient, ENTITY);
  }, [ENTITY, queryClient, items.length, page]);

  // ── exclusão em massa ────────────────────────────────────────────────────────
  const handleDeleteSelected = useCallback(async () => {
    const effCount = crossPageAll
      ? Math.max(0, totalCount - deselectedIds.size)
      : selectedIds.size;
    if (effCount === 0) return;

    const msg = crossPageAll && effCount > items.length
      ? `⚠️ Isso irá excluir ${effCount} registro(s) PERMANENTEMENTE em todas as páginas!\nDeseja continuar?`
      : `Confirmar exclusão de ${effCount} registro(s)?`;
    if (!window.confirm(msg)) return;

    try {
      let idsToDelete = [];
      if (crossPageAll) {
        let skipAcc = 0;
        while (true) {
          const res = await base44.functions.invoke("entityListSorted", {
            entityName: ENTITY,
            filter: readFilter,
            sortField: "id", sortDirection: "asc",
            limit: 500, skip: skipAcc,
          });
          const arr = Array.isArray(res?.data) ? res.data : [];
          if (!arr.length) break;
          arr.forEach(i => { if (i.id && !deselectedIds.has(i.id)) idsToDelete.push(i.id); });
          if (arr.length < 500) break;
          skipAcc += 500;
        }
      } else {
        idsToDelete = Array.from(selectedIds);
      }

      if (!idsToDelete.length) { alert("Nenhum registro encontrado para excluir."); return; }

      for (let i = 0; i < idsToDelete.length; i += 20) {
        await Promise.all(
          idsToDelete.slice(i, i + 20).map(id =>
            base44.entities[ENTITY].delete(id).catch(() => {})
          )
        );
      }
    } catch (e) { alert("Erro ao excluir: " + (e?.message || String(e))); return; }

    setSelectedIds(new Set()); setDeselectedIds(new Set());
    setCrossPageAll(false); setPage(1);
    // Não resetar lastGoodData aqui — placeholderData mantém visível até refetch concluir
    invalidateAll(queryClient, ENTITY);
  }, [ENTITY, crossPageAll, totalCount, selectedIds, deselectedIds, readFilter, queryClient, items.length]);

  // ── seleção ──────────────────────────────────────────────────────────────────
  const isItemSelected = useCallback((id) =>
    crossPageAll ? !deselectedIds.has(id) : selectedIds.has(id),
    [crossPageAll, deselectedIds, selectedIds]);

  const handleItemCheck = useCallback((id, checked) => {
    if (crossPageAll) {
      setDeselectedIds(prev => { const n = new Set(prev); checked ? n.delete(id) : n.add(id); return n; });
    } else {
      setSelectedIds(prev => { const n = new Set(prev); checked ? n.add(id) : n.delete(id); return n; });
    }
  }, [crossPageAll]);

  const allPageSelected  = items.length > 0 && items.every(i => isItemSelected(i.id));
  const somePageSelected = items.some(i => isItemSelected(i.id));

  const handleToggleSelectPage = useCallback(() => {
    if (crossPageAll) {
      setDeselectedIds(prev => {
        const n = new Set(prev);
        if (allPageSelected) items.forEach(i => n.add(i.id));
        else items.forEach(i => n.delete(i.id));
        return n;
      });
    } else if (allPageSelected) {
      setSelectedIds(prev => { const n = new Set(prev); items.forEach(i => n.delete(i.id)); return n; });
    } else {
      setSelectedIds(prev => { const n = new Set(prev); items.forEach(i => n.add(i.id)); return n; });
    }
  }, [crossPageAll, allPageSelected, items]);

  const handleActivateCrossPage = useCallback(() => {
    setCrossPageAll(true); setDeselectedIds(new Set()); setSelectedIds(new Set());
  }, []);
  const handleCancelSelection = useCallback(() => {
    setCrossPageAll(false); setDeselectedIds(new Set()); setSelectedIds(new Set());
  }, []);

  const getSortIcon = (field) => {
    if (sortField !== field)
      return <ChevronsUpDown className="w-3 h-3 text-slate-400" />;
    return sortDir === "desc"
      ? <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
      : <ChevronUp className="w-3.5 h-3.5 text-blue-500" />;
  };

  const effSelectedCount = crossPageAll ? Math.max(0, totalCount - deselectedIds.size) : selectedIds.size;
  const showCrossPageBanner = !crossPageAll && selectedIds.size > 0 && allPageSelected && totalCount > items.length;

  // ─── RENDER ───────────────────────────────────────────────────────────────────
  const content = (
    <div className="flex flex-col h-full gap-2 min-h-0 w-full">

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap shrink-0">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-sm font-semibold text-slate-700 truncate max-w-[160px]">{TITULO}:</span>
          <Badge variant="outline" className="rounded-sm bg-blue-50 text-blue-700 border-blue-200 font-bold tabular-nums min-w-[32px] text-center">
            {countsLoading && totalCount === 0
              ? <span className="animate-pulse text-[10px]">···</span>
              : totalCount.toLocaleString("pt-BR")}
          </Badge>
        </div>

        <div className="relative flex-1 min-w-[120px]">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-8 h-9 rounded-sm text-sm bg-white border-slate-200" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
          className="border border-slate-200 rounded-sm h-9 px-2 text-sm text-slate-700 bg-white cursor-pointer shrink-0">
          {PAGE_SIZES.map(ps => <option key={ps} value={ps}>{ps}/pág</option>)}
        </select>

        <select value={`${sortField}|${sortDir}`} onChange={e => handleSortDropdown(e.target.value)}
          className="border border-slate-200 rounded-sm h-9 px-2 text-sm text-slate-700 bg-white cursor-pointer shrink-0">
          <option value="updated_date|desc">↓ Mais Recentes</option>
          <option value="updated_date|asc">↑ Mais Antigos</option>
          <option value="created_date|desc">↓ Criação (novo)</option>
          <option value="created_date|asc">↑ Criação (antigo)</option>
          {COLUMNS.filter(c => c.sortable !== false && !["updated_date","created_date"].includes(c.field))
            .flatMap(c => [
              <option key={`${c.field}|asc`}  value={`${c.field}|asc`}>{c.label} ↑</option>,
              <option key={`${c.field}|desc`} value={`${c.field}|desc`}>{c.label} ↓</option>,
            ])}
        </select>

        <button type="button" onClick={() => { lastGoodData.current = []; invalidateAll(queryClient, ENTITY); }}
          className="h-9 w-9 flex items-center justify-center border border-slate-200 rounded-sm bg-white hover:bg-slate-50 shrink-0">
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-blue-500" : "text-slate-500"}`} />
        </button>

        {FormComponent && (
          <Button size="sm" onClick={handleNewItem} className="h-9 rounded-sm gap-1 shrink-0">
            <Plus className="w-4 h-4" /> Novo
          </Button>
        )}

        {effSelectedCount > 0 && (
          <Button size="sm" variant="destructive" onClick={handleDeleteSelected} className="h-9 rounded-sm gap-1 shrink-0">
            <Trash2 className="w-4 h-4" />
            Excluir {effSelectedCount >= totalCount && totalCount > 0 ? "TODOS" : effSelectedCount}
          </Button>
        )}
      </div>

      {/* Banner cross-page */}
      {showCrossPageBanner && (
        <div className="bg-amber-50 border border-amber-200 rounded-sm px-3 py-1.5 text-xs text-amber-800 flex items-center gap-2 flex-wrap shrink-0">
          <span className="font-medium">{selectedIds.size} selecionados nesta página.</span>
          <button onClick={handleActivateCrossPage} className="text-blue-600 hover:text-blue-800 underline font-semibold">
            Selecionar todos os {totalCount} registros
          </button>
          <button onClick={handleCancelSelection} className="ml-auto text-slate-500 underline">Cancelar</button>
        </div>
      )}
      {crossPageAll && (
        <div className="bg-blue-50 border border-blue-200 rounded-sm px-3 py-1.5 text-xs text-blue-700 flex items-center gap-2 flex-wrap shrink-0">
          <span>✓ {deselectedIds.size > 0
            ? `${effSelectedCount} de ${totalCount} selecionados (${deselectedIds.size} desmarcado${deselectedIds.size > 1 ? "s" : ""})`
            : `Todos os ${totalCount} registros selecionados`}</span>
          <button onClick={handleCancelSelection} className="ml-auto text-blue-500 underline">Cancelar seleção</button>
        </div>
      )}

      {/* Tabela */}
      <div className="flex-1 overflow-auto rounded-sm border border-slate-200 bg-white min-h-0 relative">
        {isFetching && items.length > 0 && (
          <div className="absolute top-0 right-0 z-20 bg-blue-500/10 text-blue-600 text-[10px] px-2 py-0.5 flex items-center gap-1 rounded-bl">
            <RefreshCw className="w-2.5 h-2.5 animate-spin" /> atualizando…
          </div>
        )}
        {isError && items.length > 0 && (
          <div className="absolute top-0 right-0 z-20 bg-red-500/10 text-red-600 text-[10px] px-2 py-0.5 flex items-center gap-1 rounded-bl">
            <AlertCircle className="w-2.5 h-2.5" /> erro — exibindo cache
            <button className="underline ml-1" onClick={() => invalidateAll(queryClient, ENTITY)}>recarregar</button>
          </div>
        )}

        {isError && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-red-500 gap-2">
            <AlertCircle className="w-7 h-7" />
            <span className="text-sm">Erro ao carregar. <button className="underline" onClick={() => { lastGoodData.current = []; invalidateAll(queryClient, ENTITY); }}>Tentar novamente</button></span>
          </div>
        ) : isLoading && items.length === 0 ? (
          <div className="space-y-1.5 p-3">
            {[...Array(8)].map((_,i) => <Skeleton key={i} className={`h-8 rounded-sm ${i%3===0?"w-3/4":"w-full"}`} />)}
          </div>
        ) : items.length === 0 ? (
          <table className="w-full text-sm table-auto">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
              <tr>
                <th className="px-3 py-2.5 text-center w-8">
                  <input type="checkbox"
                    ref={el => { if (el) el.indeterminate = somePageSelected && !allPageSelected; }}
                    checked={allPageSelected} onChange={handleToggleSelectPage}
                    className="w-4 h-4 cursor-pointer accent-blue-600" />
                </th>
                {COLUMNS.map(col => (
                  <th key={col.field}
                    className={`px-3 py-2.5 text-left font-semibold text-slate-600 whitespace-nowrap select-none
                      ${col.sortable !== false ? "cursor-pointer hover:bg-slate-100 transition-colors" : ""}`}
                    onClick={() => col.sortable !== false && handleSort(col.field)}>
                    <div className="flex items-center gap-1">
                      <span>{col.label}</span>
                      {col.sortable !== false && getSortIcon(col.field)}
                    </div>
                  </th>
                ))}
                <th className="px-3 py-2.5 text-center w-20 font-semibold text-slate-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map(item => {
                const checked = isItemSelected(item.id);
                return (
                  <tr key={item.id}
                    className={`transition-colors hover:bg-blue-50/30 ${checked ? "bg-blue-50/40" : ""}`}>
                    <td className="px-3 py-2 text-center">
                      <input type="checkbox" checked={checked}
                        onChange={e => handleItemCheck(item.id, e.target.checked)}
                        className="w-4 h-4 cursor-pointer accent-blue-600" />
                    </td>
                    {COLUMNS.map(col => (
                      <td key={col.field} className="px-3 py-2 text-slate-600 max-w-[240px] truncate">
                        {fmtValue(item[col.field], col, extraColors)}
                      </td>
                    ))}
                    {/* ── Botões de ação: SEMPRE VISÍVEIS (sem opacity-0) ── */}
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1">
                        {FormComponent && (
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); handleEditItem(item); }}
                            title="Editar"
                            disabled={isLoadingEdit}
                            className="h-7 w-7 flex items-center justify-center rounded-sm text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-40"
                          >
                            {isLoadingEdit ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Edit className="w-3.5 h-3.5" />
                            )}
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
      <div className="flex items-center justify-between text-xs text-slate-500 shrink-0 flex-wrap gap-1">
        <span>Pág. {page} · {items.length} exibidos · {totalCount} total</span>
        <div className="flex gap-1">
          <button type="button" onClick={() => setPage(1)} disabled={page===1||isLoading}
            className="h-7 px-2 border border-slate-200 rounded-sm bg-white hover:bg-slate-50 disabled:opacity-40">«</button>
          <button type="button" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1||isLoading}
            className="h-7 px-2 border border-slate-200 rounded-sm bg-white hover:bg-slate-50 disabled:opacity-40">← Ant.</button>
          <span className="flex items-center justify-center h-7 px-2 border border-slate-200 rounded-sm bg-white font-semibold text-slate-700">{page}</span>
          <button type="button" onClick={() => setPage(p => p+1)} disabled={items.length < pageSize || isLoading}
            className="h-7 px-2 border border-slate-200 rounded-sm bg-white hover:bg-slate-50 disabled:opacity-40">Próx. →</button>
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
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl shrink-0 z-10">
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
                  {isSaving && (
                    <span className="text-xs text-blue-600 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Salvando…
                    </span>
                  )}
                  {isLoadingEdit && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Carregando dados…
                    </span>
                  )}
                  <button type="button" onClick={handleCloseForm}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 flex-1 overflow-auto">
                <FormComponent
                  key={`form-${ENTITY}-${editItem?.id ?? "new"}-${formKey}`}
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
  return <div className="flex flex-col flex-1 min-h-0 h-full w-full">{content}</div>;
}