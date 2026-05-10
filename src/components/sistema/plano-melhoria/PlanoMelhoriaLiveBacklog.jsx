import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ListChecks } from 'lucide-react';

const statusColors = {
  Planejado: 'bg-slate-100 text-slate-700',
  'Em Execução': 'bg-blue-100 text-blue-700',
  Validando: 'bg-amber-100 text-amber-700',
  Concluído: 'bg-emerald-100 text-emerald-700'
};

export default function PlanoMelhoriaLiveBacklog() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['plano-melhoria-items'],
    queryFn: () => base44.entities.PlanoMelhoriaItem.list('-updated_date', 12),
    initialData: []
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <ListChecks className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl text-slate-900">Backlog vivo multiempresa</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-slate-500">Carregando melhorias...</p>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            Nenhuma melhoria persistida ainda. As próximas execuções serão registradas aqui por módulo, empresa e grupo.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.titulo}</p>
                    <p className="text-xs text-slate-500">{item.modulo} • {item.fase}</p>
                  </div>
                  <Badge className={statusColors[item.status] || statusColors.Planejado}>{item.status}</Badge>
                </div>
                <p className="mb-3 line-clamp-2 text-xs leading-5 text-slate-600">{item.descricao || item.impacto || 'Melhoria em andamento.'}</p>
                <Progress value={item.percentual || 0} className="h-2" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}