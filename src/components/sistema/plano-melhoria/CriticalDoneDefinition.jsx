import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { criticalDoneDefinition } from './criticalCompletionData';

export default function CriticalDoneDefinition() {
  return (
    <Card className="h-full w-full border-emerald-100 bg-gradient-to-br from-emerald-50 to-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
          <ShieldCheck className="h-5 w-5 text-emerald-600" /> Definição de concluído crítico
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {criticalDoneDefinition.map((item) => (
          <div key={item} className="flex gap-3 rounded-xl border border-emerald-100 bg-white/80 p-3 text-sm text-slate-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>{item}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}