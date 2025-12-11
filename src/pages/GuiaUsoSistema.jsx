import React from "react";
import GuiaFluxoCompletoV21_6 from "@/components/sistema/GuiaFluxoCompletoV21_6";

/**
 * V21.6 FINAL - PÁGINA DE GUIA DE USO
 * Página dedicada para mostrar passo a passo do sistema
 */
export default function GuiaUsoSistema() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <GuiaFluxoCompletoV21_6 windowMode={false} />
      </div>
    </div>
  );
}