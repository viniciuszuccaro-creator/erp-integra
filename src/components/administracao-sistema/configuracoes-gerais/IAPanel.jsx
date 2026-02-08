import React from "react";
import ConfigCenter from "@/components/sistema/ConfigCenter";

import ProtectedSection from "@/components/security/ProtectedSection";

export default function IAPanel() {
  return (
    <div className="w-full h-full grid grid-cols-1 2xl:grid-cols-2 gap-6 items-start">
      <div className="w-full min-h-[300px]">
        <ProtectedSection module="Sistema" section={["Configurações","IA"]} action="visualizar" fallback={<div className="p-3 text-sm text-slate-500">Sem permissão para ver configurações de IA.</div>}>
          <div className="w-full h-full p-4 border rounded-lg bg-slate-50 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900">Governança & Compliance de IA</h3>
              <p className="text-sm text-slate-600">Painel centralizado em Segurança & Governança. Acesse o painel completo por lá.</p>
            </div>
            <Link to={createPageUrl('AdministracaoSistema?tab=seguranca&segTab=compliance')} className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Abrir painel
            </Link>
          </div>
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