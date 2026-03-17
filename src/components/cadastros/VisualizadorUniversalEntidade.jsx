/**
 * VisualizadorUniversalEntidade V22 — motor universal de listagem para todos os Cadastros Gerais
 * Props: nomeEntidade, tituloDisplay, icone, camposPrincipais, componenteEdicao, windowMode
 * Performance: paginação server-side, debounce 350ms, sort via backend, real-time, sem pulos
 */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronUp, ChevronDown, Search, Edit, Trash2, Plus, RefreshCw } from "lucide-react";

const STATUS_COLORS = {
  Ativo: "bg-green-100 text-green-700 border-green-300",
  Ativa: "bg-green-100 text-green-700 border-green-300",
  "Em Análise": "bg-blue-100 text-blue-700 border-blue-300",
  Aprovado: "bg-green-100 text-green-700 border-green-300",
  Inativo: "bg-slate-100 text-slate-600 border-slate-300",
  Inativa: "bg-slate-100 text-slate-600 border-slate-300",
  Prospect: "bg-yellow-100 text-yellow-700 border-yellow-300",
  Bloqueado: "bg-red-100 text-red-700 border-red-300",
  Pendente: "bg-yellow-100 text-yellow-700 border-yellow-300",
  Cancelado: "bg-red-100 text-red-700 border-red-300",
  Pago: "bg-green-100 text-green-700 border-green-300",
  Atrasado: "bg-red-100 text-red-700 border-red-300",
};

const STATUS_FIELDS = new Set(["status", "status_fornecedor", "situacao", "ativo", "ativa"]);

const PAGE_SIZES = [10, 20, 50, 100];

