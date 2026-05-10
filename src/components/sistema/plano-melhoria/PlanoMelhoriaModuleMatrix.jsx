import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const modules = ['Dashboard', 'CRM', 'Comercial', 'Estoque', 'Compras', 'Financeiro', 'Expedição', 'Produção', 'Fiscal', 'RH', 'Cadastros', 'Sistema'];
const pillars = ['Multiempresa', 'Acesso', 'Performance', 'UX', 'IA'];

export default function PlanoMelhoriaModuleMatrix() {
  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl text-slate-900">Matriz de execução por módulo</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-[760px] rounded-xl border border-slate-100">
          <div className="grid grid-cols-6 bg-slate-900 text-sm font-semibold text-white">
            <div className="p-3">Módulo</div>
            {pillars.map((pillar) => <div key={pillar} className="p-3 text-center">{pillar}</div>)}
          </div>
          {modules.map((moduleName, index) => (
            <div key={moduleName} className={`grid grid-cols-6 text-sm ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
              <div className="p-3 font-medium text-slate-800">{moduleName}</div>
              {pillars.map((pillar) => (
                <div key={`${moduleName}-${pillar}`} className="flex justify-center p-3">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">Ativo</Badge>
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}