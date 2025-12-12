import React from "react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import MasterDashboardV21_6 from "@/components/sistema/MASTER_DASHBOARD_V21_6";
import CertificacaoFinalV21_6_100 from "@/components/sistema/CERTIFICACAO_FINAL_V21_6_100";

/**
 * V21.6 FINAL - PÁGINA DE STATUS DO SISTEMA
 * Página dedicada para visualização completa do status do sistema
 */
export default function StatusSistemaV21_6() {
  const { empresaAtual } = useContextoVisual();

  return (
    <div className="w-full h-full">
      <MasterDashboardV21_6 empresaId={empresaAtual?.id} />
    </div>
  );
}