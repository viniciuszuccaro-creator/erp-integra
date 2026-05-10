import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Globe2, Shield, Users } from "lucide-react";

const safeArray = (value) => Array.isArray(value) ? value : [];

export default function AccessScopeSummary({ accessScope, empresaAtual, grupoAtual, empresasDoGrupo = [], usuarios = [], perfis = [] }) {
  const isGrupo = accessScope?.scope === "grupo" || accessScope?.scopeKey?.startsWith("grupo");
  const scopeName = isGrupo
    ? (grupoAtual?.nome || grupoAtual?.nome_grupo || "Grupo empresarial")
    : (empresaAtual?.nome_fantasia || empresaAtual?.razao_social || "Empresa atual");

  const cards = [
    {
      label: "Escopo ativo",
      value: scopeName,
      detail: isGrupo ? "Governança consolidada do grupo" : "Governança da empresa selecionada",
      icon: isGrupo ? Globe2 : Building2,
    },
    {
      label: "Empresas cobertas",
      value: isGrupo ? safeArray(empresasDoGrupo).length : 1,
      detail: "Filtro multiempresa aplicado",
      icon: Building2,
    },
    {
      label: "Usuários avaliados",
      value: safeArray(usuarios).length,
      detail: "Dentro do escopo atual",
      icon: Users,
    },
    {
      label: "Perfis RBAC",
      value: safeArray(perfis).length,
      detail: "Perfis disponíveis para atribuição",
      icon: Shield,
    },
  ];

  return (
    <Card className="w-full border-slate-200 bg-white">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Escopo de Governança</h3>
            <p className="text-xs text-slate-500">Resumo do contexto usado para perfis, usuários, auditoria e riscos.</p>
          </div>
          <Badge className={accessScope?.contextoValido ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
            {accessScope?.contextoValido ? "Contexto válido" : "Sem contexto"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">{card.label}</p>
                  <p className="font-semibold text-slate-900 truncate">{card.value}</p>
                  <p className="text-[11px] text-slate-500 truncate">{card.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}