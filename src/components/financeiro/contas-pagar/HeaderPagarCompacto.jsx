import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown } from 'lucide-react';

export default function HeaderPagarCompacto() {
  return (
    <Card className="border-2 border-red-500 bg-gradient-to-br from-red-50 to-rose-50 min-h-[70px] max-h-[70px]">
      <CardHeader className="pb-2 pt-2 px-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
            <TrendingDown className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-base">Contas a Pagar V22.0</CardTitle>
            <p className="text-xs text-slate-600">Fornecedores e obrigações</p>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}