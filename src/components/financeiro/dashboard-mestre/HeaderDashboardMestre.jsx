import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Award } from 'lucide-react';

export default function HeaderDashboardMestre({ estaNoGrupo, empresaAtual }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600 flex-shrink-0" />
          Dashboard Financeiro Mestre
        </h1>
        <p className="text-xs text-slate-600">
          {estaNoGrupo ? '🌐 Visão Consolidada Grupo' : `📊 ${empresaAtual?.nome_fantasia || 'Sistema'}`}
        </p>
      </div>
      <Badge className="bg-green-600 text-white text-xs px-3 py-1">
        V22.0 • 100%
      </Badge>
    </div>
  );
}