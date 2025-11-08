
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Percent, FileText } from 'lucide-react';

/**
 * Aba 6: Fechamento Financeiro e Fiscal
 * V11.0 - Com campo Observações da NF-e
 */
export default function FechamentoFinanceiroTab({ formData, setFormData, onNext }) {
  const valorProdutos = formData?.valor_produtos || 0;
  const descontoPercentual = formData?.desconto_geral_pedido_percentual || 0;
  const descontoValor = (valorProdutos * descontoPercentual) / 100;
  const valorFrete = formData?.valor_frete || 0;
  const valorTotal = valorProdutos - descontoValor + valorFrete;

  return (
    <div className="space-y-6">
      {/* Desconto Global */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Percent className="w-5 h-5 text-orange-600" />
            Desconto Global do Pedido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Desconto (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={descontoPercentual}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  desconto_geral_pedido_percentual: parseFloat(e.target.value) || 0,
                  desconto_geral_pedido_valor: (valorProdutos * (parseFloat(e.target.value) || 0)) / 100
                }))}
              />
            </div>
            <div>
              <Label>Desconto (R$)</Label>
              <Input
                value={`R$ ${descontoValor.toFixed(2)}`}
                disabled
                className="font-bold text-orange-600"
              />
            </div>
          </div>

          {descontoPercentual > 0 && (
            <div>
              <Label>Justificativa do Desconto</Label>
              <textarea
                value={formData?.justificativa_desconto || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  justificativa_desconto: e.target.value 
                }))}
                className="w-full p-3 border rounded-lg"
                rows="2"
                placeholder="Ex: Cliente especial, campanha promocional..."
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forma de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Forma de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Forma de Pagamento</Label>
            <select
              value={formData?.forma_pagamento || 'À Vista'}
              onChange={(e) => setFormData(prev => ({ ...prev, forma_pagamento: e.target.value }))}
              className="w-full p-2 border rounded-lg"
            >
              <option value="À Vista">À Vista</option>
              <option value="PIX">PIX</option>
              <option value="Boleto">Boleto</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Parcelado">Parcelado</option>
              <option value="Transferência">Transferência</option>
            </select>
          </div>

          {formData?.forma_pagamento === 'Parcelado' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Número de Parcelas</Label>
                <Input
                  type="number"
                  min="2"
                  max="12"
                  value={formData?.numero_parcelas || 2}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    numero_parcelas: parseInt(e.target.value) 
                  }))}
                />
              </div>
              <div>
                <Label>Intervalo (dias)</Label>
                <Input
                  type="number"
                  value={formData?.intervalo_parcelas || 30}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    intervalo_parcelas: parseInt(e.target.value) 
                  }))}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* NOVO: Informações Fiscais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Informações Fiscais (NF-e)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Observações da NF-e (Dados Adicionais)</Label>
            <p className="text-xs text-slate-500 mb-2">
              Estas informações aparecerão no campo "Informações Complementares" da NF-e
            </p>
            <textarea
              value={formData?.observacoes_nfe || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                observacoes_nfe: e.target.value 
              }))}
              className="w-full p-3 border rounded-lg"
              rows="3"
              placeholder="Ex: Mercadoria sujeita à substituição tributária, Nota Fiscal emitida nos termos da Lei..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>CFOP Padrão</Label>
              <Input
                value={formData?.cfop_pedido || '5102'}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  cfop_pedido: e.target.value 
                }))}
                placeholder="5102"
              />
              <p className="text-xs text-slate-500 mt-1">
                5102 - Venda de mercadoria (dentro do estado)
              </p>
            </div>

            <div>
              <Label>Natureza da Operação</Label>
              <Input
                value={formData?.natureza_operacao || 'Venda de mercadoria'}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  natureza_operacao: e.target.value 
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      <Card className="border-2 border-green-300 bg-green-50">
        <CardHeader className="bg-green-100 border-b">
          <CardTitle className="text-base">💰 Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2">
              <span className="text-slate-700">Valor dos Produtos</span>
              <span className="font-semibold">
                R$ {valorProdutos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {descontoValor > 0 && (
              <div className="flex justify-between items-center pb-2 text-orange-600">
                <span>Desconto ({descontoPercentual}%)</span>
                <span className="font-semibold">
                  - R$ {descontoValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {valorFrete > 0 && (
              <div className="flex justify-between items-center pb-2 text-blue-600">
                <span>Frete</span>
                <span className="font-semibold">
                  + R$ {valorFrete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t-2 border-green-600">
              <span className="text-lg font-bold text-green-900">VALOR TOTAL</span>
              <span className="text-2xl font-bold text-green-600">
                R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Observações do Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Observações Públicas (visíveis ao cliente)</Label>
            <textarea
              value={formData?.observacoes_publicas || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                observacoes_publicas: e.target.value 
              }))}
              className="w-full p-3 border rounded-lg"
              rows="3"
              placeholder="Observações que aparecerão no orçamento/pedido..."
            />
          </div>

          <div>
            <Label>Observações Internas (uso interno)</Label>
            <textarea
              value={formData?.observacoes_internas || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                observacoes_internas: e.target.value 
              }))}
              className="w-full p-3 border rounded-lg"
              rows="3"
              placeholder="Anotações internas que não aparecem para o cliente..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
