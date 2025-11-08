import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * Componente de filtro por empresa
 * Aparece quando o contexto é GRUPO
 * Permite filtrar dados por empresa específica ou ver todas
 */
export default function FiltroEmpresaContexto() {
  const {
    estaNoGrupo,
    empresasDoGrupo,
    filtroEmpresa,
    setFiltroEmpresa
  } = useContextoVisual();

  // Se não está no grupo, não mostra filtro
  if (!estaNoGrupo) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Building2 className="w-4 h-4 text-slate-500" />
      <Select value={filtroEmpresa} onValueChange={setFiltroEmpresa}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filtrar por empresa" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Todas as Empresas
            </div>
          </SelectItem>
          {empresasDoGrupo.map((empresa) => (
            <SelectItem key={empresa.id} value={empresa.id}>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600" />
                {empresa.nome_fantasia || empresa.razao_social}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {filtroEmpresa !== 'todas' && (
        <Badge variant="outline" className="text-xs">
          Filtrado
        </Badge>
      )}
    </div>
  );
}