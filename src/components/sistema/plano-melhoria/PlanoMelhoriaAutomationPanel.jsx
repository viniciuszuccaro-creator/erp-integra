import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Route, WalletCards, PackageSearch } from 'lucide-react';

const automations = [
  { name: 'IA Financeira', fn: 'iaFinanceAnomalyScan', icon: WalletCards, area: 'Financeiro' },
  { name: 'Preço Inteligente', fn: 'productPriceOptimizer', icon: Bot, area: 'Comercial/Estoque' },
  { name: 'Rota Otimizada', fn: 'optimizeDeliveryRoute', icon: Route, area: 'Expedição' },
  { name: 'Estoque e Inventário', fn: 'applyInventoryAdjustments', icon: PackageSearch, area: 'Estoque' }
];

export default function PlanoMelhoriaAutomationPanel() {
  return (
    <Card className="w-full border-purple-100 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="text-xl text-slate-900">IA e automações conectadas</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {automations.map((automation) => {
          const Icon = automation.icon;
          return (
            <div key={automation.fn} className="rounded-xl border border-white bg-white/80 p-4 shadow-sm">
              <Icon className="mb-3 h-6 w-6 text-purple-600" />
              <p className="font-semibold text-slate-900">{automation.name}</p>
              <p className="mt-1 text-xs text-slate-500">{automation.fn}</p>
              <Badge className="mt-3 bg-purple-100 text-purple-700 hover:bg-purple-100">{automation.area}</Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}