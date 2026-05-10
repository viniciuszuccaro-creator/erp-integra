import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CriticalCompletionTrackCard from './CriticalCompletionTrackCard';
import CriticalAutomationMap from './CriticalAutomationMap';
import CriticalDoneDefinition from './CriticalDoneDefinition';
import { criticalCompletionTracks } from './criticalCompletionData';

export default function PlanoMelhoriaCriticalCompletionSuite() {
  const average = Math.round(criticalCompletionTracks.reduce((sum, track) => sum + track.coverage, 0) / criticalCompletionTracks.length);

  return (
    <section className="flex h-full w-full flex-col gap-4">
      <Card className="w-full border-slate-200 bg-slate-900 text-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Suíte de conclusão da prioridade crítica</CardTitle>
          <p className="text-sm text-slate-300">Validação objetiva do que já está conectado e do que precisa continuar sendo reforçado nos módulos críticos.</p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[180px_1fr]">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 text-center">
            <p className="text-4xl font-black">{average}%</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-slate-300">cobertura crítica</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {criticalCompletionTracks.map((track) => (
              <div key={track.id} className="rounded-xl border border-white/10 bg-white/10 p-3">
                <p className="text-sm font-semibold">{track.title}</p>
                <p className="mt-2 text-2xl font-bold">{track.coverage}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid w-full gap-4 xl:grid-cols-5">
        {criticalCompletionTracks.map((track) => (
          <CriticalCompletionTrackCard key={track.id} track={track} />
        ))}
      </div>

      <div className="grid w-full gap-4 xl:grid-cols-[1.4fr_1fr]">
        <CriticalAutomationMap />
        <CriticalDoneDefinition />
      </div>
    </section>
  );
}