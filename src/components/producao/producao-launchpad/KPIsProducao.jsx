import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Clock, CheckCircle, TrendingUp } from "lucide-react";

export default function KPIsProducao({ 
  totalOPs, 
  opsLiberadas, 
  opsEmProducao, 
  opsFinalizadas 
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium">Total OPs</CardTitle>
          <Package className="w-4 h-4 text-orange-600" />
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="text-2xl font-bold text-orange-600">{totalOPs}</div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-yellow-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium">Liberadas</CardTitle>
          <Clock className="w-4 h-4 text-yellow-600" />
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="text-2xl font-bold text-yellow-700">{opsLiberadas}</div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-blue-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium">Produção</CardTitle>
          <TrendingUp className="w-4 h-4 text-blue-600" />
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="text-2xl font-bold text-blue-700">{opsEmProducao}</div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-green-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium">Finalizadas</CardTitle>
          <CheckCircle className="w-4 h-4 text-green-600" />
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="text-2xl font-bold text-green-700">{opsFinalizadas}</div>
        </CardContent>
      </Card>
    </div>
  );
}