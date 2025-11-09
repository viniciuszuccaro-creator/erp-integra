import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, DollarSign, CreditCard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * V21.1: ABA 3 - FINANCEIRO
 * Forma de pagamento, desconto, frete
 */
export default function WizardEtapa3Financeiro({ formData, onChange, onNext, onBack }) {
  const { data: formasPagamento = [] } = useQuery({
    queryKey: ['formas-pagamento'],
    queryFn: () => base44.entities.FormaPagamento.list(),
  });

  const formasAtivas = formasPagamento.filter(f => f.ativa);

  const valorProdutos = formData.valor_total || 0;
  const descontoValor = (valorProdutos * (formData.desconto_geral_pedido_percentual || 0)) / 100;
  const valorFrete = formData.valor_frete || 0;
  const valorFinal = valorProdutos - descontoValor + valorFrete;

  const handleFormaChange = (formaId) => {
    const forma = formasAtivas.find(f => f.id === formaId);
    onChange({
      ...formData,
      forma_pagamento_id: formaId,
      forma_pagamento: forma?.descricao,
      numero_parcelas: forma?.permite_parcelamento ? 1 : undefined
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Condições Comerciais
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Forma de Pagamento *</Label>
              <Select 
                value={formData.forma_pagamento_id} 
                onValueChange={handleFormaChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma" />
                </SelectTrigger>
                <SelectContent>
                  {formasAtivas.map(f => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.descricao}
                      {f.prazo_compensacao_dias > 0 && ` (${f.prazo_compensacao_dias} dias)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tipo de Frete</Label>
              <Select 
                value={formData.tipo_frete} 
                onValueChange={(v) => onChange({...formData, tipo_frete: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CIF">CIF (Pago pela empresa)</SelectItem>
                  <SelectItem value="FOB">FOB (Cliente paga)</SelectItem>
                  <SelectItem value="Retirada">Retirada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.tipo_frete === 'CIF' && (
            <div className="mt-4">
              <Label>Valor do Frete</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.valor_frete || 0}
                onChange={(e) => onChange({...formData, valor_frete: parseFloat(e.target.value) || 0})}
                placeholder="0.00"
              />
            </div>
          )}

          <div className="mt-4">
            <Label>Desconto Geral (%)</Label>
            <Input
              type="number"
              step="0.01"
              max="100"
              value={formData.desconto_geral_pedido_percentual || 0}
              onChange={(e) => onChange({...formData, desconto_geral_pedido_percentual: parseFloat(e.target.value) || 0})}
              placeholder="0.00"
            />
          </div>
        </CardContent>
      </Card>

      {/* TOTALIZADOR */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-4">
          <h3 className="font-bold text-purple-900 mb-3">💰 Resumo Financeiro</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-700">Valor dos Produtos:</span>
              <span className="font-semibold">R$ {valorProdutos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            
            {descontoValor > 0 && (
              <div className="flex justify-between text-orange-600">
                <span>Desconto ({formData.desconto_geral_pedido_percentual}%):</span>
                <span className="font-semibold">- R$ {descontoValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            {valorFrete > 0 && (
              <div className="flex justify-between text-blue-600">
                <span>Frete:</span>
                <span className="font-semibold">+ R$ {valorFrete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <div className="flex justify-between pt-2 border-t-2 border-purple-300">
              <span className="font-bold text-lg">TOTAL:</span>
              <span className="font-bold text-lg text-green-700">
                R$ {valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between text-xs text-slate-600 pt-1">
              <span>Peso Total:</span>
              <span className="font-semibold">{pesoTotal.toFixed(2)} KG</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NAVEGAÇÃO */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button
          onClick={() => {
            onChange({ ...formData, valor_total: valorFinal, peso_total_kg: pesoTotal });
            onNext();
          }}
          disabled={!formData.forma_pagamento_id}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Próximo: Revisão →
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}