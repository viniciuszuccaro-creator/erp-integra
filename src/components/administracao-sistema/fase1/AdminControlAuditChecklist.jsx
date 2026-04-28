import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const checklist = [
  'Permissão RBAC por ação',
  'Escopo grupo/empresa/global',
  'Estado desabilitado quando bloqueado',
  'Auditoria na execução',
  'Feedback visual de sucesso/erro',
];

export default function AdminControlAuditChecklist() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Checklist de botões e ações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {checklist.map((item) => (
          <div key={item} className="flex items-center justify-between rounded-lg border px-3 py-2 bg-slate-50">
            <span className="text-sm text-slate-700">{item}</span>
            <Badge variant="outline">coberto</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}