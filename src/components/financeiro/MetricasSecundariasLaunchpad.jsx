import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link2, Split, CheckCircle2, DollarSign, AlertCircle } from 'lucide-react';

export default function MetricasSecundariasLaunchpad({ 
  titulosComBoleto,
  titulosComPix,
  empresasComGateway,
  rateiosCount,
  extratosNaoConciliados,
  valorNaoConciliado,
  ordensLiquidacaoPendentes,
  totalPendentesAprovacao
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
      <Card className="border-0 shadow-sm bg-blue-50 border-blue-200 min-h-[90px]">
        <CardContent className="p-3 flex items-center justify-between h-full">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-blue-700 mb-1 truncate">Integração Boleto/PIX</p>
            <p className="text-lg font-bold text-blue-900">
              {titulosComBoleto + titulosComPix}
            </p>
            <p className="text-xs text-blue-600 truncate">
              {empresasComGateway} configurada(s)
            </p>
          </div>
          <Link2 className="w-6 h-6 text-blue-400 flex-shrink-0" />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-purple-50 border-purple-200 min-h-[90px]">
        <CardContent className="p-3 flex items-center justify-between h-full">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-purple-700 mb-1 truncate">Rateios Criados</p>
            <p className="text-lg font-bold text-purple-900">{rateiosCount}</p>
            <p className="text-xs text-purple-600 truncate">Total distribuído</p>
          </div>
          <Split className="w-6 h-6 text-purple-400 flex-shrink-0" />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-orange-50 border-orange-200 min-h-[90px]">
        <CardContent className="p-3 flex items-center justify-between h-full">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-orange-700 mb-1 truncate">Conciliação Pendente</p>
            <p className="text-lg font-bold text-orange-900">{extratosNaoConciliados}</p>
            <p className="text-xs text-orange-600 truncate">
              R$ {(valorNaoConciliado / 1000).toFixed(0)}k
            </p>
          </div>
          <CheckCircle2 className="w-6 h-6 text-orange-400 flex-shrink-0" />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-green-50 border-green-200 min-h-[90px]">
        <CardContent className="p-3 flex items-center justify-between h-full">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-green-700 mb-1 truncate">Caixa - Liquidações</p>
            <p className="text-lg font-bold text-green-900">{ordensLiquidacaoPendentes}</p>
            <p className="text-xs text-green-600 truncate">Ordens pendentes</p>
          </div>
          <DollarSign className="w-6 h-6 text-green-400 flex-shrink-0" />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-red-50 border-red-200 min-h-[90px]">
        <CardContent className="p-3 flex items-center justify-between h-full">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-red-700 mb-1 truncate">Aprovações</p>
            <p className="text-lg font-bold text-red-900">{totalPendentesAprovacao}</p>
            <p className="text-xs text-red-600 truncate">Descontos pendentes</p>
          </div>
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
        </CardContent>
      </Card>
    </div>
  );
}