import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

/**
 * Wizard Etapa 4 - Revisão Final
 * Sumário do pedido antes de criar
 */
export default function WizardEtapa4Revisao({ dadosPedido }) {
  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Revisão Final do Pedido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-slate-600">Cliente:</span>
              <p className="font-semibold text-slate-900">{dadosPedido.cliente_nome}</p>
            </div>
            <div>
              <span className="text-sm text-slate-600">Vendedor:</span>
              <p className="font-semibold text-slate-900">{dadosPedido.vendedor}</p>
            </div>
            <div>
              <span className="text-sm text-slate-600">Forma de Pagamento:</span>
              <p className="font-semibold text-slate-900">{dadosPedido.forma_pagamento}</p>
            </div>
            <div>
              <span className="text-sm text-slate-600">Tipo de Frete:</span>
              <p className="font-semibold text-slate-900">{dadosPedido.tipo_frete}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <span className="text-sm text-slate-600 mb-2 block">Itens do Pedido:</span>
            <div className="space-y-2">
              {dadosPedido.itens_revenda?.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">{item.descricao}</p>
                    <p className="text-xs text-slate-500">
                      {item.quantidade} {item.unidade} × R$ {item.preco_unitario.toFixed(2)}
                      {item.desconto_percentual > 0 && ` (-${item.desconto_percentual}%)`}
                    </p>
                  </div>
                  <span className="font-semibold">
                    R$ {item.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 flex items-center justify-between">
            <span className="text-lg font-semibold text-slate-700">Valor Total:</span>
            <span className="text-3xl font-bold text-green-600">
              R$ {(dadosPedido.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}