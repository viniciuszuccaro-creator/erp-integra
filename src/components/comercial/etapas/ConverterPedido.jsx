import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import useContextoVisual from '@/components/lib/useContextoVisual';
import { ShoppingCart } from 'lucide-react';

/**
 * CONVERTER PEDIDO - Etapa 2 do fluxo BPMN (OrcamentoCliente → Pedido)
 * ETAPA 2: Componente modular
 */

export default function ConverterPedido({ orcamento, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { carimbarContexto } = useContextoVisual();

  const handleConverter = async () => {
    setLoading(true);
    try {
      const pedido = await base44.entities.Pedido.create(
        carimbarContexto({
          numero_pedido: `PED-${Date.now()}`,
          orcamento_id: orcamento.id,
          cliente_id: orcamento.cliente_id,
          cliente_nome: orcamento.cliente_nome,
          data_pedido: new Date().toISOString().split('T')[0],
          valor_total: orcamento.valor_total,
          status: 'Rascunho'
        })
      );

      await base44.entities.OrcamentoCliente.update(orcamento.id, {
        status: 'convertido',
        pedido_id: pedido.id
      });

      await base44.entities.AuditLog.create({
        usuario: (await base44.auth.me()).full_name,
        usuario_id: (await base44.auth.me()).id,
        empresa_id: orcamento.empresa_id,
        acao: 'Transição BPMN',
        modulo: 'Comercial',
        entidade: 'Pedido',
        registro_id: pedido.id,
        descricao: `Pedido criado de orçamento ${orcamento.id}`,
        data_hora: new Date().toISOString(),
        sucesso: true
      });

      onSuccess?.(pedido);
    } catch (err) {
      alert('Erro: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-green-300 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-green-600" />
          Converter para Pedido
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-600">Orçamento</span>
            <p className="font-semibold">{orcamento.titulo}</p>
          </div>
          <div>
            <span className="text-slate-600">Valor</span>
            <p className="font-bold">R$ {orcamento.valor_total?.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-slate-600">Cliente</span>
            <p className="font-semibold">{orcamento.cliente_nome}</p>
          </div>
          <div>
            <span className="text-slate-600">Status</span>
            <p className="font-semibold">{orcamento.status}</p>
          </div>
        </div>
        <Button
          onClick={handleConverter}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {loading ? 'Convertendo...' : '➜ Gerar Pedido'}
        </Button>
      </CardContent>
    </Card>
  );
}