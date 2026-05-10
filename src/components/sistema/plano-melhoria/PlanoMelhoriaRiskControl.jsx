import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Database, Lock, Workflow } from 'lucide-react';

const safeguards = [
  { title: 'Nunca apagar', description: 'Melhorar e conectar módulos existentes antes de criar duplicidades.', icon: Database, level: 'Regra-Mãe' },
  { title: 'Acesso granular', description: 'Manter proteção por módulo, aba, ação e campo sensível.', icon: Lock, level: 'Segurança' },
  { title: 'Pequenos arquivos', description: 'Toda evolução nova deve ficar modular e reutilizável.', icon: Workflow, level: 'Arquitetura' },
  { title: 'Validação contínua', description: 'Cada melhoria entra com rastreio, impacto e próximo passo.', icon: AlertTriangle, level: 'Governança' }
];

export default function PlanoMelhoriaRiskControl() {
  return (
    <Card className="w-full border-amber-100 bg-gradient-to-br from-amber-50 to-white">
      <CardHeader>
        <CardTitle className="text-xl text-slate-900">Controle de riscos e regras obrigatórias</CardTitle>
      </CardHeader>
      <CardContent className="grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {safeguards.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="h-full rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <Icon className="h-5 w-5 text-amber-600" />
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">{item.level}</Badge>
              </div>
              <p className="font-semibold text-slate-900">{item.title}</p>
              <p className="mt-2 text-sm leading-5 text-slate-600">{item.description}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}