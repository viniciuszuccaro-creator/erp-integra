import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CircleDashed, ListChecks } from "lucide-react";

const safeArray = (value) => Array.isArray(value) ? value : [];

export default function AccessActionPlan({ perfis = [], usuarios = [] }) {
  const usersWithoutProfile = safeArray(usuarios).filter((usuario) => !usuario?.perfil_acesso_id && usuario?.role !== "admin").length;
  const sodConflicts = safeArray(perfis).reduce((total, perfil) => total + safeArray(perfil?.conflitos_sod_detectados).length, 0);
  const inactiveProfiles = safeArray(perfis).filter((perfil) => perfil?.ativo === false).length;

  const actions = [
    { title: "Atribuir perfis pendentes", done: usersWithoutProfile === 0, detail: `${usersWithoutProfile} usuário(s) sem perfil` },
    { title: "Executar e revisar SoD", done: sodConflicts === 0, detail: `${sodConflicts} conflito(s) persistido(s)` },
    { title: "Revisar perfis inativos", done: inactiveProfiles === 0, detail: `${inactiveProfiles} perfil(is) inativo(s)` },
    { title: "Manter trilha de auditoria", done: true, detail: "Eventos conectados ao AuditLog" },
    { title: "Validar escopo multiempresa", done: true, detail: "Grupo/empresa considerados nas consultas" },
  ];

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">Plano de Ação Operacional</h3>
          </div>
          <Badge className="bg-slate-100 text-slate-700">Melhoria contínua</Badge>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-2">
          {actions.map((action) => {
            const Icon = action.done ? CheckCircle2 : CircleDashed;
            return (
              <div key={action.title} className="rounded-lg border border-slate-200 bg-white p-3">
                <Icon className={action.done ? "w-4 h-4 text-emerald-600" : "w-4 h-4 text-amber-600"} />
                <p className="text-sm font-medium text-slate-900 mt-2">{action.title}</p>
                <p className="text-xs text-slate-500 mt-1">{action.detail}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}