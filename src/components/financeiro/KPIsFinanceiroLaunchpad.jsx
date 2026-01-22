import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';

export default function KPIsFinanceiroLaunchpad({ 
  receberPendente, 
  pagarPendente, 
  saldo, 
  contasReceberVencidas,
  contasPagarVencidas 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      <Card className="border-0 shadow-md min-h-[110px]">
        <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 pt-3">
          <CardTitle className="text-xs font-medium text-slate-600">A Receber</CardTitle>
          <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="text-xl font-bold text-green-600 truncate">
            R$ {(receberPendente / 1000).toFixed(0)}k
          </div>
          {contasReceberVencidas > 0 && (
            <p className="text-xs text-red-600 mt-1">{contasReceberVencidas} vencidas</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md min-h-[110px]">
        <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 pt-3">
          <CardTitle className="text-xs font-medium text-slate-600">A Pagar</CardTitle>
          <TrendingDown className="w-4 h-4 text-red-600 flex-shrink-0" />
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="text-xl font-bold text-red-600 truncate">
            R$ {(pagarPendente / 1000).toFixed(0)}k
          </div>
          {contasPagarVencidas > 0 && (
            <p className="text-xs text-red-600 mt-1">{contasPagarVencidas} vencidas</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md min-h-[110px]">
        <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 pt-3">
          <CardTitle className="text-xs font-medium text-slate-600">Saldo Previsto</CardTitle>
          <DollarSign className={`w-4 h-4 flex-shrink-0 ${saldo >= 0 ? 'text-emerald-600' : 'text-orange-600'}`} />
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className={`text-xl font-bold truncate ${saldo >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
            R$ {(saldo / 1000).toFixed(0)}k
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md min-h-[110px]">
        <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 pt-3">
          <CardTitle className="text-xs font-medium text-slate-600">Alertas</CardTitle>
          <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="text-xl font-bold text-orange-600">
            {contasReceberVencidas + contasPagarVencidas}
          </div>
          <p className="text-xs text-slate-500 mt-1">Contas vencidas</p>
        </CardContent>
      </Card>
    </div>
  );
}