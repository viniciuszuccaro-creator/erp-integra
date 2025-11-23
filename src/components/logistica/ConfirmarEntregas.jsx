import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Camera, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function ConfirmarEntregas({ romaneioId }) {
  const queryClient = useQueryClient();
  const [entregaSelecionada, setEntregaSelecionada] = useState(null);

  const { data: romaneio, isLoading } = useQuery({
    queryKey: ['romaneio', romaneioId],
    queryFn: async () => {
      const lista = await base44.entities.RomaneioEntrega.list();
      return lista.find(r => r.id === romaneioId);
    }
  });

  const confirmarEntregaMutation = useMutation({
    mutationFn: async ({ entregaIndex, dados }) => {
      const entregasAtualizadas = [...romaneio.entregas];
      entregasAtualizadas[entregaIndex] = {
        ...entregasAtualizadas[entregaIndex],
        ...dados,
        status_entrega: dados.recusada ? 'Recusada' : 'Entregue'
      };

      // Se foi recusada, criar logística reversa
      if (dados.recusada) {
        const entrega = entregasAtualizadas[entregaIndex];
        
        // Bloquear conta a receber
        const contasReceber = await base44.entities.ContaReceber.list();
        const contaVinculada = contasReceber.find(c => c.pedido_id === entrega.pedido_id);
        
        if (contaVinculada) {
          await base44.entities.ContaReceber.update(contaVinculada.id, {
            status: 'Bloqueado - Recusa de Entrega'
          });
        }

        // Atualizar romaneio com logística reversa
        return await base44.entities.RomaneioEntrega.update(romaneioId, {
          entregas: entregasAtualizadas,
          logistica_reversa: {
            ativa: true,
            motivo: dados.recusa_motivo,
            entrega_id_origem: entrega.entrega_id,
            conta_receber_bloqueada_id: contaVinculada?.id,
            status_resolucao: 'Pendente'
          }
        });
      }

      return await base44.entities.RomaneioEntrega.update(romaneioId, {
        entregas: entregasAtualizadas
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['romaneio']);
      toast.success('Entrega confirmada');
      setEntregaSelecionada(null);
    }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  const entregas = romaneio?.entregas || [];

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Confirmar Entregas</h2>
        <p className="text-sm text-slate-600">
          Romaneio {romaneio?.numero_romaneio} • ETAPA 6 - Prova de Entrega Digital
        </p>
      </div>

      <div className="space-y-4">
        {entregas.map((entrega, index) => (
          <Card key={index} className={
            entrega.status_entrega === 'Entregue' ? 'border-green-200 bg-green-50/30' :
            entrega.status_entrega === 'Recusada' ? 'border-red-200 bg-red-50/30' :
            ''
          }>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">{entrega.cliente_nome}</CardTitle>
                  <p className="text-xs text-slate-600">Pedido: {entrega.numero_pedido}</p>
                </div>

                <Badge variant={
                  entrega.status_entrega === 'Entregue' ? 'success' :
                  entrega.status_entrega === 'Recusada' ? 'destructive' :
                  'secondary'
                }>
                  {entrega.status_entrega}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="text-slate-600">Endereço:</p>
                <p className="font-medium">
                  {entrega.endereco?.logradouro}, {entrega.endereco?.numero} - {entrega.endereco?.cidade}
                </p>
              </div>

              {entrega.status_entrega === 'Pendente' && (
                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    onClick={() => setEntregaSelecionada(index)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar Entrega
                  </Button>

                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      const motivo = prompt('Motivo da recusa:');
                      if (motivo) {
                        confirmarEntregaMutation.mutate({
                          entregaIndex: index,
                          dados: {
                            recusada: true,
                            recusa_motivo: motivo,
                            horario_chegada: new Date().toISOString(),
                            horario_saida: new Date().toISOString()
                          }
                        });
                      }
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Registrar Recusa
                  </Button>
                </div>
              )}

              {entrega.status_entrega === 'Entregue' && (
                <div className="p-3 bg-green-50 rounded text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-900">Entrega Confirmada</span>
                  </div>
                  <p className="text-xs text-green-700">
                    Chegada: {entrega.horario_chegada} • Saída: {entrega.horario_saida}
                  </p>
                  {entrega.tempo_descarga_minutos && (
                    <p className="text-xs text-green-700">
                      Tempo de descarga: {entrega.tempo_descarga_minutos} minutos
                    </p>
                  )}
                </div>
              )}

              {entrega.status_entrega === 'Recusada' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-red-900">Entrega Recusada</span>
                  </div>
                  <p className="text-xs text-red-700">Motivo: {entrega.recusa_motivo}</p>
                  <Badge variant="destructive" className="mt-2 text-xs">
                    Logística Reversa Ativada
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Confirmação (simplificado) */}
      {entregaSelecionada !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEntregaSelecionada(null)}>
          <Card className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="text-sm">Confirmar Entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => {
                  confirmarEntregaMutation.mutate({
                    entregaIndex: entregaSelecionada,
                    dados: {
                      horario_chegada: new Date().toISOString(),
                      horario_saida: new Date().toISOString(),
                      tempo_descarga_minutos: 15,
                      assinatura_digital: 'assinado',
                      recusada: false
                    }
                  });
                }}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar Entrega Realizada
              </Button>

              <Button
                variant="outline"
                onClick={() => setEntregaSelecionada(null)}
                className="w-full"
              >
                Cancelar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}