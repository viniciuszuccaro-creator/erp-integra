import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SearchInput from "@/components/ui/SearchInput";
import { Filter } from "lucide-react";

export default function FiltrosCompras({ searchTerm, onSearchChange, selectedStatus, onStatusChange }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-2">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Buscar..."
            className="flex-1 h-8 text-sm"
          />
          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="w-32 h-8 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="Ativo">Ativos</SelectItem>
              <SelectItem value="Inativo">Inativos</SelectItem>
              <SelectItem value="Bloqueado">Bloqueados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}