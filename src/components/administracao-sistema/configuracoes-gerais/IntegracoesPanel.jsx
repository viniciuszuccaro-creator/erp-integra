import React from "react";
import CentralIntegracoes from "@/components/integracoes/CentralIntegracoes";
// import StatusIntegracoes from "@/components/integracoes/StatusIntegracoes";

import ProtectedSection from "@/components/security/ProtectedSection";

export default function IntegracoesPanel() {
  return (
    <div className="w-full h-full">
      <div className="w-full min-h-[300px]">
        <ProtectedSection module="Sistema" section={["Configurações","Integrações"]} action="visualizar" fallback={<div className="p-3 text-sm text-slate-500">Sem permissão para ver Integrações.</div>}>
          <CentralIntegracoes />
        </ProtectedSection>
      </div>
    </div>
  );
}