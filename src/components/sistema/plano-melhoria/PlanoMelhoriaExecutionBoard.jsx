import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { planoExecutionPillars } from './planoExecucaoData';

const statusClass = {
  'Em execução': 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  Validando: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  Planejado: 'bg-slate-100 text-slate-700 hover:bg-slate-100'
};

export default function PlanoMelhoriaExecutionBoard() {
  return (
    <Card className="w-full border-blue-100 bg-white">
      <CardHeader>
        <CardTitle className="text-xl text-slate-900">Execução real da Regra-Mãe</CardTitle>
        <p className="text-sm text-slate-500">Camadas já conectadas para transformar o plano em melhoria contínua nos módulos existentes.</p>
      </CardHeader>
      <CardContent className="grid w-full gap-4 md:grid-cols-2 xl:grid-cols-3">
        {planoExecutionPillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div key={pillar.id} className="flex h-full w-full flex-col rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{pillar.title}</h3>
                    <p className="text-xs text-slate-500">{pillar.progress}% concluído</p>
                  </div>
                </div>
                <Badge className={statusClass[pillar.status] || statusClass.Planejado}>{pillar.status}</Badge>
              </div>
              <p className="min-h-10 text-sm leading-5 text-slate-600">{pillar.description}</p>
              <Progress value={pillar.progress} className="mt-4 h-2" />
              <div className="mt-4 flex flex-wrap gap-2">
                {pillar.checkpoints.map((checkpoint) => (
                  <Badge key={checkpoint} variant="outline" className="bg-white text-slate-600">{checkpoint}</Badge>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}