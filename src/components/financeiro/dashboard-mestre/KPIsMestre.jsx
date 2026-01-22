import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Repeat, Link2 } from 'lucide-react';

export default function KPIsMestre({ 
  totalReceber, 
  totalPagar, 
  saldoLiquido, 
  crFiltradas, 
  cpFiltradas,
  totalRecorrentesAtivas,
  valorMensalRecorrente,
  conciliacoesAutomaticas,
  scoreMedioConciliacao
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <Card className="border-green-300 bg-gradient-to-br from-green-50 to-emerald-100 min-h-[95px] max-h-[95px]">
        <CardHeader className="pb-1 pt-2 px-2.5">
          <CardTitle className="text-xs text-green-700 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 flex-shrink-0" />
            A Receber
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2.5 pt-0">
          <p className="text-xl font-bold text-green-700 truncate">
            R$ {totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-green-600">
            {crFiltradas.filter(c => c.status === 'Pendente').length} títulos
          </p>
        </CardContent>
      </Card>

      <Card className="border-red-300 bg-gradient-to-br from-red-50 to-pink-100 min-h-[95px] max-h-[95px]">
        <CardHeader className="pb-1 pt-2 px-2.5">
          <CardTitle className="text-xs text-red-700 flex items-center gap-1">
            <TrendingDown className="w-3 h-3 flex-shrink-0" />
            A Pagar
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2.5 pt-0">
          <p className="text-xl font-bold text-red-700 truncate">
            R$ {totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-red-600">
            {cpFiltradas.filter(c => c.status === 'Pendente').length} títulos
          </p>
        </CardContent>
      </Card>

      <Card className={`border-2 ${saldoLiquido >= 0 ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-100' : 'border-orange-400 bg-gradient-to-br from-orange-50 to-amber-100'} min-h-[95px] max-h-[95px]`}>
        <CardHeader className="pb-1 pt-2 px-2.5">
          <CardTitle className="text-xs flex items-center gap-1">
            <DollarSign className="w-3 h-3 flex-shrink-0" />
            Saldo Líquido
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2.5 pt-0">
          <p className={`text-xl font-bold truncate ${saldoLiquido >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
            R$ {saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </p>
          <p className={`text-xs ${saldoLiquido >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            {saldoLiquido >= 0 ? '✅ Positivo' : '⚠️ Negativo'}
          </p>
        </CardContent>
      </Card>

      <Card className="border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-100 min-h-[95px] max-h-[95px]">
        <CardHeader className="pb-1 pt-2 px-2.5">
          <CardTitle className="text-xs text-purple-700 flex items-center gap-1">
            <Repeat className="w-3 h-3 flex-shrink-0" />
            Recorrentes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2.5 pt-0">
          <p className="text-xl font-bold text-purple-700">{totalRecorrentesAtivas}</p>
          <p className="text-xs text-purple-600 truncate">
            R$ {valorMensalRecorrente.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}/mês
          </p>
        </CardContent>
      </Card>

      <Card className="border-cyan-300 bg-gradient-to-br from-cyan-50 to-teal-100 min-h-[95px] max-h-[95px]">
        <CardHeader className="pb-1 pt-2 px-2.5">
          <CardTitle className="text-xs text-cyan-700 flex items-center gap-1">
            <Link2 className="w-3 h-3 flex-shrink-0" />
            Conciliação IA
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2.5 pt-0">
          <p className="text-xl font-bold text-cyan-700">{conciliacoesAutomaticas}</p>
          <p className="text-xs text-cyan-600">
            Score: {scoreMedioConciliacao.toFixed(0)}%
          </p>
        </CardContent>
      </Card>
    </div>
  );
}