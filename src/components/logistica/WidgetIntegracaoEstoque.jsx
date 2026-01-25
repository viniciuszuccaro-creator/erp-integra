import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, ArrowDown, CheckCircle2, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * ETAPA 3: Widget Integração Estoque
 * Status da baixa automática
 */

export default function WidgetIntegracaoEstoque({ pedido, entrega }) {
  const { data: movimentacoes = [] } = useQuery({
    queryKey: ['movimentacoes-pedido', pedido?.id],
    queryFn: () => base44.entities.MovimentacaoEstoque.filter({
      origem_documento_id: pedido.id,
      tipo_movimento: 'saida'
    }),
    enabled: !!pedido?.id
  });

  const totalItens = pedido?.itens_revenda?.length || 0;
  const itensProcessados = movimentacoes.length;
  const percentual = totalItens > 0 ? (itensProcessados / totalItens) * 100 : 0;

  return (
    <Card className="w-full border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          Integração Estoque
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-600">Itens Processados</p>
            <p className="text-2xl font-bold text-blue-700">
              {itensProcessados}/{totalItens}
            </p>
          </div>
          <div className="text-right">
            <Badge className={percentual === 100 ? 'bg-green-600' : 'bg-orange-600'}>
              {percentual.toFixed(0)}%
            </Badge>
          </div>
        </div>

        {movimentacoes.slice(0, 3).map((m, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs p-2 bg-white rounded border">
            <ArrowDown className="w-3 h-3 text-red-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{m.produto_descricao}</p>
              <p className="text-slate-600">-{m.quantidade} {m.unidade_medida}</p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          </div>
        ))}

        <div className="pt-2 border-t">
          {entrega?.status === 'Entregue' ? (
            <Badge className="bg-green-600 w-full justify-center">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Estoque Baixado
            </Badge>
          ) : (
            <Badge variant="outline" className="w-full justify-center border-orange-300 text-orange-700">
              <Clock className="w-3 h-3 mr-1" />
              Aguardando Confirmação
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}