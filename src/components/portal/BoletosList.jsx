import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt, Clipboard } from 'lucide-react';

export default function BoletosList({ cliente }) {
  const qc = useQueryClient();
  const { data: boletos = [] } = useQuery({
    queryKey: ['portal-boletos', cliente?.id],
    enabled: !!cliente?.id,
    queryFn: async () => {
      return base44.entities.ContaReceber.filter({ cliente_id: cliente.id, visivel_no_portal: true }, '-data_vencimento', 100);
    }
  });

  const emitir = useMutation({
    mutationFn: async (id) => base44.functions.invoke('emitirBoleto', { conta_receber_id: id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portal-boletos', cliente?.id] })
  });

  return (
    <div className="grid md:grid-cols-2 gap-3">
      {boletos.map((b) => (
        <Card key={b.id} className="w-full">
          <CardContent className="p-4 flex items-start gap-3">
            <Receipt className="w-5 h-5 mt-0.5 text-primary" />
            <div className="min-w-0 w-full">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium truncate">{b.descricao || 'Título a receber'}</div>
                <div className="text-xs text-muted-foreground">Venc.: {b.data_vencimento || '—'}</div>
              </div>
              <div className="text-sm text-muted-foreground">Valor: R$ {Number(b.valor || 0).toFixed(2)} • Status: {b.status}</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {b.url_boleto_pdf && (
                  <a className="text-xs underline" href={b.url_boleto_pdf} target="_blank" rel="noreferrer">Baixar Boleto (PDF)</a>
                )}
                {b.pix_copia_cola && (
                  <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(b.pix_copia_cola)} className="h-8">
                    <Clipboard className="w-3.5 h-3.5" /> Copiar PIX
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => emitir.mutate(b.id)}
                  disabled={emitir.isPending}
                  className="h-8"
                >
                  {emitir.isPending ? 'Gerando 2ª via...' : (b.url_boleto_pdf ? 'Gerar 2ª via' : 'Emitir 2ª via')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {boletos.length === 0 && (
        <div className="text-sm text-muted-foreground">Sem boletos disponíveis.</div>
      )}
    </div>
  );
}