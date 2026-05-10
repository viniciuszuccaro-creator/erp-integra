import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { planoRiskControls, planoValidationTracks } from './planoExecucaoData';

const levelClass = {
  Crítico: 'bg-red-100 text-red-700 hover:bg-red-100',
  Alto: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
  Médio: 'bg-amber-100 text-amber-700 hover:bg-amber-100'
};

export default function PlanoMelhoriaRiskPanel() {
  return (
    <div className="grid w-full gap-4 xl:grid-cols-[1.4fr_1fr]">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl text-slate-900">Riscos controlados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {planoRiskControls.map((risk) => (
            <div key={risk.title} className="flex w-full flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-slate-900">{risk.title}</p>
                <p className="text-sm text-slate-600">{risk.mitigation}</p>
              </div>
              <Badge className={levelClass[risk.level] || levelClass.Médio}>{risk.level}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="w-full border-emerald-100 bg-emerald-50">
        <CardHeader>
          <CardTitle className="text-xl text-slate-900">Trilhas de validação</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          {planoValidationTracks.map((track) => {
            const Icon = track.icon;
            return (
              <div key={track.label} className="flex items-center gap-3 rounded-xl border border-white bg-white/80 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{track.label}</p>
                  <p className="text-xs text-slate-500">{track.value}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}