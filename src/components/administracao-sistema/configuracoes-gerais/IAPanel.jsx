import React from "react";
import IAGovernancaCompliance from "@/components/ia/IAGovernancaCompliance";
import ConfigCenter from "@/components/sistema/ConfigCenter";

import ProtectedSection from "@/components/security/ProtectedSection";

export default function IAPanel() {
  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="w-full min-h-[300px]">
        <ProtectedSection module="Sistema" section={["Configurações","IA"]} action="visualizar" fallback={<div className="p-3 text-sm text-slate-500">Sem permissão para ver configurações de IA.</div>}>
          <IAGovernancaCompliance />
        </ProtectedSection>
      </div>
      <div className="w-full min-h-[300px]">
        <ProtectedSection module="Sistema" section={["Configurações","IA"]} action="visualizar">
          <ConfigCenter scope="ia" />
        </ProtectedSection>
      </div>
    </div>
  );
}