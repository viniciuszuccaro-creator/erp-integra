import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { planoModuleSprints } from './planoExecucaoData';

const priorityClass = {
  Crítica: 'bg-red-100 text-red-700 hover:bg-red-100',
  Alta: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
  Média: 'bg-blue-100 text-blue-700 hover:bg-blue-100'
};

export default function PlanoMelhoriaSprintPanel() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl text-slate-900">Sprints por módulo existente</CardTitle>
        <p className="text-sm text-slate-500">Prioridades organizadas sem apagar funcionalidades: acrescentar, reorganizar, conectar e melhorar.</p>
      </CardHeader>
      <CardContent className="grid w-full gap-3 md:grid-cols-2 xl:grid-cols-5">
        {planoModuleSprints.map((sprint) => (
          <div key={sprint.module} className="flex h-full w-full flex-col rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="font-semibold text-slate-900">{sprint.module}</h3>
              <Badge className={priorityClass[sprint.priority] || priorityClass.Média}>{sprint.priority}</Badge>
            </div>
            <p className="flex-1 text-sm leading-5 text-slate-600">{sprint.focus}</p>
            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-xs text-slate-500">
              <span>{sprint.owner}</span>
              <span>{sprint.status}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}