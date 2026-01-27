import React from "react";
import ConfigFiscalAutomatica from "@/components/fiscal/ConfigFiscalAutomatica";
import ConfiguracaoNFeForm from "@/components/cadastros/ConfiguracaoNFeForm";

import ProtectedSection from "@/components/security/ProtectedSection";

export default function FiscalPanel() {
  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="w-full min-h-[300px]">
        <ProtectedSection module="Sistema" section={["Configurações","Fiscal"]} action="visualizar" fallback={<div className="p-3 text-sm text-slate-500">Sem permissão para ver Configurações Fiscais.</div>}>
          <ConfigFiscalAutomatica />
        </ProtectedSection>
      </div>
      <div className="w-full min-h-[300px]">
        <ProtectedSection module="Sistema" section={["Configurações","Fiscal"]} action="visualizar">
          <ConfiguracaoNFeForm />
        </ProtectedSection>
      </div>
    </div>
  );
}