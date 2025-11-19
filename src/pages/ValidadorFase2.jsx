import React from "react";
import ValidadorFase2 from "@/components/sistema/ValidadorFase2";

export default function ValidadorFase2Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Validador FASE 2</h1>
          <p className="text-slate-600 mt-2">Validação automática da implementação dos 5 Cadastros Estruturantes</p>
        </div>

        <ValidadorFase2 />
      </div>
    </div>
  );
}