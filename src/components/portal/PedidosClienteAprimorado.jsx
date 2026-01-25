import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Eye, FileText, Truck, Search } from 'lucide-react';
import { useUser } from '@/components/lib/UserContext';

/**
 * ETAPA 3: Pedidos do Cliente Aprimorado (Portal)
 * Visualização clara + Rastreamento + NF-e + Status
 */

export default function PedidosClienteAprimorado() {
  const { user } = useUser();
  const [busca, setBusca] = useState('');
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);

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

  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ['pedidos', 'cliente', cliente?.id],
    queryFn: () => base44.entities.Pedido.filter({
      cliente_id: cliente?.id,
      pode_ver_no_portal: true
    }, '-data_pedido', 100),
    enabled: !!cliente?.id
  });

  const pedidosFiltrados = pedidos.filter(p =>
    !busca || 
    p.numero_pedido?.toLowerCase().includes(busca.toLowerCase()) ||
    p.cliente_nome?.toLowerCase().includes(busca.toLowerCase())
  );

  const statusCores = {
    'Rascunho': 'bg-slate-500',
    'Aguardando Aprovação': 'bg-yellow-600',
    'Aprovado': 'bg-blue-600',
    'Em Produção': 'bg-purple-600',
    'Pronto para Faturar': 'bg-indigo-600',
    'Faturado': 'bg-green-600',
    'Em Expedição': 'bg-teal-600',
    'Em Trânsito': 'bg-cyan-600',
    'Entregue': 'bg-emerald-600',
    'Cancelado': 'bg-red-600'
  };

  return (
    <div className="w-full h-full space-y-4 p-4 overflow-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Meus Pedidos</h2>
        <p className="text-slate-600">Acompanhe o status em tempo real</p>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Buscar por número ou descrição..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de Pedidos */}
      <div className="space-y-3">
        {isLoading && <p className="text-center text-slate-500">Carregando...</p>}

        {pedidosFiltrados.map(pedido => (
          <Card key={pedido.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{pedido.numero_pedido}</CardTitle>
                  <p className="text-sm text-slate-600">
                    {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <Badge className={statusCores[pedido.status] || 'bg-slate-600'}>
                  {pedido.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Valor */}
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Valor Total:</span>
                <span className="text-xl font-bold text-green-700">
                  R$ {pedido.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Itens */}
              <div className="text-sm">
                <span className="text-slate-600">Itens:</span>
                <p className="font-medium">
                  {(pedido.itens_revenda?.length || 0) + 
                   (pedido.itens_armado_padrao?.length || 0) + 
                   (pedido.itens_corte_dobra?.length || 0)} itens
                </p>
              </div>

              {/* Entrega */}
              {pedido.data_prevista_entrega && (
                <div className="flex items-center gap-2 text-sm bg-blue-50 p-2 rounded">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Entrega prevista: {new Date(pedido.data_prevista_entrega).toLocaleDateString('pt-BR')}</span>
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setPedidoSelecionado(pedido)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Detalhes
                </Button>
                {pedido.status === 'Faturado' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    NF-e
                  </Button>
                )}
                {['Em Expedição', 'Em Trânsito', 'Entregue'].includes(pedido.status) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Truck className="w-4 h-4 mr-1" />
                    Rastrear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}