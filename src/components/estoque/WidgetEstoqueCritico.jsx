import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function WidgetEstoqueCritico({ count = 0, onNavigate }) {
  const alert = count > 0;
  return (
    <Card className={`border ${alert ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertCircle className={`w-4 h-4 ${alert ? 'text-red-600' : 'text-slate-400'}`} />
          Estoque Crítico
        </CardTitle>
        {alert && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Atenção</span>
        )}
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div>
          <div className={`text-3xl font-bold ${alert ? 'text-red-600' : 'text-slate-700'}`}>{count}</div>
          <p className="text-xs text-slate-500">produtos abaixo do mínimo</p>
        </div>
        <Button variant={alert ? 'destructive' : 'outline'} onClick={onNavigate}>
          Ver no Estoque
        </Button>
      </CardContent>
    </Card>
  );
}