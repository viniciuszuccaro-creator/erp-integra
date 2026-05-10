import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const steps = [
  'Finalizar limpeza técnica e validação de lint/build.',
  'Revisar módulo por módulo aplicando multiempresa e permissões.',
  'Modularizar telas grandes em componentes menores.',
  'Conectar IA às ações reais de cada área operacional.',
  'Medir performance, auditar e repetir o ciclo de melhoria.'
];

export default function PlanoMelhoriaNextSteps() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl text-slate-900">Próxima execução</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step, index) => (
          <div key={step} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
            {index === 0 ? <ArrowRight className="mt-0.5 h-5 w-5 text-blue-600" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 text-slate-400" />}
            <span className="text-sm leading-6 text-slate-700">{step}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}