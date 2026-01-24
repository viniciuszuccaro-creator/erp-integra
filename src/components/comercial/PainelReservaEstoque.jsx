import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

/**
 * PAINEL RESERVA ESTOQUE - Visualização de reservas ativas
 * ETAPA 2: Monitoramento de estoque reservado
 */

export default function PainelReservaEstoque({ pedidoId }) {
  const [reservas, setReservas] = useState([]);

  useEffect(() => {
    const carregarReservas = async () => {
      // Buscar MovimentacaoEstoque com tipo 'reserva' do pedido
      const dados = await window.base44?.entities?.MovimentacaoEstoque?.filter?.({
        origem_documento_id: pedidoId,
        tipo_movimento: 'reserva'
      }, '-data_movimentacao', 50) || [];
      
      setReservas(dados);
    };
    carregarReservas();
  }, [pedidoId]);

  const totalReservado = reservas.reduce((sum, r) => sum + (r.quantidade || 0), 0);

  return (
    <div className="space-y-4 p-4 bg-gradient-to-br from-yellow-50 to-slate-50 rounded-lg">
      <h3 className="font-bold text-slate-900 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-yellow-600" />
        Estoque Reservado ({totalReservado} itens)
      </h3>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {reservas.map((r, idx) => (
          <Card key={idx} className="border-l-4 border-l-yellow-600">
            <CardContent className="pt-3 grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-600">Produto</span>
                <p className="font-semibold">{r.produto_descricao}</p>
              </div>
              <div>
                <span className="text-slate-600">Quantidade</span>
                <p className="font-bold">{r.quantidade}</p>
              </div>
              <div>
                <span className="text-slate-600">Data</span>
                <p>{new Date(r.data_movimentacao).toLocaleDateString('pt-BR')}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reservas.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-4">Nenhuma reserva ativa</p>
      )}
    </div>
  );
}