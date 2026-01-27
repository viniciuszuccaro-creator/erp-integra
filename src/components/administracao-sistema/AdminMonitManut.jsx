import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import ConfiguracaoMonitoramento from "@/components/sistema/ConfiguracaoMonitoramento";
import ConfiguracaoBackup from "@/components/sistema/ConfiguracaoBackup";

export default function AdminMonitManut() {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="w-full h-full">
        <CardContent className="p-4">
          <ConfiguracaoMonitoramento empresaId={empresaAtual?.id} grupoId={grupoAtual?.id} />
        </CardContent>
      </Card>
      <Card className="w-full h-full">
        <CardContent className="p-4">
          <ConfiguracaoBackup empresaId={empresaAtual?.id} grupoId={grupoAtual?.id} />
        </CardContent>
      </Card>
    </div>
  );
}