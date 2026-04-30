import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ADMIN_CONTROL_REQUIREMENTS } from './adminControlInventory';
import { getChecklistStatus } from './adminControlRuntime';

const checklist = ADMIN_CONTROL_REQUIREMENTS.map((rule) => {
  const status = getChecklistStatus(rule.coveredBy);
  return {
    ...rule,
    ok: status.ok,
    cobertura: status.coverage,
  };
});

export default function AdminControlAuditChecklist() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Checklist de botões e ações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {checklist.map((item) => (
          <div key={item.id} className="rounded-lg border px-3 py-2 bg-slate-50">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-700 font-medium">{item.label}</span>
              <Badge variant="outline">{item.ok ? 'coberto' : 'pendente'} • {item.cobertura}</Badge>
            </div>
            <div className="mt-1 text-xs text-slate-500">{item.description}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}