import React from "react";
import ConfigFiscalAutomatica from "@/components/fiscal/ConfigFiscalAutomatica";
import ConfiguracaoNFeForm from "@/components/cadastros/ConfiguracaoNFeForm";

import ProtectedSection from "@/components/security/ProtectedSection";

export default function FiscalPanel() {
  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="w-full min-h-[300px]"><ConfigFiscalAutomatica /></div>
      <div className="w-full min-h-[300px]"><ConfiguracaoNFeForm /></div>
    </div>
  );
}