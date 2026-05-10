import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CircleDashed, Rocket } from "lucide-react";

const safeArray = (value) => Array.isArray(value) ? value : [];

export default function AccessMaturityRoadmap({ perfis = [], usuarios = [] }) {
  const usersWithoutProfile = safeArray(usuarios).filter((usuario) => !usuario?.perfil_acesso_id && usuario?.role !== "admin").length;
  const sodConflicts = safeArray(perfis).reduce((total, perfil) => total + safeArray(perfil?.conflitos_sod_detectados).length, 0);
  const activeProfiles = safeArray(perfis).filter((perfil) => perfil?.ativo !== false).length;

  const stages = [
    { label: "Base RBAC", done: activeProfiles > 0, detail: "Perfis ativos e estrutura granular" },
    { label: "Cobertura Usuários", done: usersWithoutProfile === 0, detail: "Todos os usuários com perfil operacional" },
    { label: "SoD Controlado", done: sodConflicts === 0, detail: "Conflitos tratados ou inexistentes" },
    { label: "Automação IA", done: true, detail: "Otimizador e alertas conectados" },
    { label: "Revisão Contínua", done: true, detail: "Auditoria e plano de ação integrados" },
  ];

  const completed = stages.filter((stage) => stage.done).length;

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">Roadmap de Maturidade de Acessos</h3>
          </div>
          <Badge className="bg-blue-100 text-blue-700">{completed}/{stages.length} etapas</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {stages.map((stage, index) => {
            const Icon = stage.done ? CheckCircle2 : CircleDashed;
            return (
              <div key={stage.label} className="relative rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <Icon className={stage.done ? "w-4 h-4 text-emerald-600" : "w-4 h-4 text-amber-600"} />
                  <Badge variant="outline" className="text-[10px]">F{index + 1}</Badge>
                </div>
                <p className="text-sm font-medium text-slate-900 mt-2">{stage.label}</p>
                <p className="text-xs text-slate-500 mt-1">{stage.detail}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}