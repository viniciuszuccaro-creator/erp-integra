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
      <Card className="border-0 shadow-sm bg-blue-50 border-blue-200">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-700 mb-1">Integração Boleto/PIX</p>
              <p className="text-xl font-bold text-blue-900">
                {titulosComBoleto + titulosComPix}
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                {empresasComGateway} configurada(s)
              </p>
            </div>
            <Link2 className="w-7 h-7 text-blue-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-purple-50 border-purple-200">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-700 mb-1">Rateios Criados</p>
              <p className="text-xl font-bold text-purple-900">{rateiosCount}</p>
              <p className="text-xs text-purple-600 mt-0.5">Total distribuído</p>
            </div>
            <Split className="w-7 h-7 text-purple-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-orange-50 border-orange-200">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-700 mb-1">Conciliação Pendente</p>
              <p className="text-xl font-bold text-orange-900">{extratosNaoConciliados}</p>
              <p className="text-xs text-orange-600 mt-0.5">
                R$ {valorNaoConciliado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <CheckCircle2 className="w-7 h-7 text-orange-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-green-50 border-green-200">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-700 mb-1">Caixa - Liquidações</p>
              <p className="text-xl font-bold text-green-900">{ordensLiquidacaoPendentes}</p>
              <p className="text-xs text-green-600 mt-0.5">Ordens pendentes</p>
            </div>
            <DollarSign className="w-7 h-7 text-green-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-red-50 border-red-200">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-700 mb-1">Aprovações</p>
              <p className="text-xl font-bold text-red-900">{totalPendentesAprovacao}</p>
              <p className="text-xs text-red-600 mt-0.5">Descontos pendentes</p>
            </div>
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}