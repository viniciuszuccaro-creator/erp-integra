import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Camera, FileSignature } from 'lucide-react';
import { toast } from 'sonner';

export default function ConfirmarEntregas({ romaneioId }) {
  const queryClient = useQueryClient();
  const [entregaSelecionada, setEntregaSelecionada] = useState(null);
  const [observacoes, setObservacoes] = useState('');

  const { data: romaneio, isLoading } = useQuery({
    queryKey: ['romaneio_confirmar', romaneioId],
    queryFn: async () => {
      const romaneios = await base44.entities.RomaneioEntrega.list();
      return romaneios.find(r => r.id === romaneioId);
    }
  });

  const confirmarEntregaMutation = useMutation({
    mutationFn: async ({ entregaIndex, status, observacoes }) => {
      const entregasAtualizadas = [...romaneio.entregas];
      entregasAtualizadas[entregaIndex] = {
        ...entregasAtualizadas[entregaIndex],
        status_entrega: status,
        horario_chegada: new Date().toISOString(),
        horario_saida: new Date().toISOString(),
        assinatura_digital: status === 'Entregue' ? 'ASSINADO_DIGITALMENTE' : null,
        ocorrencias: observacoes ? [{
          tipo: status === 'Recusada' ? 'Recusa' : 'Observação',
          descricao: observacoes,
          data: new Date().toISOString()
        }] : []
      };

      return await base44.entities.RomaneioEntrega.update(romaneioId, {
        entregas: entregasAtualizadas
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['romaneio_confirmar']);
      queryClient.invalidateQueries(['romaneios_entrega']);
      setEntregaSelecionada(null);
      setObservacoes('');
      toast.success('Entrega confirmada');
    }
  });

  const handleConfirmar = (status) => {
    if (!entregaSelecionada) return;

    confirmarEntregaMutation.mutate({
      entregaIndex: entregaSelecionada,
      status,
      observacoes
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-6">
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Confirmar Entregas
        </h1>
        <p className="text-sm text-slate-600">
          Romaneio: {romaneio?.numero_romaneio} • Motorista: {romaneio?.motorista_nome}
        </p>
      </div>

      <div className="flex-1 overflow-auto grid grid-cols-2 gap-6">
        {/* Lista de Entregas */}
        <div className="space-y-3">
          {romaneio?.entregas?.map((entrega, idx) => (
            <Card 
              key={idx}
              className={`cursor-pointer transition-all ${
                entregaSelecionada === idx ? 'ring-2 ring-blue-500' : ''
              } ${
                entrega.status_entrega === 'Entregue' ? 'bg-green-50 border-green-300' :
                entrega.status_entrega === 'Recusada' ? 'bg-red-50 border-red-300' :
                ''
              }`}
              onClick={() => setEntregaSelecionada(idx)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                      {entrega.ordem_sequencia || idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{entrega.cliente_nome}</p>
                      <p className="text-sm text-slate-600">{entrega.numero_pedido}</p>
                    </div>
                  </div>

                  {entrega.status_entrega === 'Entregue' && (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                  {entrega.status_entrega === 'Recusada' && (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>

                <div className="space-y-1 text-sm text-slate-600">
                  <p>{entrega.endereco?.logradouro}, {entrega.endereco?.numero}</p>
                  <p>{entrega.endereco?.cidade} - {entrega.endereco?.estado}</p>
                  <p className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{entrega.peso_kg} kg</Badge>
                    <Badge variant="outline">{entrega.volumes} volumes</Badge>
                  </p>
                </div>

                {entrega.status_entrega && (
                  <Badge 
                    variant={
                      entrega.status_entrega === 'Entregue' ? 'success' :
                      entrega.status_entrega === 'Recusada' ? 'destructive' :
                      'secondary'
                    }
                    className="mt-3"
                  >
                    {entrega.status_entrega}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Painel de Confirmação */}
        <div>
          {entregaSelecionada !== null ? (
            <Card className="sticky top-0">
              <CardHeader>
                <CardTitle>Confirmar Entrega</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-medium mb-1">
                    {romaneio.entregas[entregaSelecionada].cliente_nome}
                  </p>
                  <p className="text-sm text-slate-600">
                    {romaneio.entregas[entregaSelecionada].numero_pedido}
                  </p>
                </div>

                <div>
                  <Label>Observações da Entrega</Label>
                  <Textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Adicione observações sobre a entrega..."
                    className="h-24"
                  />
                </div>

                <div className="space-y-2">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleConfirmar('Entregue')}
                    disabled={confirmarEntregaMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar Entregue
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-red-300 text-red-700 hover:bg-red-50"
                    onClick={() => handleConfirmar('Recusada')}
                    disabled={confirmarEntregaMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Registrar Recusa
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleConfirmar('Avaria')}
                    disabled={confirmarEntregaMutation.isPending}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Registrar Avaria
                  </Button>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <p className="text-xs text-slate-600 mb-2">Recursos Adicionais:</p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Camera className="w-4 h-4 mr-2" />
                    Capturar Foto
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <FileSignature className="w-4 h-4 mr-2" />
                    Assinatura Digital
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">
                  Selecione uma entrega para confirmar
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Label({ children }) {
  return <label className="text-sm font-medium mb-1 block">{children}</label>;
}