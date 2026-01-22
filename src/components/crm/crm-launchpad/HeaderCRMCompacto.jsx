import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function HeaderCRMCompacto() {
  return (
    <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-600 to-purple-600">
      <CardContent className="p-2.5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">CRM - Relacionamento</h1>
            <p className="text-blue-100 text-xs">Oportunidades, funil e conversões</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}