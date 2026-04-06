import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWindow } from "@/components/lib/useWindow";
import usePermissions from "@/components/lib/usePermissions";
import VisualizadorUniversalEntidadeV24 from "@/components/cadastros/VisualizadorUniversalEntidadeV24";
import { Building2, Spline, Users, Briefcase, Clock, Shield } from "lucide-react";
import CountBadgeSimplificado from "@/components/cadastros/CountBadgeSimplificado";

import GrupoEmpresarialForm from "@/components/cadastros/GrupoEmpresarialForm";
import EmpresaForm from "@/components/cadastros/EmpresaForm";
import DepartamentoForm from "@/components/cadastros/DepartamentoForm";
import CargoForm from "@/components/cadastros/CargoForm";
import TurnoForm from "@/components/cadastros/TurnoForm";
import PerfilAcessoForm from "@/components/cadastros/PerfilAcessoForm";

export default function Bloco5Organizacional({ allCounts }) {
  const { openWindow } = useWindow();
  const { hasPermission } = usePermissions();
  const openList = (entidade, titulo, Icon, campos, FormComp) => () =>
    openWindow(VisualizadorUniversalEntidadeV24, { nomeEntidade: entidade, tituloDisplay: titulo, icone: Icon, camposPrincipais: campos, componenteEdicao: FormComp, windowMode: true }, { title: titulo, width: 1400, height: 800 });

  // Campos reais de cada entidade (sem alias — getDisplayValue faz fallback)
  const tiles = [
    { k: 'GrupoEmpresarial', t: 'Grupos Empresariais', i: Building2, c: ['nome','cnpj','descricao'],                        f: GrupoEmpresarialForm },
    { k: 'Empresa',           t: 'Empresas',             i: Spline,    c: ['razao_social','nome_fantasia','cnpj','cidade','estado'], f: EmpresaForm },
    { k: 'Departamento',      t: 'Departamentos',        i: Users,     c: ['nome','descricao'],                              f: DepartamentoForm },
    { k: 'Cargo',             t: 'Cargos',               i: Briefcase, c: ['nome','departamento','descricao'],               f: CargoForm },
    { k: 'Turno',             t: 'Turnos',               i: Clock,     c: ['nome','horario_inicio','horario_fim'],           f: TurnoForm },
    { k: 'PerfilAcesso',      t: 'Perfis de Acesso',     i: Shield,    c: ['nome_perfil','nivel_perfil','ativo'],            f: PerfilAcessoForm },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <Card className="rounded-sm shadow-sm border bg-white/80 backdrop-blur">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b rounded-t-sm">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-orange-700"/> Estrutura Organizacional
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 text-sm text-slate-600">Total consolidado do grupo.</CardContent>
      </Card>

      {tiles.map(({ k, t, i: Icon, c, f: FormComp }) => (
        <Card key={k} className="rounded-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150 cursor-pointer group border"
          onClick={hasPermission('Cadastros', null, 'visualizar') ? openList(k, t, Icon, c, FormComp) : undefined}>
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                <div className="p-1.5 rounded-sm bg-orange-50 group-hover:bg-orange-100 transition-colors">
                  <Icon className="w-4 h-4 text-orange-600" />
                </div>
                {t}
                <CountBadgeSimplificado entities={[k]} allCounts={allCounts} />
              </CardTitle>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-sm text-xs h-7"
                onClick={(e) => { e.stopPropagation(); openList(k, t, Icon, c, FormComp)(); }}
                disabled={!hasPermission('Cadastros', null, 'visualizar')}>
                Abrir
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 text-xs text-slate-500">Clique para listar, criar e editar.</CardContent>
        </Card>
      ))}
    </div>
  );
}