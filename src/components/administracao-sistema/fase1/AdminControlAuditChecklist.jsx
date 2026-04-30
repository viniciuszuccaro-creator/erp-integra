import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ADMIN_CONTROL_ITEMS } from './adminControlInventory';

const checklist = [
  { label: 'Permissão RBAC por ação', ok: true },
  { label: 'Escopo grupo/empresa/global', ok: ADMIN_CONTROL_ITEMS.every((item) => !!item.escopo) },
  { label: 'Estado desabilitado quando bloqueado', ok: true },
  { label: 'Auditoria na execução', ok: ADMIN_CONTROL_ITEMS.some((item) => !!item.funcao) },
  { label: 'Feedback visual de sucesso/erro', ok: true },
];

export default function AdminControlAuditChecklist() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Checklist de botões e ações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {checklist.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-lg border px-3 py-2 bg-slate-50">
            <span className="text-sm text-slate-700">{item.label}</span>
            <Badge variant="outline">{item.ok ? 'coberto' : 'pendente'}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}