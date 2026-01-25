import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/components/lib/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, TrendingUp } from 'lucide-react';

/**
 * ETAPA 3: Histórico de Compras do Cliente
 * Para portal - mostra evolução
 */

export default function HistoricoComprasCliente() {
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

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos', 'historico', cliente?.id],
    queryFn: () => base44.entities.Pedido.filter({
      cliente_id: cliente?.id,
      status: { $nin: ['Rascunho', 'Cancelado'] }
    }, '-data_pedido', 50),
    enabled: !!cliente?.id
  });

  const valorTotal = pedidos.reduce((sum, p) => sum + (p.valor_total || 0), 0);
  const ticketMedio = pedidos.length > 0 ? valorTotal / pedidos.length : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShoppingBag className="w-5 h-5 text-blue-600" />
          Meu Histórico
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Métricas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-blue-50 rounded text-center">
            <p className="text-2xl font-bold text-blue-700">{pedidos.length}</p>
            <p className="text-xs text-blue-600">Pedidos</p>
          </div>
          <div className="p-3 bg-green-50 rounded text-center">
            <p className="text-lg font-bold text-green-700">
              R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-green-600">Ticket Médio</p>
          </div>
        </div>

        {/* Lista Últimos */}
        <div>
          <p className="text-sm font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-600" />
            Últimos Pedidos
          </p>
          <div className="space-y-2 max-h-60 overflow-auto">
            {pedidos.slice(0, 10).map(pedido => (
              <div key={pedido.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <div>
                  <p className="font-medium text-sm">{pedido.numero_pedido}</p>
                  <p className="text-xs text-slate-600">
                    {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-green-700">
                    R$ {pedido.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <Badge className="text-xs mt-1 bg-blue-600">
                    {pedido.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {pedidos.length === 0 && (
          <p className="text-center text-sm text-slate-500 py-4">
            Nenhum pedido encontrado
          </p>
        )}
      </CardContent>
    </Card>
  );
}