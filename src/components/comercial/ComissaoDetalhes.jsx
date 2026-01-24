import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { DollarSign, TrendingUp } from 'lucide-react';

/**
 * COMISSÃO DETALHES - Visualização detalhada de cálculos
 * ETAPA 2: Análise granular de comissão
 */

export default function ComissaoDetalhes({ comissaoId }) {
  const [comissao, setComissao] = useState(null);
  const [pedido, setPedido] = useState(null);

  useEffect(() => {
    const carregarDados = async () => {
      const c = await base44.entities.Comissao.get(comissaoId);
      setComissao(c);

      if (c.pedido_id) {
        const p = await base44.entities.Pedido.get(c.pedido_id);
        setPedido(p);
      }
    };
    carregarDados();
  }, [comissaoId]);

  if (!comissao) return <div className="p-4">Carregando...</div>;

  const impostos = comissao.valor_comissao * 0.15; // INSS/IR simplificado
  const liquido = comissao.valor_comissao - impostos;

  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-green-50 to-slate-50 rounded-xl">
      <h2 className="text-xl font-bold text-slate-900">Detalhes da Comissão</h2>

      {/* Informações do Vendedor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Vendedor
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-600">Nome</span>
            <p className="font-semibold">{comissao.vendedor}</p>
          </div>
          <div>
            <span className="text-slate-600">Status</span>
            <Badge className={
              comissao.status === 'Paga' ? 'bg-green-600' : 'bg-yellow-600'
            }>{comissao.status}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Detalhes do Pedido */}
      {pedido && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pedido Associado</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Pedido</span>
              <p className="font-semibold">{comissao.numero_pedido}</p>
            </div>
            <div>
              <span className="text-slate-600">Data</span>
              <p>{comissao.data_venda}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cálculo Detalhado */}
      <Card className="border-2 border-green-300 bg-green-50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Cálculo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span>Valor da Venda</span>
            <span className="font-semibold">R$ {comissao.valor_venda?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span>Percentual ({comissao.percentual_comissao}%)</span>
            <span className="font-semibold">R$ {comissao.valor_comissao?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-b pb-2 text-red-600">
            <span>Impostos e Encargos (15%)</span>
            <span className="font-semibold">-R$ {impostos.toFixed(2)}</span>
          </div>
          <div className="flex justify-between bg-green-100 p-2 rounded font-bold">
            <span>Valor Líquido</span>
            <span className="text-green-700">R$ {liquido.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}