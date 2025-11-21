import React from "react";
import ValidadorEtapa4Component from "../components/sistema/ValidadorEtapa4";

export default function ValidadorEtapa4() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Validador ETAPA 4 - Fluxo Financeiro Inteligente
        </h1>
        <p className="text-slate-600">
          Validação completa de Caixa Central, Conciliação, Aprovações Hierárquicas e Pagamentos Omnichannel
        </p>
      </div>

      <ValidadorEtapa4Component />
    </div>
  );
}