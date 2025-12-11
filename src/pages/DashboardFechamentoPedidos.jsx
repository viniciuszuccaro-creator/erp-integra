import React from "react";
import DashboardFechamentoPedidos from "@/components/comercial/DashboardFechamentoPedidos";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * V21.6 - PÁGINA DEDICADA AO DASHBOARD DE FECHAMENTO AUTOMÁTICO
 * Acesso direto via menu lateral para admins/gerentes
 */
export default function DashboardFechamentoPedidosPage() {
  const { empresaAtual } = useContextoVisual();

  return (
    <div className="w-full h-full">
      <DashboardFechamentoPedidos 
        windowMode={false} 
        empresaId={empresaAtual?.id} 
      />
    </div>
  );
}