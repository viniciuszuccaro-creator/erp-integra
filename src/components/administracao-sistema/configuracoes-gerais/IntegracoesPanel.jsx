import React from "react";
import CentralIntegracoes from "@/components/integracoes/CentralIntegracoes";
import StatusIntegracoes from "@/components/integracoes/StatusIntegracoes";

export default function IntegracoesPanel() {
  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="w-full min-h-[300px]"><CentralIntegracoes /></div>
      <div className="w-full min-h-[300px]"><StatusIntegracoes /></div>
    </div>
  );
}