import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2 } from 'lucide-react';
import { melhoriaStatusLabels } from './melhoriaPlanData';

export default function PlanoMelhoriaPhaseCard({ phase }) {
  const Icon = phase.icon;

  return (
    <Card className="h-full w-full overflow-hidden border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <CardContent className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${phase.color} shadow-md`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <Badge variant="outline" className="bg-slate-50 text-xs text-slate-600">
            {melhoriaStatusLabels[phase.status] || phase.status}
          </Badge>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-900">{phase.title}</h3>
          <p className="text-sm leading-6 text-slate-600">{phase.goal}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Progresso</span>
            <span className="font-semibold text-slate-700">{phase.progress}%</span>
          </div>
          <Progress value={phase.progress} className="h-2" />
        </div>

        <div className="mt-auto space-y-2 pt-2">
          {phase.items.map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}