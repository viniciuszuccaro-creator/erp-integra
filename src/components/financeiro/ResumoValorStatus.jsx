import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ResumoValorStatus({ valor = 0, badgeText = '', tone = 'default', variant = 'receber' }) {
  const gradient = variant === 'pagar'
    ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
    : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200';

  const badgeClass = (() => {
    const t = String(tone || '').toLowerCase();
    if (t.includes('pago') || t.includes('recebido') || t.includes('aprovado')) return 'bg-green-600';
    if (t.includes('atrasado') || t.includes('cancel')) return 'bg-red-600';
    if (t.includes('aguard') || t.includes('pendente')) return 'bg-yellow-600';
    if (t.includes('aprov')) return 'bg-blue-600';
    return 'bg-slate-600';
  })();

  return (
    <Card className={`${gradient} border`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-700">Valor Total</p>
            <p className="text-3xl font-bold text-slate-900">
              R$ {(Number(valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right">
            <Badge className={badgeClass}>{badgeText || '-'}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}