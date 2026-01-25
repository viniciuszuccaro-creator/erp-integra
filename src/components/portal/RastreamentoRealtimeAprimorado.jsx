import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Truck, CheckCircle2, Clock, Phone } from 'lucide-react';
import { useUser } from '@/components/lib/UserContext';

/**
 * ETAPA 3: Rastreamento em Tempo Real Aprimorado (Portal)
 * Timeline visual + Mapa + Status ao vivo
 */

export default function RastreamentoRealtimeAprimorado() {
  const { user } = useUser();

  const { data: cliente } = useQuery({
    queryKey: ['cliente', user?.email],
    queryFn: async () => {
      const clientes = await base44.entities.Cliente.filter({
        portal_usuario_id: user?.id
      });
      return clientes?.[0] || null;
    },
    enabled: !!user?.id
  });

  const { data: entregas = [], isLoading } = useQuery({
    queryKey: ['entregas', 'cliente', cliente?.id],
    queryFn: async () => {
      const pedidos = await base44.entities.Pedido.filter({
        cliente_id: cliente?.id
      }, '-data_pedido', 50);

      const pedidosIds = pedidos.map(p => p.id);
      
      return base44.entities.Entrega.filter({
        pedido_id: { $in: pedidosIds },
        rastreamento_habilitado: true
      }, '-data_previsao', 100);
    },
    enabled: !!cliente?.id,
    refetchInterval: 10000 // Atualiza a cada 10s
  });

  const entregasAtivas = entregas.filter(e => 
    ['Saiu para Entrega', 'Em Trânsito'].includes(e.status)
  );

  const TimelineStatus = ({ historico }) => {
    if (!historico || historico.length === 0) return null;

    return (
      <div className="space-y-2 mt-3">
        {historico.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
            <div className="flex-1">
              <p className="text-sm font-medium">{item.status}</p>
              <p className="text-xs text-slate-500">
                {new Date(item.data_hora).toLocaleString('pt-BR')}
              </p>
              {item.observacao && (
                <p className="text-xs text-slate-600 mt-1">{item.observacao}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full h-full space-y-4 p-4 overflow-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Rastreamento de Entregas</h2>
        <p className="text-slate-600">Acompanhe suas entregas em tempo real</p>
      </div>

      {/* Entregas Ativas */}
      {entregasAtivas.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-700">🚚 Em Trânsito Agora</h3>
          {entregasAtivas.map(entrega => (
            <Card key={entrega.id} className="border-2 border-blue-300 bg-blue-50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">Pedido {entrega.numero_pedido}</CardTitle>
                    <p className="text-sm text-slate-600">
                      {entrega.endereco_entrega_completo?.logradouro}, {entrega.endereco_entrega_completo?.numero}
                    </p>
                  </div>
                  <Badge className="bg-blue-600">{entrega.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Motorista */}
                {entrega.motorista && (
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span>Motorista: {entrega.motorista}</span>
                    {entrega.motorista_telefone && (
                      <a href={`tel:${entrega.motorista_telefone}`} className="ml-auto text-blue-600 underline">
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}

                {/* Previsão */}
                {entrega.data_previsao && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>Previsão: {new Date(entrega.data_previsao).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}

                {/* Última Atualização */}
                {entrega.rastreamento_ultima_atualizacao && (
                  <p className="text-xs text-slate-500">
                    Atualizado: {new Date(entrega.rastreamento_ultima_atualizacao).toLocaleString('pt-BR')}
                  </p>
                )}

                {/* Timeline */}
                <TimelineStatus historico={entrega.historico_status} />

                {/* Link Rastreamento */}
                {entrega.link_publico_rastreamento && (
                  <Button
                    onClick={() => window.open(entrega.link_publico_rastreamento, '_blank')}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Ver no Mapa
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Histórico de Entregas */}
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-700">📦 Histórico</h3>
        {entregas
          .filter(e => e.status === 'Entregue')
          .slice(0, 5)
          .map(entrega => (
            <Card key={entrega.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Pedido {entrega.numero_pedido}</p>
                    <p className="text-sm text-slate-600">
                      {entrega.data_entrega ? new Date(entrega.data_entrega).toLocaleDateString('pt-BR') : 'N/A'}
                    </p>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                {entrega.comprovante_entrega?.nome_recebedor && (
                  <p className="text-xs text-slate-500 mt-2">
                    Recebido por: {entrega.comprovante_entrega.nome_recebedor}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
      </div>

      {entregas.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            Nenhuma entrega encontrada
          </CardContent>
        </Card>
      )}
    </div>
  );
}