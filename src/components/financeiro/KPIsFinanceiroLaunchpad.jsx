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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
          <CardTitle className="text-sm font-medium text-slate-600">A Receber</CardTitle>
          <TrendingUp className="w-5 h-5 text-green-600" />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-2xl font-bold text-green-600">
            R$ {receberPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          {contasReceberVencidas > 0 && (
            <p className="text-xs text-red-600 mt-1">{contasReceberVencidas} vencidas</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
          <CardTitle className="text-sm font-medium text-slate-600">A Pagar</CardTitle>
          <TrendingDown className="w-5 h-5 text-red-600" />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-2xl font-bold text-red-600">
            R$ {pagarPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          {contasPagarVencidas > 0 && (
            <p className="text-xs text-red-600 mt-1">{contasPagarVencidas} vencidas</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
          <CardTitle className="text-sm font-medium text-slate-600">Saldo Previsto</CardTitle>
          <DollarSign className={`w-5 h-5 ${saldo >= 0 ? 'text-emerald-600' : 'text-orange-600'}`} />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className={`text-2xl font-bold ${saldo >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
            R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
          <CardTitle className="text-sm font-medium text-slate-600">Alertas</CardTitle>
          <AlertCircle className="w-5 h-5 text-orange-600" />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-2xl font-bold text-orange-600">
            {contasReceberVencidas + contasPagarVencidas}
          </div>
          <p className="text-xs text-slate-500 mt-1">Contas vencidas</p>
        </CardContent>
      </Card>
    </div>
  );
}