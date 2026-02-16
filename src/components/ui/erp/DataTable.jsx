import React, { useMemo, useRef, useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

export default function ERPDataTable({
  columns = [], // [{ key, label, isNumeric }]
  data = [],
  sortField,
  sortDirection = "asc",
  onSortChange,
  onToggleSelectAll,
  onToggleItem,
  allSelected = false,
  selectedIds = new Set(),
  enableColumnFilters = true,
  columnFilters = {},
  onColumnFiltersChange,
  hiddenColumns = new Set(),
  onHiddenColumnsChange,
  footerTotals = true,
  enableGlobalSearch = false,
  globalSearchValue = "",
  onGlobalSearchChange,
  // Fase 2: padronização opcional por entidade
  entityName, // para persistência de sort por entidade
  autoPersistSort = true,
  page = 1,
  pageSize = 20,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
}) {
  const [colWidths, setColWidths] = useState({});
  const headerRefs = useRef({});

  useEffect(() => {
    // init widths on first render
    if (Object.keys(colWidths).length === 0 && columns.length) {
      const init = {};
      columns.forEach((c) => { init[c.key] = undefined; });
      setColWidths(init);
    }
  }, [columns]);

  const visibleColumns = useMemo(() => columns.filter(c => !hiddenColumns.has(c.key)), [columns, hiddenColumns]);

  const handleResize = (key, e) => {
    e.preventDefault();
    const startX = e.clientX;
    const th = headerRefs.current[key];
    const startWidth = th ? th.offsetWidth : 0;
    const onMove = (ev) => {
      const newW = Math.max(80, startWidth + (ev.clientX - startX));
      setColWidths((prev) => ({ ...prev, [key]: newW }));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const totals = useMemo(() => {
    if (!footerTotals) return {};
    const t = {};
    visibleColumns.forEach((c) => {
      if (c.isNumeric) t[c.key] = data.reduce((acc, row) => acc + (Number(row[c.key]) || 0), 0);
    });
    return t;
  }, [data, visibleColumns, footerTotals]);

  const renderSortIcon = (key) => {
    if (sortField !== key) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />;
    return sortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-blue-600" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-600" />;
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between pb-2 gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              Colunas <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {columns.map((c) => (
              <DropdownMenuCheckboxItem
                key={c.key}
                checked={!hiddenColumns.has(c.key)}
                onCheckedChange={(checked) => {
                  const next = new Set(hiddenColumns);
                  if (!checked) next.add(c.key); else next.delete(c.key);
                  onHiddenColumnsChange && onHiddenColumnsChange(next);
                }}
              >
                {c.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {enableGlobalSearch && (
          <input
            value={globalSearchValue}
            onChange={(e) => onGlobalSearchChange && onGlobalSearchChange(e.target.value)}
            className="h-8 w-full sm:w-64 border rounded px-2 text-sm"
            placeholder="Busca global..."
          />
        )}
      </div>

      <div className="flex-1 overflow-auto border rounded-lg">
        <Table className="w-full">
          <TableHeader className="sticky top-0 bg-slate-50 z-10">
            <TableRow>
              <TableHead className="w-10 px-3">
                <Checkbox checked={allSelected} onCheckedChange={onToggleSelectAll} />
              </TableHead>
              {visibleColumns.map((col) => (
                <TableHead
                  key={col.key}
                  ref={(el) => (headerRefs.current[col.key] = el)}
                  style={{ width: colWidths[col.key] ? `${colWidths[col.key]}px` : undefined }}
                  className="px-3 select-none"
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="flex items-center gap-1 hover:underline"
                      onClick={() => onSortChange && onSortChange(col.key, sortField === col.key && sortDirection === "asc" ? "desc" : "asc")}
                    >
                      <span className="font-semibold text-slate-700">{col.label}</span>
                      {renderSortIcon(col.key)}
                    </button>
                    <span
                      className="ml-auto w-1.5 h-5 cursor-col-resize opacity-40 hover:opacity-80"
                      onMouseDown={(e) => handleResize(col.key, e)}
                    />
                  </div>
                  {enableColumnFilters && (
                    <div className="mt-1">
                      <input
                        value={columnFilters[col.key] || ""}
                        onChange={(e) => onColumnFiltersChange && onColumnFiltersChange({ ...columnFilters, [col.key]: e.target.value })}
                        className="w-full h-7 px-2 text-xs border rounded"
                        placeholder={`Filtrar ${col.label}`}
                      />
                    </div>
                  )}
                </TableHead>
              ))}
              {/* Placeholder para ações externas: manter a estrutura sem quebrar colunas */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id} className="hover:bg-blue-50/40">
                <TableCell className="px-3">
                  <Checkbox checked={selectedIds.has(row.id)} onCheckedChange={() => onToggleItem && onToggleItem(row.id)} />
                </TableCell>
                {visibleColumns.map((c) => (
                  <TableCell key={c.key} className={`px-3 ${c.isNumeric ? 'text-right' : ''}`}>
                    {row[c.key] != null ? String(row[c.key]) : ''}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {footerTotals && Object.keys(totals).length > 0 && (
        <div className="mt-2 text-sm text-slate-600 flex flex-wrap gap-4">
          {Object.entries(totals).map(([k, v]) => (
            <div key={k}><span className="font-medium">Total {columns.find(c => c.key === k)?.label}:</span> {v.toLocaleString('pt-BR')}</div>
          ))}
        </div>
      )}
    </div>
  );
}