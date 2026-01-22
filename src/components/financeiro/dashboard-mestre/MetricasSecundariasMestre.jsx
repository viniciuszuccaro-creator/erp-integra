import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Zap, FileText, Repeat, Globe, AlertCircle } from 'lucide-react';

export default function MetricasSecundariasMestre({ 
  formasAtivas,
  gatewaysAtivos, 
  tiposDespesa,
  configsRecorrentes,
  empresas,
  extratosPendentes
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
      <Card className="bg-white border min-h-[65px] max-h-[65px]">
        <CardContent className="p-2">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-600 truncate">Formas Ativas</p>
              <p className="text-base font-bold text-blue-600">{formasAtivas}</p>
            </div>
            <CreditCard className="w-5 h-5 text-blue-400 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border min-h-[65px] max-h-[65px]">
        <CardContent className="p-2">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-600 truncate">Gateways</p>
              <p className="text-base font-bold text-purple-600">{gatewaysAtivos}</p>
            </div>
            <Zap className="w-5 h-5 text-purple-400 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border min-h-[65px] max-h-[65px]">
        <CardContent className="p-2">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-600 truncate">Tipos Desp.</p>
              <p className="text-base font-bold text-orange-600">{tiposDespesa.length}</p>
            </div>
            <FileText className="w-5 h-5 text-orange-400 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border min-h-[65px] max-h-[65px]">
        <CardContent className="p-2">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-600 truncate">Recorrentes</p>
              <p className="text-base font-bold text-green-600">{configsRecorrentes.length}</p>
            </div>
            <Repeat className="w-5 h-5 text-green-400 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border min-h-[65px] max-h-[65px]">
        <CardContent className="p-2">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-600 truncate">Empresas</p>
              <p className="text-base font-bold text-indigo-600">{empresas.length}</p>
            </div>
            <Globe className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border min-h-[65px] max-h-[65px]">
        <CardContent className="p-2">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-600 truncate">Extratos</p>
              <p className="text-base font-bold text-teal-600">{extratosPendentes}</p>
            </div>
            <AlertCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}