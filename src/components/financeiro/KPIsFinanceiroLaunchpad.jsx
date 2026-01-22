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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
      <Card className="border-0 shadow-sm min-h-[90px] max-h-[90px] transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-1 px-2 pt-2">
          <CardTitle className="text-xs font-medium text-slate-600 truncate">A Receber</CardTitle>
          <TrendingUp className="w-3 h-3 text-green-600 flex-shrink-0" />
        </CardHeader>
        <CardContent className="px-2 pb-2">
          <div className="text-base font-bold text-green-600 truncate">
            R$ {(receberPendente / 1000).toFixed(0)}k
          </div>
          {contasReceberVencidas > 0 && (
            <p className="text-xs text-red-600">{contasReceberVencidas} venc.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm min-h-[90px] max-h-[90px] transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-1 px-2 pt-2">
          <CardTitle className="text-xs font-medium text-slate-600 truncate">A Pagar</CardTitle>
          <TrendingDown className="w-3 h-3 text-red-600 flex-shrink-0" />
        </CardHeader>
        <CardContent className="px-2 pb-2">
          <div className="text-base font-bold text-red-600 truncate">
            R$ {(pagarPendente / 1000).toFixed(0)}k
          </div>
          {contasPagarVencidas > 0 && (
            <p className="text-xs text-red-600">{contasPagarVencidas} venc.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm min-h-[90px] max-h-[90px] transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-1 px-2 pt-2">
          <CardTitle className="text-xs font-medium text-slate-600 truncate">Saldo Prev.</CardTitle>
          <DollarSign className={`w-3 h-3 flex-shrink-0 ${saldo >= 0 ? 'text-emerald-600' : 'text-orange-600'}`} />
        </CardHeader>
        <CardContent className="px-2 pb-2">
          <div className={`text-base font-bold truncate ${saldo >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
            R$ {(saldo / 1000).toFixed(0)}k
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm min-h-[90px] max-h-[90px] transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-1 px-2 pt-2">
          <CardTitle className="text-xs font-medium text-slate-600 truncate">Alertas</CardTitle>
          <AlertCircle className="w-3 h-3 text-orange-600 flex-shrink-0" />
        </CardHeader>
        <CardContent className="px-2 pb-2">
          <div className="text-base font-bold text-orange-600">
            {contasReceberVencidas + contasPagarVencidas}
          </div>
          <p className="text-xs text-slate-500">Vencidas</p>
        </CardContent>
      </Card>
    </div>
  );
}