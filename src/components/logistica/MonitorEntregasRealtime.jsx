import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Truck, Activity } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * ETAPA 3: Monitor de Entregas em Tempo Real
 * WebSocket-like updates via subscriptions
 */

export default function MonitorEntregasRealtime() {
  const { filterInContext, empresaAtual } = useContextoVisual();
  const [entregas, setEntregas] = useState([]);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);

  useEffect(() => {
    if (!empresaAtual?.id) return;

    // Carregar inicial
    const carregarInicial = async () => {
      const data = await filterInContext('Entrega', {
        status: { $in: ['Saiu para Entrega', 'Em Trânsito'] }
      }, '-rastreamento_ultima_atualizacao', 50);
      setEntregas(data);
    };
    carregarInicial();

    // Subscrever a mudanças em tempo real
    const unsubscribe = base44.entities.Entrega.subscribe((event) => {
      if (event.type === 'update' && event.data?.empresa_id === empresaAtual?.id) {
        setEntregas(prev => {
          const index = prev.findIndex(e => e.id === event.id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = event.data;
            return updated;
          }
          return prev;
        });
        setUltimaAtualizacao(new Date());
      }
    });

    return unsubscribe;
  }, [empresaAtual?.id]);

  return (
    <div className="w-full h-full space-y-4 p-4 overflow-auto">
      <Card className="border-2 border-green-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600 animate-pulse" />
            Monitor em Tempo Real
          </CardTitle>
          {ultimaAtualizacao && (
            <p className="text-xs text-slate-500">
              Última atualização: {ultimaAtualizacao.toLocaleTimeString('pt-BR')}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {entregas.map(entrega => (
            <div key={entrega.id} className="flex items-center justify-between p-3 bg-slate-50 rounded border">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">{entrega.cliente_nome}</p>
                  <p className="text-xs text-slate-500">
                    {entrega.endereco_entrega_completo?.cidade}/{entrega.endereco_entrega_completo?.estado}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-blue-600 mb-1">{entrega.status}</Badge>
                {entrega.rastreamento_ultima_atualizacao && (
                  <p className="text-xs text-slate-500">
                    {new Date(entrega.rastreamento_ultima_atualizacao).toLocaleTimeString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
          ))}

          {entregas.length === 0 && (
            <p className="text-center text-slate-500 py-8">Nenhuma entrega em trânsito</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}