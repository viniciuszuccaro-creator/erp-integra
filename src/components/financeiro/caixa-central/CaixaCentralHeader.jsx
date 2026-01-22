import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';

export default function CaixaCentralHeader() {
  return (
    <Card className="border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 min-h-[70px] max-h-[70px]">
      <CardHeader className="pb-2 pt-2 px-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-base">Caixa Central V22.0</CardTitle>
            <p className="text-xs text-slate-600">Gerenciamento Centralizado de Liquidações</p>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}