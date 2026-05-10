import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

const modules = ['Dashboard', 'CRM', 'Comercial', 'Estoque', 'Compras', 'Financeiro', 'Expedição', 'Produção', 'Fiscal', 'RH', 'Cadastros', 'Sistema'];
const checks = ['Multiempresa', 'Acesso', 'Responsivo', 'Auditoria', 'IA/Automação'];

export default function PlanoMelhoriaModuleChecklist() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl text-slate-900">Checklist obrigatório por módulo</CardTitle>
        <p className="text-sm text-slate-500">Cada módulo deve evoluir mantendo contexto, segurança, responsividade e rastreabilidade.</p>
      </CardHeader>
      <CardContent className="grid w-full gap-3 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <div key={module} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-semibold text-slate-900">{module}</p>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Em ciclo</Badge>
            </div>
            <div className="grid gap-2">
              {checks.map((check) => (
                <div key={check} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>{check}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}