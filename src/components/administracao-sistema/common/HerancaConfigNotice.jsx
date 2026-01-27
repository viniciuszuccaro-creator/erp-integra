import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

export default function HerancaConfigNotice() {
  const { estaNoGrupo } = useContextoVisual();
  return (
    <Alert className="mb-3">
      <AlertTitle className="text-sm">Herança de Configurações</AlertTitle>
      <AlertDescription className="text-xs text-slate-600">
        Ordem de precedência: Global → Grupo → Empresa. Escopo atual: <strong>{estaNoGrupo ? 'Grupo' : 'Empresa'}</strong>.
        Configurações do grupo podem ser herdadas pelas empresas; empresas podem sobrescrever quando permitido.
      </AlertDescription>
    </Alert>
  );
}