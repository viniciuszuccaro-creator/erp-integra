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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
      <Card className="border-0 shadow-sm bg-blue-50 border-blue-200 min-h-[75px] max-h-[75px] transition-shadow hover:shadow-md">
        <CardContent className="p-2 flex items-center justify-between h-full">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-blue-700 mb-0.5 truncate">Boleto/PIX</p>
            <p className="text-base font-bold text-blue-900">
              {titulosComBoleto + titulosComPix}
            </p>
            <p className="text-xs text-blue-600 truncate">
              {empresasComGateway} config.
            </p>
          </div>
          <Link2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-purple-50 border-purple-200 min-h-[75px] max-h-[75px] transition-shadow hover:shadow-md">
        <CardContent className="p-2 flex items-center justify-between h-full">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-purple-700 mb-0.5 truncate">Rateios</p>
            <p className="text-base font-bold text-purple-900">{rateiosCount}</p>
            <p className="text-xs text-purple-600 truncate">Distribuídos</p>
          </div>
          <Split className="w-5 h-5 text-purple-400 flex-shrink-0" />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-orange-50 border-orange-200 min-h-[75px] max-h-[75px] transition-shadow hover:shadow-md">
        <CardContent className="p-2 flex items-center justify-between h-full">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-orange-700 mb-0.5 truncate">Conciliação</p>
            <p className="text-base font-bold text-orange-900">{extratosNaoConciliados}</p>
            <p className="text-xs text-orange-600 truncate">
              R$ {(valorNaoConciliado / 1000).toFixed(0)}k
            </p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-orange-400 flex-shrink-0" />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-green-50 border-green-200 min-h-[75px] max-h-[75px] transition-shadow hover:shadow-md">
        <CardContent className="p-2 flex items-center justify-between h-full">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-green-700 mb-0.5 truncate">Liquidações</p>
            <p className="text-base font-bold text-green-900">{ordensLiquidacaoPendentes}</p>
            <p className="text-xs text-green-600 truncate">Pendentes</p>
          </div>
          <DollarSign className="w-5 h-5 text-green-400 flex-shrink-0" />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-red-50 border-red-200 min-h-[75px] max-h-[75px] transition-shadow hover:shadow-md">
        <CardContent className="p-2 flex items-center justify-between h-full">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-red-700 mb-0.5 truncate">Aprovações</p>
            <p className="text-base font-bold text-red-900">{totalPendentesAprovacao}</p>
            <p className="text-xs text-red-600 truncate">Pendentes</p>
          </div>
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
        </CardContent>
      </Card>
    </div>
  );
}