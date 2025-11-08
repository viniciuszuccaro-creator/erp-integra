import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Globe, Eye } from 'lucide-react';
import { useContextoVisual } from './lib/useContextoVisual';

/**
 * Filtro de Escopo Multiempresa
 * Componente reutilizável para filtrar dados por escopo
 */
export default function FiltroEscopoMultiempresa({ 
  value, 
  onChange,
  showCard = true 
}) {
  const { estaNoGrupo, empresasDoGrupo } = useContextoVisual();

  if (!estaNoGrupo) return null;

  const filtro = (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Eye className="w-5 h-5 text-purple-600" />
        <span className="text-sm font-semibold text-slate-700">Visualizar:</span>
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-64">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="esta-empresa">
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Apenas Esta Empresa
            </span>
          </SelectItem>
          <SelectItem value="empresas-gerencio">
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Empresas que Gerencio ({empresasDoGrupo.length})
            </span>
          </SelectItem>
          <SelectItem value="grupo-completo">
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Grupo Completo
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  if (!showCard) {
    return filtro;
  }

  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardContent className="p-4">
        {filtro}
      </CardContent>
    </Card>
  );
}