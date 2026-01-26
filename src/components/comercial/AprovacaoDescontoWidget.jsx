import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';

export default function AprovacaoDescontoWidget({ pedido }) {
  if (!pedido) return null;

  const solicitar = async () => {
    await base44.functions.invoke('solicitacoesAprovacao', {
      action: 'create',
      tipo: 'desconto_pedido',
      target_entity: 'Pedido',
      target_id: pedido.id,
      dados: { desconto_solicitado_percentual: pedido.desconto_solicitado_percentual || 0 }
    });
  };

  const aprovar = async () => {
    await base44.functions.invoke('solicitacoesAprovacao', {
      action: 'approve',
      target_entity: 'Pedido',
      target_id: pedido.id
    });
  };

  const rejeitar = async () => {
    await base44.functions.invoke('solicitacoesAprovacao', {
      action: 'reject',
      target_entity: 'Pedido',
      target_id: pedido.id
    });
  };

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Aprovação de Desconto</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-2 flex-wrap">
        <Button variant="outline" onClick={solicitar}>Solicitar Aprovação</Button>
        <Button onClick={aprovar}>Aprovar</Button>
        <Button variant="destructive" onClick={rejeitar}>Rejeitar</Button>
      </CardContent>
    </Card>
  );
}