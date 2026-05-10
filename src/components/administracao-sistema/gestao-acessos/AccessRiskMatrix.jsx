import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, LockKeyhole, ShieldAlert } from "lucide-react";

const safeArray = (value) => Array.isArray(value) ? value : [];

export default function AccessRiskMatrix({ perfis = [], usuarios = [], auditorias = [] }) {
  const usersWithoutProfile = safeArray(usuarios).filter((usuario) => !usuario?.perfil_acesso_id && usuario?.role !== "admin").length;
  const admins = safeArray(usuarios).filter((usuario) => usuario?.role === "admin").length;
  const sodConflicts = safeArray(perfis).reduce((total, perfil) => total + safeArray(perfil?.conflitos_sod_detectados).length, 0);
  const sensitiveProfiles = safeArray(perfis).filter((perfil) => safeArray(perfil?.permissoes_sensiveis).length > 0 || perfil?.requer_aprovacao_especial).length;
  const recentBlocks = safeArray(auditorias).filter((item) => item?.acao === "Bloqueio").length;

  const risks = [
    {
      label: "Usuários sem perfil",
      value: usersWithoutProfile,
      level: usersWithoutProfile ? "alto" : "baixo",
      hint: usersWithoutProfile ? "Atribuir perfil RBAC" : "Cobertura completa",
      icon: usersWithoutProfile ? AlertTriangle : CheckCircle2,
    },
    {
      label: "Conflitos SoD",
      value: sodConflicts,
      level: sodConflicts ? "critico" : "baixo",
      hint: sodConflicts ? "Revisar segregação" : "Sem conflito persistido",
      icon: sodConflicts ? ShieldAlert : CheckCircle2,
    },
    {
      label: "Perfis sensíveis",
      value: sensitiveProfiles,
      level: sensitiveProfiles ? "medio" : "baixo",
      hint: "Exigem revisão periódica",
      icon: LockKeyhole,
    },
    {
      label: "Admins no escopo",
      value: admins,
      level: admins > 2 ? "medio" : "baixo",
      hint: admins > 2 ? "Validar necessidade" : "Dentro do esperado",
      icon: LockKeyhole,
    },
    {
      label: "Bloqueios recentes",
      value: recentBlocks,
      level: recentBlocks ? "medio" : "baixo",
      hint: recentBlocks ? "Ver auditoria detalhada" : "Sem bloqueios recentes",
      icon: recentBlocks ? AlertTriangle : CheckCircle2,
    },
  ];

  const levelClass = {
    baixo: "bg-emerald-100 text-emerald-700 border-emerald-200",
    medio: "bg-amber-100 text-amber-700 border-amber-200",
    alto: "bg-orange-100 text-orange-700 border-orange-200",
    critico: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Matriz de Risco de Acessos</h3>
            <p className="text-xs text-slate-500">Priorização automática dos pontos críticos do controle de acesso.</p>
          </div>
          <Badge variant="outline">IA-ready</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {risks.map((risk) => {
            const Icon = risk.icon;
            return (
              <div key={risk.label} className={`rounded-xl border p-3 ${levelClass[risk.level]}`}>
                <div className="flex items-center justify-between gap-2">
                  <Icon className="w-4 h-4" />
                  <Badge variant="outline" className="text-[10px] capitalize bg-white/60">{risk.level}</Badge>
                </div>
                <p className="text-2xl font-bold mt-2">{risk.value}</p>
                <p className="text-xs font-medium">{risk.label}</p>
                <p className="text-[11px] opacity-80 mt-1">{risk.hint}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}