import React from "react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

export default function ContextoConfigBanner() {
  const { empresaAtual, estaNoGrupo } = useContextoVisual();
  const nomeEmpresa = empresaAtual?.nome_fantasia || empresaAtual?.razao_social || empresaAtual?.descricao || empresaAtual?.id || "";

  return (
    <div className="mb-3 p-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
      <div className="text-sm">
        Contexto ativo: <strong>{estaNoGrupo ? "Grupo" : "Empresa"}</strong>
        {nomeEmpresa ? ` — ${nomeEmpresa}` : ""}
      </div>
      <div className="text-xs text-slate-500 mt-1">
        Alterações aplicam-se ao {estaNoGrupo ? "grupo" : "empresa"} atual e seguem herança/sobrescrita conforme permissões e escopo.
      </div>
    </div>
  );
}