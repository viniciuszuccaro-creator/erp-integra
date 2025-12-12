import React from "react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import MasterCertificacaoV21_6 from "@/components/sistema/MASTER_CERTIFICACAO_V21_6";
import MasterDashboardV21_6 from "@/components/sistema/MASTER_DASHBOARD_V21_6";

/**
 * V21.6 FINAL - PÁGINA DE STATUS DO SISTEMA
 * Página dedicada para visualização completa do status do sistema
 */
export default function StatusSistemaV21_6() {
  const { empresaAtual } = useContextoVisual();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <MasterCertificacaoV21_6 windowMode={false} />
        <MasterDashboardV21_6 windowMode={false} empresaId={empresaAtual?.id} />
      </div>
    </div>
  );
}