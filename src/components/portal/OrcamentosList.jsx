import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function OrcamentosList({ cliente }) {
  const qc = useQueryClient();
  const { data: orcamentos = [] } = useQuery({
    queryKey: ['portal-orcamentos', cliente?.id],
    enabled: !!cliente?.id,
    queryFn: async () => base44.entities.Pedido.filter({ cliente_id: cliente.id, tipo: 'Orçamento' }, '-data_pedido', 50)
  });

  const aceitar = useMutation({
    mutationFn: async (p) => base44.functions.invoke('approvals', { action: 'acceptBudget', entity_name: 'Pedido', entity_id: p.id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portal-orcamentos', cliente?.id] })
  });

  const revisar = useMutation({
    mutationFn: async (p) => base44.functions.invoke('approvals', { action: 'request', entity_name: 'Pedido', entity_id: p.id, comments: 'Cliente solicitou revisão pelo Portal' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portal-orcamentos', cliente?.id] })
  });

  return (
    <div className="space-y-3">
      {orcamentos.map((p) => (
        <Card key={p.id} className="w-full">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="font-medium">Orçamento #{p.numero_pedido || p.id}</div>
              <Badge variant="secondary">{p.status_aprovacao || 'pendente'}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">Valor: R$ {Number(p.valor_total || 0).toFixed(2)} • Validade: {p.data_validade || '—'}</div>
            <div className="flex gap-2">
              <Button onClick={() => aceitar.mutate(p)} disabled={!cliente?.pode_aprovar_orcamento_portal} className="gap-2">
                <CheckCircle2 className="w-4 h-4" /> Aceitar
              </Button>
              <Button variant="outline" onClick={() => revisar.mutate(p)} className="gap-2">
                <XCircle className="w-4 h-4" /> Solicitar Revisão
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {orcamentos.length === 0 && (
        <div className="text-sm text-muted-foreground">Nenhum orçamento pendente.</div>
      )}
    </div>
  );
}