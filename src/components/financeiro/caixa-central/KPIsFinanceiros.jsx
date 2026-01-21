import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, DollarSign, Wallet, CreditCard } from 'lucide-react';

export default function KPIsFinanceiros({ totalReceber, totalPagar, saldoLiquido, totalFormasPagamento, contasReceberCount, contasPagarCount }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-xs font-semibold text-slate-700">A Receber</span>
          </div>
          <p className="text-xl font-bold text-green-600">
            R$ {totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-600 mt-0.5">{contasReceberCount} títulos</p>
        </CardContent>
      </Card>

      <Card className="border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-red-600" />
            <span className="text-xs font-semibold text-slate-700">A Pagar</span>
          </div>
          <p className="text-xl font-bold text-red-600">
            R$ {totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-600 mt-0.5">{contasPagarCount} títulos</p>
        </CardContent>
      </Card>

      <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-slate-700">Saldo Líquido</span>
          </div>
          <p className={`text-xl font-bold ${saldoLiquido >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            R$ {Math.abs(saldoLiquido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-600 mt-0.5">{saldoLiquido >= 0 ? 'Positivo' : 'Negativo'}</p>
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-semibold text-slate-700">Formas Pagamento</span>
          </div>
          <p className="text-xl font-bold text-purple-600">{totalFormasPagamento}</p>
          <p className="text-xs text-slate-600 mt-0.5">Tipos diferentes</p>
        </CardContent>
      </Card>
    </div>
  );
}