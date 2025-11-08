import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Wizard Etapa 3 - Financeiro e Entrega
 * Conexão Hub V16.1: Lê FormaPagamento.json e Endereços do Cliente
 */
export default function WizardEtapa3Financeiro({ dadosPedido, onChange }) {
  const { data: formasPagamento = [] } = useQuery({
    queryKey: ['formas-pagamento'],
    queryFn: () => base44.entities.FormaPagamento.list(),
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list(),
  });

  const clienteSelecionado = clientes.find(c => c.id === dadosPedido.cliente_id);
  const enderecosEntrega = clienteSelecionado?.locais_entrega || [];

  return (
    <div className="space-y-6">
      <div>
        <Label>Forma de Pagamento *</Label>
        <Select 
          value={dadosPedido.forma_pagamento} 
          onValueChange={(val) => onChange({...dadosPedido, forma_pagamento: val})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a forma de pagamento" />
          </SelectTrigger>
          <SelectContent>
            {formasPagamento.map(forma => (
              <SelectItem key={forma.id} value={forma.descricao}>
                {forma.descricao}
                {forma.percentual_desconto_padrao > 0 && (
                  <span className="text-green-600 ml-2">
                    ({forma.percentual_desconto_padrao}% desc)
                  </span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Tipo de Frete</Label>
        <Select 
          value={dadosPedido.tipo_frete} 
          onValueChange={(val) => onChange({...dadosPedido, tipo_frete: val})}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CIF">CIF (Por conta do vendedor)</SelectItem>
            <SelectItem value="FOB">FOB (Por conta do comprador)</SelectItem>
            <SelectItem value="Retirada">Retirada no local</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {enderecosEntrega.length > 0 && (
        <div>
          <Label>Endereço de Entrega</Label>
          <Select 
            value={dadosPedido.endereco_entrega_id} 
            onValueChange={(val) => onChange({...dadosPedido, endereco_entrega_id: val})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o endereço" />
            </SelectTrigger>
            <SelectContent>
              {enderecosEntrega.map((end, idx) => (
                <SelectItem key={idx} value={idx.toString()}>
                  {end.apelido || `Endereço ${idx + 1}`} - {end.cidade}/{end.estado}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label>Valor do Frete</Label>
        <Input
          type="number"
          value={dadosPedido.valor_frete || 0}
          onChange={(e) => {
            const frete = parseFloat(e.target.value) || 0;
            onChange({
              ...dadosPedido, 
              valor_frete: frete,
              valor_total: (dadosPedido.valor_produtos || 0) + frete
            });
          }}
          min="0"
          step="0.01"
        />
      </div>

      <Card className="bg-slate-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Valor Total do Pedido:</span>
            <span className="text-2xl font-bold text-blue-600">
              R$ {(dadosPedido.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}