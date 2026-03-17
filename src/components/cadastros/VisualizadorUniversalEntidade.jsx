/**
 * VisualizadorUniversalEntidade — visualizador genérico para qualquer entidade
 * com paginação server-side, busca debounced, ordenação e atualização em tempo real.
 */
import React, { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronUp, ChevronDown, Plus, Trash2, Edit, Search } from "lucide-react";

export default function VisualizadorUniversalEntidade({
  entityName,
  columns = [],
  onEdit = null,
  onDelete = null,
  onCreate = null,
  defaultSort = "-updated_date",
  pageSize = 20,
}) {
  const queryClient = useQueryClient();
  const { filterInContext } = useContextoVisual();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState(defaultSort);
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search (350ms)
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Build search filter
  const searchFilter = useMemo(() => {
    if (!debouncedSearch) return {};
    const term = debouncedSearch.toLowerCase();
    const searchable = columns
      .filter(col => col.searchable !== false)
      .map(col => col.field);
    if (searchable.length === 0) return {};
    return {
      $or: searchable.map(field => ({
        [field]: { $regex: term, $options: "i" }
      }))
    };
  }, [debouncedSearch, columns]);

  // Fetch data
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: [entityName, sortField, currentPage, debouncedSearch],
    queryFn: async () => {
      const skip = (currentPage - 1) * pageSize;
      return await filterInContext(entityName, searchFilter, sortField, pageSize, skip);
    },
    staleTime: 60_000,
    gcTime: 180_000,
  });

  // Real-time subscription
  React.useEffect(() => {
    const api = base44.entities?.[entityName];
    if (!api?.subscribe) return;
    const unsub = api.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: [entityName] });
    });
    return unsub;
  }, [entityName, queryClient]);

  const formatValue = (value, column) => {
    if (value === null || value === undefined) return "—";
    if (column.type === "date") return new Date(value).toLocaleDateString("pt-BR");
    if (column.type === "boolean") return value ? "Sim" : "Não";
    if (column.type === "number") return Number(value).toLocaleString("pt-BR");
    return String(value).substring(0, 80);
  };

  const handleSort = (field) => {
    if (sortField.replace(/^-/, "") === field) {
      setSortField(sortField.startsWith("-") ? field : `-${field}`);
    } else {
      setSortField(`-${field}`);
    }
    setCurrentPage(1);
  };

  const renderLoadingSkeletons = () => (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-12" />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
        {onCreate && (
          <Button onClick={onCreate} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Novo
          </Button>
        )}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {error ? (
            <div className="p-6 text-center text-red-600">Erro ao carregar dados</div>
          ) : isLoading ? (
            <div className="p-6">{renderLoadingSkeletons()}</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center text-slate-500">Nenhum registro encontrado</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col.field}
                        className="px-4 py-3 text-left font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                        onClick={() => col.sortable !== false && handleSort(col.field)}
                      >
                        <div className="flex items-center gap-2">
                          {col.label}
                          {col.sortable !== false && (
                            sortField.replace(/^-/, "") === col.field ? (
                              sortField.startsWith("-") ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronUp className="w-4 h-4" />
                              )
                            ) : (
                              <span className="w-4 h-4" />
                            )
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center font-semibold text-slate-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-slate-50 transition-colors">
                      {columns.map((col) => (
                        <td key={col.field} className="px-4 py-3 text-slate-600">
                          {formatValue(item[col.field], col)}
                        </td>
                      ))}
                      <td className="px-4 py-3 flex items-center justify-center gap-2">
                        {onEdit && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEdit(item)}
                            className="text-slate-600 hover:text-blue-600"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(item)}
                            className="text-slate-600 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {items.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Página {currentPage} · {items.length} registros
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={items.length < pageSize}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}