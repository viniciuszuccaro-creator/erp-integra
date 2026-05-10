import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2 } from 'lucide-react';

export default function CriticalCompletionTrackCard({ track }) {
  return (
    <Card className="h-full w-full border-slate-200 bg-white shadow-sm">
      <CardContent className="flex h-full w-full flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-900">{track.title}</p>
            <p className="mt-1 text-xs text-slate-500">{track.modules.join(' • ')}</p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">{track.status}</Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Cobertura validada</span>
            <span className="font-semibold text-slate-700">{track.coverage}%</span>
          </div>
          <Progress value={track.coverage} className="h-2" />
        </div>
        <div className="grid gap-2">
          {track.evidence.map((evidence) => (
            <div key={evidence} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              {evidence}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}