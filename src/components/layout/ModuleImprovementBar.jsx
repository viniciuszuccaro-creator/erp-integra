import React from "react";
import { CheckCircle2, Shield, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import useModuleImprovementContext from "@/components/lib/useModuleImprovementContext";

export default function ModuleImprovementBar({ moduleName = "Sistema" }) {
  const { status, pillars, canView, empresaNome, grupoNome, contexto } = useModuleImprovementContext(moduleName);

  if (!canView) return null;

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
              Plano de Melhoria
            </Badge>
            <span className="text-sm font-semibold text-slate-900">{moduleName}</span>
            <span className="text-xs text-slate-500">{status.progress}% alinhado</span>
          </div>
          <p className="mt-1 truncate text-xs text-slate-500">{status.focus}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1">
            <Shield className="h-3 w-3 text-blue-600" />
            {contexto === "grupo" ? (grupoNome || "Grupo") : (empresaNome || "Empresa")}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1">
            <Zap className="h-3 w-3 text-amber-600" /> IA + governança
          </span>
          <span className="hidden items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 md:inline-flex">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> {pillars.length} pilares ativos
          </span>
        </div>
      </div>
    </div>
  );
}