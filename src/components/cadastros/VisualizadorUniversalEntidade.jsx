/**
 * VisualizadorUniversalEntidade — versão refatorada completa
 * Performance máxima: busca debounced, ordenação server-side sem travar,
 * paginação fluida, atualização em tempo real via subscribe, visual moderno.
 */
import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useWindow } from "@/components/lib/useWindow";
import usePermissions from "@/components/lib/usePermissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search, Plus, RefreshCw, ArrowUp, ArrowDown, ArrowUpDown,
  Edit, Trash2, ChevronLeft, ChevronRight, Filter
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

function stableStr(v) {
  try {
    const seen = new WeakSet();
    const s = (x) => {
      if (x && typeof x === "object") {
        if (seen.has(x)) return '"[circ]"';
        seen.add(x);
        if (Array.isArray(x)) return "[" + x.map(s).join(",") + "]";
        return "{" + Object.keys(x).sort().map(k => JSON.stringify(k) + ":" + s(x[k])).join(",") + "}";
      }
      return JSON.stringify(x);
    };
    return s(v);
  } catch { return String(v); }
}

function statusBadge(val) {
  if (!val) return null;
  const v = String(val).toLowerCase();
  if (["ativo", "ativa", "aprovado", "aprovada", "pago", "paga", "recebido", "entregue"].includes(v))
    return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs rounded-sm">{val}</Badge>;
  if (["inativo", "inativa", "bloqueado", "cancelado", "devolvido"].includes(v))
    return <Badge className="bg-red-100 text-red-700 border-red-200 text-xs rounded-sm">{val}</Badge>;
  if (["em análise", "pendente", "prospect", "aguardando", "em processo", "em produção", "rascunho"].includes(v))
    return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs rounded-sm">{val}</Badge>;
  if (["ativo" ].includes(v))
    return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs rounded-sm">{val}</Badge>;
  return <Badge variant="outline" className="text-xs rounded-sm">{val}</Badge>;
}

const STATUS_FIELDS = new Set(["status", "status_fornecedor", "status_fiscal_receita", "situacao_credito", "ativo"]);

