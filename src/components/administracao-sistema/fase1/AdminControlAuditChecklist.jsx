import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ADMIN_CONTROL_ITEMS, ADMIN_CONTROL_REQUIREMENTS } from './adminControlInventory';

const checklist = ADMIN_CONTROL_REQUIREMENTS.map((rule) => ({
  ...rule,
  ok: rule.coveredBy.every((id) => ADMIN_CONTROL_ITEMS.some((item) => item.id === id)),
  cobertura: `${rule.coveredBy.filter((id) => ADMIN_CONTROL_ITEMS.some((item) => item.id === id)).length}/${rule.coveredBy.length}`
}));

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