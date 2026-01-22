import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export default function KPIsConciliacao({ extratosPendentes, extratosConciliados, divergencias }) {
  return (
    <div className="grid grid-cols-4 gap-2 min-h-[90px] max-h-[90px]">
      <Card className="bg-blue-50 border-blue-200 shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-700">Pendentes</p>
              <p className="text-2xl font-bold text-blue-900">{extratosPendentes}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600 opacity-30" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200 shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-700">Conciliados</p>
              <p className="text-2xl font-bold text-green-900">{extratosConciliados}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-600 opacity-30" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-orange-50 border-orange-200 shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-700">Divergências</p>
              <p className="text-2xl font-bold text-orange-900">{divergencias}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-600 opacity-30" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-purple-50 border-purple-200 shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-700">IA Ativada</p>
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}