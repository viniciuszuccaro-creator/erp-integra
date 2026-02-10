import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function FinancialSummary({ receitasPendentes, despesasPendentes, fluxoCaixa }) {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="border-b bg-slate-50">
        <CardTitle>Resumo Financeiro do Período</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-sm text-slate-600 mb-1">Receitas Pendentes</p>
            <p className="text-2xl font-bold text-green-600">R$ {receitasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="text-center p-6 bg-red-50 rounded-lg">
            <TrendingDown className="w-8 h-8 mx-auto mb-2 text-red-600" />
            <p className="text-sm text-slate-600 mb-1">Despesas Pendentes</p>
            <p className="text-2xl font-bold text-red-600">R$ {despesasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className={`text-center p-6 ${fluxoCaixa >= 0 ? 'bg-blue-50' : 'bg-orange-50'} rounded-lg`}>
            <DollarSign className={`w-8 h-8 mx-auto mb-2 ${fluxoCaixa >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            <p className="text-sm text-slate-600 mb-1">Saldo Projetado</p>
            <p className={`text-2xl font-bold ${fluxoCaixa >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>R$ {fluxoCaixa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}