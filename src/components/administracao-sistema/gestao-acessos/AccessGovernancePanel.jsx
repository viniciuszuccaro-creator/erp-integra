import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Shield, ShieldCheck, Users } from "lucide-react";

const safeArray = (value) => Array.isArray(value) ? value : [];

export default function AccessGovernancePanel({ perfis = [], usuarios = [], empresas = [], accessScope }) {
  const activeProfiles = safeArray(perfis).filter((perfil) => perfil?.ativo !== false);
  const inactiveProfiles = safeArray(perfis).length - activeProfiles.length;
  const usersWithoutProfile = safeArray(usuarios).filter((usuario) => !usuario?.perfil_acesso_id && usuario?.role !== "admin");
  const admins = safeArray(usuarios).filter((usuario) => usuario?.role === "admin");
  const sodConflicts = safeArray(perfis).reduce((total, perfil) => total + safeArray(perfil?.conflitos_sod_detectados).length, 0);
  const maturity = Math.max(0, Math.min(100, 100 - usersWithoutProfile.length * 12 - sodConflicts * 8 - inactiveProfiles * 3));
  const healthy = usersWithoutProfile.length === 0 && sodConflicts === 0;

  const cards = [
    { label: "Maturidade RBAC", value: `${maturity}%`, detail: healthy ? "Governança saudável" : "Revisão recomendada", icon: healthy ? ShieldCheck : AlertTriangle, tone: healthy ? "emerald" : "amber" },
    { label: "Perfis ativos", value: activeProfiles.length, detail: `${inactiveProfiles} inativo(s)`, icon: Shield, tone: "blue" },
    { label: "Usuários no escopo", value: safeArray(usuarios).length, detail: `${admins.length} admin(s)`, icon: Users, tone: "slate" },
    { label: "Conflitos SoD", value: sodConflicts, detail: sodConflicts ? "Persistir e tratar" : "Nenhum conflito", icon: sodConflicts ? AlertTriangle : CheckCircle2, tone: sodConflicts ? "red" : "emerald" },
  ];

  const toneClasses = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    red: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Governança de Acessos</h3>
          <p className="text-xs text-slate-500">Visão multiempresa de perfis, usuários, riscos e segregação de funções.</p>
        </div>
        <Badge variant="outline" className="text-xs">
          {accessScope?.contextoValido ? accessScope.scopeKey : "sem-contexto"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className={toneClasses[card.tone]}>
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className="w-8 h-8 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium opacity-80">{card.label}</p>
                  <p className="text-2xl font-bold leading-tight">{card.value}</p>
                  <p className="text-xs opacity-80 truncate">{card.detail}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs text-slate-500">Empresas cobertas</p>
            <p className="font-semibold text-slate-900">{safeArray(empresas).length || "Contexto atual"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Usuários sem perfil</p>
            <p className={usersWithoutProfile.length ? "font-semibold text-amber-700" : "font-semibold text-emerald-700"}>{usersWithoutProfile.length}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Próxima ação sugerida</p>
            <p className="font-semibold text-slate-900">{sodConflicts ? "Executar SoD e persistir conflitos" : usersWithoutProfile.length ? "Atribuir perfis pendentes" : "Manter revisão periódica"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}