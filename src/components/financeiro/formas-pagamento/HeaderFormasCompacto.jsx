import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

export default function HeaderFormasCompacto() {
  return (
    <Card className="border-2 border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-[70px] max-h-[70px]">
      <CardHeader className="pb-2 pt-2 px-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-base">Formas de Pagamento V22.0</CardTitle>
            <p className="text-xs text-slate-600">Analytics completo de uso e performance</p>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}