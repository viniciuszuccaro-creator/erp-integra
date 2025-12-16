import React from "react";
import ValidadorFinalV21_8 from "@/components/sistema/ValidadorFinalV21_8";
import StatusFinanceiroV21_8_Final from "@/components/sistema/StatusFinanceiroV21_8_Final";

/**
 * PÁGINA DE VALIDAÇÃO V21.8
 * Dashboard completo de validação e certificação
 */
export default function ValidadorV21_8() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Sistema Financeiro V21.8 - Validação Final
        </h1>
        <p className="text-slate-600">
          Certificação de completude, integrações e funcionalidades
        </p>
      </div>

      <StatusFinanceiroV21_8_Final />
      <ValidadorFinalV21_8 />
    </div>
  );
}