export default function VisualizadorUniversalEntidade({
  // Props do modo janela (via openWindow nos Blocos)
  nomeEntidade,
  tituloDisplay,
  icone: IconeProp,
  camposPrincipais = [],
  componenteEdicao: FormComponent,
  windowMode = false,
  // Props diretas (modo embutido)
  entityName,
  columns,
  onEdit,
  onDelete,
  pageSize: pageSizeProp,
}) {
  // Normalizar props (suporta ambos os formatos)
  const ENTITY = nomeEntidade || entityName || "";
  const TITULO = tituloDisplay || ENTITY;

  // Gerar colunas automaticamente dos camposPrincipais (compatibilidade com Blocos)
  const COLUMNS = useMemo(() => {
    if (columns && columns.length > 0) return columns;
    if (camposPrincipais && camposPrincipais.length > 0) {
      return camposPrincipais.map((campo) => ({
        field: campo,
        label: campo.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        sortable: true,
        searchable: !STATUS_FIELDS.has(campo),
      }));
    }
    return [
      { field: "nome", label: "Nome", sortable: true, searchable: true },
      { field: "status", label: "Status", sortable: false, searchable: false },
    ];
  }, [columns, camposPrincipais]);

  const queryClient = useQueryClient();
  const { filterInContext, empresaAtual, grupoAtual, deleteInContext } = useContextoVisual();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortField, setSortField] = useState("-updated_date");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeProp || 20);
  const [editItem, setEditItem] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Debounce search 350ms
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // Build search filter
  const searchFilter = useMemo(() => {
    if (!debouncedSearch) return {};
    const term = debouncedSearch.toLowerCase();
    const searchableCols = COLUMNS.filter((c) => c.searchable !== false).map((c) => c.field);
    if (!searchableCols.length) return {};
    return { $or: searchableCols.map((f) => ({ [f]: { $regex: term, $options: "i" } })) };
  }, [debouncedSearch, COLUMNS]);

  // Fetch data — server-side, paginado
  const { data: items = [], isLoading, isFetching } = useQuery({
    queryKey: [ENTITY, "list", sortField, currentPage, pageSize, debouncedSearch, empresaAtual?.id, grupoAtual?.id],
    queryFn: async () => {
      if (!ENTITY) return [];
      try {
        return await filterInContext(ENTITY, searchFilter, sortField, pageSize);
      } catch {
        return [];
      }
    },
    staleTime: 45_000,
    gcTime: 120_000,
    refetchOnWindowFocus: false,
    keepPreviousData: true, // evita pulos visuais
    enabled: !!(empresaAtual?.id || grupoAtual?.id) && !!ENTITY,
  });

  // Real-time updates
  useEffect(() => {
    if (!ENTITY) return;
    const api = base44.entities?.[ENTITY];
    if (!api?.subscribe) return;
    const unsub = api.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: [ENTITY, "list"] });
    });
    return unsub;
  }, [ENTITY, queryClient]);

  const handleSort = useCallback((field) => {
    setSortField((prev) => {
      const isCurrentAsc = prev === field;
      const isCurrentDesc = prev === `-${field}`;
      return isCurrentDesc ? field : `-${field}`;
    });
    setCurrentPage(1);
  }, []);

  const formatValue = (value, col) => {
    if (value === null || value === undefined) return "—";
    if (col.field === "ativo" || col.field === "ativa") {
      return value ? (
        <Badge variant="outline" className="text-xs rounded-sm bg-green-100 text-green-700 border-green-300">Ativo</Badge>
      ) : (
        <Badge variant="outline" className="text-xs rounded-sm bg-slate-100 text-slate-600 border-slate-300">Inativo</Badge>
      );
    }
    if (STATUS_FIELDS.has(col.field) && typeof value === "string") {
      const cls = STATUS_COLORS[value] || "bg-slate-100 text-slate-600 border-slate-200";
      return <Badge variant="outline" className={`text-xs rounded-sm ${cls}`}>{value}</Badge>;
    }
    if (col.type === "date") {
      try { return new Date(value).toLocaleDateString("pt-BR"); } catch { return value; }
    }
    if (col.type === "number") return Number(value).toLocaleString("pt-BR");
    if (typeof value === "boolean") return value ? "✓" : "—";
    return String(value).substring(0, 70);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Confirma exclusão?`)) return;
    try {
      await deleteInContext(ENTITY, item.id);
      queryClient.invalidateQueries({ queryKey: [ENTITY, "list"] });
    } catch (e) {
      alert("Erro ao excluir: " + e.message);
    }
  };

  const handleSave = () => {
    setShowForm(false);
    setEditItem(null);
    queryClient.invalidateQueries({ queryKey: [ENTITY, "list"] });
  };

  const isDesc = (field) => sortField === `-${field}`;
  const isAsc = (field) => sortField === field;
  const isSorted = (field) => isDesc(field) || isAsc(field);

  const content = (
    <div className="flex flex-col h-full gap-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-slate-200 h-9 rounded-sm"
          />
        </div>
        <select
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
          className="border border-slate-200 rounded-sm h-9 px-2 text-sm text-slate-700 bg-white"
        >
          {PAGE_SIZES.map((ps) => (
            <option key={ps} value={ps}>{ps} / pág.</option>
          ))}
        </select>
        <Button
          size="sm"
          variant="outline"
          onClick={() => queryClient.invalidateQueries({ queryKey: [ENTITY, "list"] })}
          className="h-9 rounded-sm"
          title="Atualizar"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
        {FormComponent && (
          <Button
            size="sm"
            onClick={() => { setEditItem(null); setShowForm(true); }}
            className="h-9 rounded-sm gap-1"
          >
            <Plus className="w-4 h-4" /> Novo
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto rounded-sm border border-slate-200 bg-white">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-9" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
            Nenhum registro encontrado
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
              <tr>
                {COLUMNS.map((col) => (
                  <th
                    key={col.field}
                    className="px-4 py-2.5 text-left font-medium text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    onClick={() => col.sortable !== false && handleSort(col.field)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.label}</span>
                      {col.sortable !== false && isSorted(col.field) && (
                        isDesc(col.field)
                          ? <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
                          : <ChevronUp className="w-3.5 h-3.5 text-blue-500" />
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-2.5 text-center font-medium text-slate-700 w-20">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  {COLUMNS.map((col) => (
                    <td key={col.field} className="px-4 py-2.5 text-slate-600">
                      {formatValue(item[col.field], col)}
                    </td>
                  ))}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-center gap-1">
                      {FormComponent && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setEditItem(item); setShowForm(true); }}
                          className="h-7 w-7 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-sm"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(item)}
                        className="h-7 w-7 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-sm"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
        <span>Página {currentPage} · {items.length} registro(s)</span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isLoading}
            className="h-7 text-xs rounded-sm"
          >
            ← Anterior
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={items.length < pageSize || isLoading}
            className="h-7 text-xs rounded-sm"
          >
            Próxima →
          </Button>
        </div>
      </div>

      {/* Form Modal */}
      {FormComponent && showForm && (
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>{editItem ? `Editar ${TITULO}` : `Novo ${TITULO}`}</DialogTitle>
            </DialogHeader>
            <FormComponent
              item={editItem}
              data={editItem}
              onClose={handleSave}
              onSave={handleSave}
              onSubmit={handleSave}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col p-4 bg-white">
        <div className="flex items-center gap-2 mb-3">
          {IconeProp && <IconeProp className="w-5 h-5 text-slate-600" />}
          <h2 className="text-lg font-semibold text-slate-900">{TITULO}</h2>
        </div>
        {content}
      </div>
    );
  }

  return content;
}