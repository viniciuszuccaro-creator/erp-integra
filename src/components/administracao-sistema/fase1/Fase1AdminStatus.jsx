import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Fase1AdminStatus() {
  return (
    <Card className="w-full border-blue-200 bg-blue-50/60">
      <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">Administração do Sistema — fase 1 conectada</p>
          <p className="text-sm text-slate-700">Inventário visível, mapa de toggles reais, camada única de configuração, matriz única de controles e checklist por fluxo já fechados na Administração do Sistema.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Inventário</Badge>
          <Badge variant="outline">Hook único</Badge>
          <Badge variant="outline">Toggles-mãe</Badge>
          <Badge variant="outline">Fluxos principais</Badge>
        </div>
      </CardContent>
    </Card>
  );
}