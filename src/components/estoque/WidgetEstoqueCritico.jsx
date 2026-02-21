import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock } from "lucide-react";

// Versão preditiva do widget de estoque crítico (IA)
// Mantém compatibilidade com prop "count" (fallback)
export default function WidgetEstoqueCritico({ preds14Count = 0, preds30Count = 0, count = 0, onNavigate }) {
  const hasPred = (preds14Count + preds30Count) > 0;
  const alert = hasPred || count > 0;
  return (
    <Card className={`border ${alert ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'} w-full`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertCircle className={`w-4 h-4 ${alert ? 'text-red-600' : 'text-slate-400'}`} />
          Risco de Ruptura (IA)
        </CardTitle>
        {alert && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Atenção</span>
        )}
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div>
            <div className={`text-3xl font-bold ${preds14Count > 0 ? 'text-red-600' : 'text-slate-700'}`}>{preds14Count}</div>
            <p className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> 14 dias</p>
          </div>
          <div>
            <div className={`text-3xl font-bold ${preds30Count > 0 ? 'text-amber-600' : 'text-slate-700'}`}>{preds30Count}</div>
            <p className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> 30 dias</p>
          </div>
          {!hasPred && (
            <div>
              <div className={`text-3xl font-bold ${count > 0 ? 'text-red-600' : 'text-slate-700'}`}>{count}</div>
              <p className="text-xs text-slate-500">abaixo do mínimo (atual)</p>
            </div>
          )}
        </div>
        <Button variant={alert ? 'destructive' : 'outline'} onClick={onNavigate}>
          Ver no Estoque
        </Button>
      </CardContent>
    </Card>
  );
}