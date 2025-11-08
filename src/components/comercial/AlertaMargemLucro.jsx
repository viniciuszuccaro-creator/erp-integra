import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, TrendingDown, DollarSign } from "lucide-react";

export default function AlertaMargemLucro({ margemAtual = 0, margemMinima = 15, valorTotal = 0 }) {
  const diferenca = margemMinima - margemAtual;
  const ajusteNecessario = (valorTotal * diferenca) / 100;

  return (
    <Alert className="bg-red-50 border-red-300">
      <AlertTriangle className="w-5 h-5 text-red-600" />
      <AlertDescription>
        <div className="space-y-2">
          <p className="font-bold text-red-800">
            ⚠️ Margem de Lucro Abaixo do Mínimo
          </p>
          
          <div className="grid grid-cols-3 gap-4 mt-3">
            <Card className="border-2 border-red-200">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-slate-600">Margem Atual</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="text-2xl font-bold text-red-600">
                    {margemAtual.toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-slate-600">Margem Mínima</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className="text-2xl font-bold text-green-600">
                    {margemMinima.toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-slate-600">Ajuste Necessário</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <DollarSign className="w-4 h-4 text-orange-600" />
                  <span className="text-2xl font-bold text-orange-600">
                    {ajusteNecessario.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-3 p-3 bg-red-100 rounded">
            <p className="text-sm text-red-800">
              <strong>Ação necessária:</strong> Aumentar o valor total em R$ {ajusteNecessario.toFixed(2)} 
              ou reduzir custos/descontos para atingir a margem mínima de {margemMinima}%.
            </p>
            <p className="text-xs text-red-700 mt-2">
              💡 Este pedido necessitará aprovação gerencial para prosseguir.
            </p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}