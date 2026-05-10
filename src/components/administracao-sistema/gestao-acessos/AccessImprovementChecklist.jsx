import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ShieldCheck } from "lucide-react";

export default function AccessImprovementChecklist({ perfis = [], usuarios = [] }) {
  const usuariosSemPerfil = usuarios.filter((usuario) => !usuario?.perfil_acesso_id && usuario?.role !== "admin").length;
  const conflitos = perfis.reduce((total, perfil) => total + (Array.isArray(perfil?.conflitos_sod_detectados) ? perfil.conflitos_sod_detectados.length : 0), 0);
  const perfisAtivos = perfis.filter((perfil) => perfil?.ativo !== false).length;

  const items = [
    { label: "Perfis RBAC ativos cadastrados", done: perfisAtivos > 0, hint: `${perfisAtivos} perfil(is)` },
    { label: "Todos os usuários operacionais têm perfil", done: usuariosSemPerfil === 0, hint: `${usuariosSemPerfil} pendente(s)` },
    { label: "Conflitos SoD sob controle", done: conflitos === 0, hint: `${conflitos} conflito(s)` },
    { label: "Auditoria de acesso habilitada", done: true, hint: "AuditLog conectado" },
    { label: "Escopo multiempresa aplicado", done: true, hint: "Grupo/empresa no contexto" },
  ];

  const doneCount = items.filter((item) => item.done).length;

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Checklist do Plano de Melhoria</h3>
          </div>
          <Badge className="bg-blue-100 text-blue-700">{doneCount}/{items.length}</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {items.map((item) => {
            const Icon = item.done ? CheckCircle2 : Circle;
            return (
              <div key={item.label} className="flex items-start gap-2 rounded-lg border border-slate-200 p-3 bg-white">
                <Icon className={item.done ? "w-4 h-4 text-emerald-600 mt-0.5" : "w-4 h-4 text-slate-400 mt-0.5"} />
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.hint}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}