import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, DollarSign, CreditCard, Zap } from 'lucide-react';

export default function KPIsFormas({ totalAtivas, totalPDV, totalEcommerce, totalIntegradas }) {
  return (
    <div className="grid grid-cols-4 gap-2 min-h-[90px] max-h-[90px]">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600">Formas Ativas</p>
              <p className="text-2xl font-bold text-green-600">{totalAtivas}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600">PDV</p>
              <p className="text-2xl font-bold text-blue-600">{totalPDV}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600">E-commerce</p>
              <p className="text-2xl font-bold text-purple-600">{totalEcommerce}</p>
            </div>
            <CreditCard className="w-8 h-8 text-purple-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600">Integradas</p>
              <p className="text-2xl font-bold text-orange-600">{totalIntegradas}</p>
            </div>
            <Zap className="w-8 h-8 text-orange-600 opacity-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}