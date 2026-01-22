import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Target, BarChart3 } from "lucide-react";

export default function KPIsCRM({ 
  oportunidadesAbertas, 
  totalOportunidades,
  valorPipeline, 
  valorPonderado,
  taxaConversao
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium">Abertas</CardTitle>
          <TrendingUp className="w-4 h-4 text-blue-600" />
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="text-2xl font-bold text-blue-600">{oportunidadesAbertas}</div>
          <p className="text-xs text-slate-500">de {totalOportunidades}</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium">Pipeline</CardTitle>
          <DollarSign className="w-4 h-4 text-green-600" />
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="text-xl font-bold text-green-600">
            {valorPipeline > 1000 ? `${(valorPipeline/1000).toFixed(0)}k` : valorPipeline.toFixed(0)}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium">Ponderado</CardTitle>
          <Target className="w-4 h-4 text-purple-600" />
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="text-xl font-bold text-purple-600">
            {valorPonderado > 1000 ? `${(valorPonderado/1000).toFixed(0)}k` : valorPonderado.toFixed(0)}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium">Conversão</CardTitle>
          <BarChart3 className="w-4 h-4 text-orange-600" />
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="text-2xl font-bold text-orange-600">{taxaConversao}%</div>
        </CardContent>
      </Card>
    </div>
  );
}