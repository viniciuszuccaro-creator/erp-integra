import React from "react";
import DashboardSeguranca from "@/components/sistema/DashboardSeguranca";

export default function SegurancaDashboard() {
  // Wrapper para manter arquitetura: permite evoluir sem mover arquivo original
  return (
    <div className="w-full h-full">
      <DashboardSeguranca
        estatisticas={{ cobertura: 0, totalUsuarios: 0, conflitosTotal: 0 }}
        usuarios={[]}
        auditoriaAcessos={[]}
      />
    </div>
  );
}