function renderCell(col, row) {
  const val = row[col.key];
  if (col.render) return col.render(row);
  if (STATUS_FIELDS.has(col.key) && val != null) return statusBadge(val);
  if (val == null || val === "") return <span className="text-slate-300">—</span>;
  if (typeof val === "boolean") return val ? <Badge className="bg-emerald-100 text-emerald-700 text-xs rounded-sm">Sim</Badge> : <Badge className="bg-slate-100 text-slate-500 text-xs rounded-sm">Não</Badge>;
  if (typeof val === "number") return <span className="tabular-nums">{val.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</span>;
  if (typeof val === "string" && val.match(/^\d{4}-\d{2}-\d{2}/)) {
    try { return new Date(val).toLocaleDateString("pt-BR"); } catch { return val; }
  }
  return String(val).length > 60 ? String(val).slice(0, 58) + "…" : String(val);
}

// ─── Hook de dados ───────────────────────────────────────────────────────────

const DEFAULT_SORTS = {
  Produto: { f: "descricao", d: "asc" },
  Cliente: { f: "nome", d: "asc" },
  Fornecedor: { f: "nome", d: "asc" },
  Transportadora: { f: "razao_social", d: "asc" },
  Colaborador: { f: "nome_completo", d: "asc" },
  Pedido: { f: "data_pedido", d: "desc" },
  ContaPagar: { f: "data_vencimento", d: "asc" },
  ContaReceber: { f: "data_vencimento", d: "asc" },
  OrdemCompra: { f: "data_solicitacao", d: "desc" },
  CentroCusto: { f: "codigo", d: "asc" },
  PlanoDeContas: { f: "codigo", d: "asc" },
  User: { f: "full_name", d: "asc" },
};

function getSavedSort(entityName) {
  try {
    const raw = localStorage.getItem(`sort_${entityName}`);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return { f: p.field || p.sortField, d: p.direction || p.sortDirection };
  } catch { return null; }
}

function saveSort(entityName, f, d) {
  try { localStorage.setItem(`sort_${entityName}`, JSON.stringify({ field: f, direction: d })); } catch {}
}

// Inflight global por chave
const _inflight = (typeof window !== "undefined" ? (window.__vueInflight || (window.__vueInflight = new Map())) : new Map());

async function fetchPage({ entityName, filter, sortField, sortDirection, page, pageSize, search }) {
  const skip = (page - 1) * pageSize;
  const key = stableStr({ entityName, filter, sortField, sortDirection, skip, pageSize, search });
  if (_inflight.has(key)) return _inflight.get(key);
  const exec = async () => {
    let attempt = 0;
    while (true) {
      try {
        const res = await base44.functions.invoke("entityListSorted", {
          entityName,
          filter: filter || {},
          sortField,
          sortDirection,
          limit: pageSize,
          skip,
          search: search || undefined,
        });
        return Array.isArray(res?.data) ? res.data : [];
      } catch (err) {
        const s = err?.response?.status || err?.status;
        if (s === 429 && attempt < 3) {
          await new Promise(r => setTimeout(r, 800 * Math.pow(2, attempt) + Math.random() * 300));
          attempt++; continue;
        }
        throw err;
      }
    }
  };
  const p = exec().finally(() => _inflight.delete(key));
  _inflight.set(key, p);
  return p;
}

async function fetchCount({ entityName, filter, search }) {
  // Se há busca, não temos count confiável sem query separada — retorna null para esconder paginação
  if (search) return null;
  try {
    const res = await base44.functions.invoke("countEntities", { entityName, filter: filter || {} });
    return res?.data?.count ?? res?.data?.counts?.[entityName] ?? null;
  } catch { return null; }
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function VisualizadorUniversalEntidade({
  nomeEntidade,
  tituloDisplay,
  icone: IconeComp,
  camposPrincipais = [],
  componenteEdicao: FormComp,
  windowMode = false,
  queryKey: externalQueryKey,
  filtroAdicional,
  onSelectionChange,
  acoesTopo,
}) {
  const { filterInContext, empresaAtual, grupoAtual } = useContextoVisual();
  const { openWindow } = useWindow();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();

  // Sort persistido
  const savedSort = useMemo(() => getSavedSort(nomeEntidade), [nomeEntidade]);
  const def = DEFAULT_SORTS[nomeEntidade] || { f: "updated_date", d: "desc" };
  const [sortField, setSortField] = useState(savedSort?.f || def.f);
  const [sortDir, setSortDir] = useState(savedSort?.d || def.d);

  // Paginação
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Busca com debounce
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const debounceRef = useRef(null);
  const onSearchChange = useCallback((v) => {
    setSearchInput(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setSearch(v); setPage(1); }, 350);
  }, []);

  // Dados
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastFetchKey, setLastFetchKey] = useState(null);
  const fetchGenRef = useRef(0);

  // Filtro de contexto (multiempresa)
  const [contextFilter, setContextFilter] = useState({});
  useEffect(() => {
    const ctxCampoMap = { Fornecedor: "empresa_dona_id", Transportadora: "empresa_dona_id", Colaborador: "empresa_alocada_id" };
    const campo = ctxCampoMap[nomeEntidade] || "empresa_id";
    const empresaId = empresaAtual?.id;
    const groupId = grupoAtual?.id;
    if (!empresaId && !groupId) { setContextFilter({}); return; }
    const or = [];
    if (empresaId) {
      if (nomeEntidade === "Cliente") {
        or.push({ empresa_id: empresaId }, { empresa_dona_id: empresaId }, { empresas_compartilhadas_ids: { $in: [empresaId] } });
      } else if (nomeEntidade === "Fornecedor" || nomeEntidade === "Transportadora") {
        or.push({ [campo]: empresaId }, { empresas_compartilhadas_ids: { $in: [empresaId] } });
      } else { or.push({ [campo]: empresaId }); }
    }
    if (groupId) or.push({ group_id: groupId });
    setContextFilter(or.length ? { $or: or } : {});
  }, [nomeEntidade, empresaAtual?.id, grupoAtual?.id]);

  const load = useCallback(async (gen) => {
    if (!nomeEntidade) return;
    const cf = contextFilter;
    if (!cf.$or && !cf.empresa_id && !cf.group_id && Object.keys(cf).length === 0 && !empresaAtual?.id && !grupoAtual?.id) {
      setRows([]); setTotal(0); return;
    }
    setLoading(true);
    try {
      const [items, cnt] = await Promise.all([
        fetchPage({ entityName: nomeEntidade, filter: cf, sortField, sortDirection: sortDir, page, pageSize, search }),
        fetchCount({ entityName: nomeEntidade, filter: cf, search }),
      ]);
      if (gen !== fetchGenRef.current) return; // stale
      let finalRows = items;
      if (typeof filtroAdicional === "function") finalRows = items.filter(filtroAdicional);
      setRows(finalRows);
      setTotal(cnt);
    } catch (err) {
      if (gen !== fetchGenRef.current) return;
      console.warn("[VisualizadorUniversalEntidade] erro:", err);
    } finally {
      if (gen === fetchGenRef.current) setLoading(false);
    }
  }, [nomeEntidade, contextFilter, sortField, sortDir, page, pageSize, search, filtroAdicional, empresaAtual?.id, grupoAtual?.id]);

  useEffect(() => {
    const gen = ++fetchGenRef.current;
    load(gen);
  }, [load]);

  // Atualização em tempo real
  useEffect(() => {
    if (!nomeEntidade || !base44.entities?.[nomeEntidade]?.subscribe) return;
    const unsub = base44.entities[nomeEntidade].subscribe(() => {
      const gen = ++fetchGenRef.current;
      load(gen);
    });
    return unsub;
  }, [nomeEntidade, load]);

  // Ordenação
  const handleSort = useCallback((field) => {
    const newDir = sortField === field && sortDir === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDir(newDir);
    saveSort(nomeEntidade, field, newDir);
    setPage(1);
  }, [sortField, sortDir, nomeEntidade]);

  // Seleção
  const [selectedIds, setSelectedIds] = useState(new Set());
  const toggleSelect = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);
  const toggleAll = useCallback(() => {
    setSelectedIds(prev => prev.size === rows.length ? new Set() : new Set(rows.map(r => r.id)));
  }, [rows]);
  useEffect(() => { onSelectionChange?.(selectedIds); }, [selectedIds, onSelectionChange]);

  // Colunas
  const columns = useMemo(() => {
    if (!camposPrincipais.length) return [];
    return camposPrincipais.map(k => ({
      key: k,
      label: k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    }));
  }, [camposPrincipais]);

  // Abrir form
  const openEdit = useCallback((item) => {
    if (!FormComp) return;
    openWindow(FormComp, {
      [nomeEntidade.toLowerCase()]: item,
      [`${nomeEntidade.toLowerCase()}Id`]: item?.id,
      onSubmit: async (data) => {
        if (item?.id) await base44.entities[nomeEntidade].update(item.id, data);
        else await base44.entities[nomeEntidade].create(data);
        const gen = ++fetchGenRef.current;
        load(gen);
      },
      windowMode: true,
    }, { title: item?.id ? `Editar ${tituloDisplay}` : `Novo ${tituloDisplay}`, width: 1200, height: 750 });
  }, [FormComp, nomeEntidade, tituloDisplay, openWindow, load]);

  const openNew = useCallback(() => {
    if (!FormComp) return;
    openWindow(FormComp, {
      onSubmit: async (data) => {
        await base44.entities[nomeEntidade].create(data);
        const gen = ++fetchGenRef.current;
        load(gen);
      },
      windowMode: true,
    }, { title: `Novo ${tituloDisplay}`, width: 1200, height: 750 });
  }, [FormComp, nomeEntidade, tituloDisplay, openWindow, load]);

  const handleDelete = useCallback(async (item) => {
    if (!window.confirm(`Excluir este ${tituloDisplay}?`)) return;
    await base44.entities[nomeEntidade].delete(item.id);
    const gen = ++fetchGenRef.current;
    load(gen);
  }, [nomeEntidade, tituloDisplay, load]);

  const totalPages = total != null ? Math.max(1, Math.ceil(total / pageSize)) : null;
  const canPrev = page > 1;
  const canNext = totalPages == null ? rows.length === pageSize : page < totalPages;

  const canCreate = hasPermission("Cadastros", null, "criar");
  const canEdit = hasPermission("Cadastros", null, "editar");
  const canDelete = hasPermission("Cadastros", null, "excluir");

  return (
    <div className="w-full h-full flex flex-col min-h-0 bg-white rounded-sm border overflow-hidden">
      {/* Barra superior */}
      <div className="flex-shrink-0 flex flex-wrap items-center gap-2 px-3 py-2 border-b bg-gradient-to-r from-slate-50 to-white">
        {acoesTopo}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <Input
            value={searchInput}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={`Buscar ${tituloDisplay}…`}
            className="pl-7 h-8 text-sm rounded-sm border-slate-200"
          />
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm"
            onClick={() => { const gen = ++fetchGenRef.current; load(gen); }} title="Atualizar">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-500" : "text-slate-400"}`} />
          </Button>
          {canCreate && FormComp && (
            <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 rounded-sm text-xs gap-1.5" onClick={openNew}>
              <Plus className="w-3.5 h-3.5" /> Novo
            </Button>
          )}
        </div>
      </div>

      {/* Tabela */}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full text-sm border-collapse" style={{ minWidth: Math.max(600, columns.length * 140) }}>
          <thead className="sticky top-0 z-10 bg-slate-50 border-b">
            <tr>
              <th className="w-9 px-2 py-2 text-center">
                <input type="checkbox"
                  checked={rows.length > 0 && selectedIds.size === rows.length}
                  onChange={toggleAll}
                  className="rounded-sm cursor-pointer"
                />
              </th>
              {columns.map(col => (
                <th key={col.key}
                  className="px-3 py-2 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide whitespace-nowrap select-none cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortField === col.key
                      ? (sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-blue-500" /> : <ArrowDown className="w-3 h-3 text-blue-500" />)
                      : <ArrowUpDown className="w-3 h-3 text-slate-300" />
                    }
                  </div>
                </th>
              ))}
              {(canEdit || canDelete) && (
                <th className="w-20 px-2 py-2 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Ações</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 ? (
              Array.from({ length: pageSize > 10 ? 12 : 8 }).map((_, i) => (
                <tr key={`sk-${i}`} className="border-b">
                  <td className="px-2 py-2"><Skeleton className="h-4 w-4 rounded" /></td>
                  {columns.map(c => (
                    <td key={c.key} className="px-3 py-2"><Skeleton className="h-4 w-3/4" /></td>
                  ))}
                  {(canEdit || canDelete) && <td className="px-2 py-2"><Skeleton className="h-4 w-12 ml-auto" /></td>}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="text-center py-12 text-slate-400 text-sm">
                  {search ? `Nenhum resultado para "${search}"` : `Nenhum ${tituloDisplay} encontrado`}
                </td>
              </tr>
            ) : (
              rows.map(row => (
                <tr key={row.id}
                  className={`border-b transition-colors hover:bg-blue-50/40 ${selectedIds.has(row.id) ? "bg-blue-50" : ""} ${loading ? "opacity-60" : ""}`}
                >
                  <td className="px-2 py-1.5 text-center">
                    <input type="checkbox"
                      checked={selectedIds.has(row.id)}
                      onChange={() => toggleSelect(row.id)}
                      className="rounded-sm cursor-pointer"
                    />
                  </td>
                  {columns.map(col => (
                    <td key={col.key} className="px-3 py-1.5 text-slate-700 whitespace-nowrap max-w-[240px] overflow-hidden text-ellipsis">
                      {renderCell(col, row)}
                    </td>
                  ))}
                  {(canEdit || canDelete) && (
                    <td className="px-2 py-1.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canEdit && FormComp && (
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-sm hover:bg-blue-100"
                            onClick={() => openEdit(row)} title="Editar">
                            <Edit className="w-3 h-3 text-blue-500" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-sm hover:bg-red-100"
                            onClick={() => handleDelete(row)} title="Excluir">
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Rodapé: paginação */}
      <div className="flex-shrink-0 flex items-center justify-between gap-2 px-3 py-2 border-t bg-slate-50 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <span>Por página:</span>
          {[10, 20, 50, 100].map(n => (
            <button key={n}
              className={`px-2 py-0.5 rounded-sm border text-xs transition-colors ${pageSize === n ? "bg-blue-600 text-white border-blue-600" : "bg-white border-slate-200 hover:bg-slate-100"}`}
              onClick={() => { setPageSize(n); setPage(1); }}>
              {n}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {total != null && <span className="text-slate-500">{total.toLocaleString("pt-BR")} registros</span>}
          <Button variant="outline" size="icon" className="h-6 w-6 rounded-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!canPrev}>
            <ChevronLeft className="w-3 h-3" />
          </Button>
          <span>Pág. {page}{totalPages ? ` / ${totalPages}` : ""}</span>
          <Button variant="outline" size="icon" className="h-6 w-6 rounded-sm" onClick={() => setPage(p => p + 1)} disabled={!canNext || loading}>
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}