import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, User, Calendar, Percent } from "lucide-react";

/**
 * V21.1.2: Detalhes Comissão - Window Mode
 */
export default function DetalhesComissao({ comissao, windowMode = false }) {
  const statusColors = {
    'Pendente': 'bg-yellow-100 text-yellow-700',
    'Aprovada': 'bg-green-100 text-green-700',
    'Paga': 'bg-blue-100 text-blue-700',
    'Cancelada': 'bg-red-100 text-red-700'
  };

  const content = (
    <div className={`space-y-6 ${windowMode ? 'p-6 h-full overflow-auto' : ''}`}>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500">Vendedor</p>
              <p className="font-semibold flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                {comissao.vendedor}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Status</p>
              <Badge className={statusColors[comissao.status]}>
                {comissao.status}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500">Data da Venda</p>
              <p className="font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-600" />
                {new Date(comissao.data_venda).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Pedido/Período</p>
              <p className="font-semibold">{comissao.numero_pedido}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500">Valor da Venda</p>
              <p className="font-semibold text-blue-600 text-lg">
                R$ {comissao.valor_venda?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Percentual</p>
              <p className="font-semibold flex items-center gap-2">
                <Percent className="w-4 h-4 text-slate-600" />
                {comissao.percentual_comissao}%
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-slate-600 mb-1 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                Valor da Comissão
              </p>
              <p className="text-3xl font-bold text-green-600">
                R$ {comissao.valor_comissao?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {comissao.aprovador && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Aprovado por</p>
                  <p className="font-semibold">{comissao.aprovador}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Data Aprovação</p>
                  <p className="font-semibold">
                    {new Date(comissao.data_aprovacao).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {comissao.data_pagamento && (
            <div className="border-t pt-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-slate-600">Pago em</p>
                <p className="font-semibold text-blue-700">
                  {new Date(comissao.data_pagamento).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          )}

          {comissao.observacoes && (
            <div className="border-t pt-4">
              <p className="text-sm text-slate-500 mb-2">Observações</p>
              <p className="text-sm bg-slate-50 p-3 rounded">{comissao.observacoes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  if (windowMode) {
    return <div className="w-full h-full bg-white">{content}</div>;
  }

  return content;
}