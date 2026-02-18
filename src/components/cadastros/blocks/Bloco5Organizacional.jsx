import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWindow } from "@/components/lib/useWindow";
import usePermissions from "@/components/lib/usePermissions";
import VisualizadorUniversalEntidade from "@/components/cadastros/VisualizadorUniversalEntidade";
import { Building2, Spline, Users, Briefcase, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

import GrupoEmpresarialForm from "@/components/cadastros/GrupoEmpresarialForm";
import EmpresaForm from "@/components/cadastros/EmpresaForm";
import DepartamentoForm from "@/components/cadastros/DepartamentoForm";
import CargoForm from "@/components/cadastros/CargoForm";
import TurnoForm from "@/components/cadastros/TurnoForm";

function CountBadge({ entityName }) {
  const { getFiltroContexto } = useContextoVisual();
  const { data: count = 0 } = useQuery({
    queryKey: ['count','cadastros',entityName, getFiltroContexto('empresa_id', true)],
    queryFn: async () => {
      const resp = await base44.functions.invoke('countEntities', { entityName, filter: getFiltroContexto('empresa_id', true) });
      return resp?.data?.count || 0;
    },
    staleTime: 60000
  });
  return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">{count}</Badge>;
}

export default function Bloco5Organizacional() {
  const { openWindow } = useWindow();
  const { hasPermission } = usePermissions();
  const openList = (entidade, titulo, Icon, campos, FormComp) => () => openWindow(VisualizadorUniversalEntidade, { nomeEntidade: entidade, tituloDisplay: titulo, icone: Icon, camposPrincipais: campos, componenteEdicao: FormComp, windowMode: true }, { title: titulo, width: 1400, height: 800 });

  const tiles = [
    { k: 'GrupoEmpresarial', t: 'Grupos Empresariais', i: Building2, c: ['nome','cnpj','descricao'], f: GrupoEmpresarialForm },
    { k: 'Empresa', t: 'Empresas', i: Spline, c: ['razao_social','nome_fantasia','cnpj','cidade','estado'], f: EmpresaForm },
    { k: 'Departamento', t: 'Departamentos', i: Users, c: ['nome','descricao'], f: DepartamentoForm },
    { k: 'Cargo', t: 'Cargos', i: Briefcase, c: ['nome','departamento','descricao'], f: CargoForm },
    { k: 'Turno', t: 'Turnos', i: Clock, c: ['descricao','horario_inicio','horario_fim'], f: TurnoForm },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {tiles.map(({ k, t, i: Icon, c, f: FormComp }) => (
        <Card key={k} className="hover:shadow-lg transition-all">
          <CardHeader className="bg-slate-50 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Icon className="w-5 h-5 text-slate-600"/> {t}
                <span className="ml-2"><CountBadge entityName={k} /></span>
              </CardTitle>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={openList(k, t, Icon, c, FormComp)} disabled={!hasPermission('cadastros','ver')}>
                Abrir
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 text-sm text-slate-600">Gerencie {t} em janelas redimensionáveis.</CardContent>
        </Card>
      ))}
    </div>
  );
}