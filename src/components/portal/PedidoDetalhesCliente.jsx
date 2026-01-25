import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Package, DollarSign } from 'lucide-react';
import BadgeOrigemPedido from '@/components/comercial/BadgeOrigemPedido';

/**
 * ETAPA 3: Detalhes do Pedido - Portal Cliente
 * Visão completa e clean para o cliente
 */

export default function PedidoDetalhesCliente({ pedido }) {
  const statusCores = {
    'Rascunho': 'bg-slate-500',
    'Aguardando Aprovação': 'bg-yellow-600',
    'Aprovado': 'bg-green-600',
    'Em Produção': 'bg-blue-600',
    'Pronto para Faturar': 'bg-purple-600',
    'Faturado': 'bg-indigo-600',
    'Em Expedição': 'bg-orange-600',
    'Entregue': 'bg-green-700',
    'Cancelado': 'bg-red-600'
  };

  const totalItens = [
    ...(pedido.itens_revenda || []),
    ...(pedido.itens_armado_padrao || []),
    ...(pedido.itens_corte_dobra || [])
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">Pedido {pedido.numero_pedido}</CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="space-y-2 text-right">
            <Badge className={statusCores[pedido.status] || 'bg-slate-600'}>
              {pedido.status}
            </Badge>
            <BadgeOrigemPedido origem={pedido.origem_pedido} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Valores */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
          <div>
            <p className="text-xs text-slate-600">Valor Produtos</p>
            <p className="text-lg font-bold text-green-700">
              R$ {pedido.valor_produtos?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-600">Valor Total</p>
            <p className="text-lg font-bold text-blue-700">
              R$ {pedido.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Itens */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-slate-600" />
            <p className="font-semibold text-sm">Itens ({totalItens.length})</p>
          </div>
          <div className="space-y-2 max-h-60 overflow-auto">
            {totalItens.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded text-sm">
                <div className="flex-1">
                  <p className="font-medium">{item.produto_descricao || item.descricao}</p>
                  <p className="text-xs text-slate-600">
                    {item.quantidade} {item.unidade} × R$ {item.valor_unitario?.toFixed(2)}
                  </p>
                </div>
                <p className="font-bold text-green-700">
                  R$ {item.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pagamento */}
        {pedido.forma_pagamento && (
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Pagamento</span>
            </div>
            <Badge className="bg-blue-600">
              {pedido.forma_pagamento}
              {pedido.numero_parcelas && ` (${pedido.numero_parcelas}x)`}
            </Badge>
          </div>
        )}

        {/* Observações */}
        {pedido.observacoes_publicas && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs text-yellow-800">{pedido.observacoes_publicas}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}