
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'; // Added Button import
import { DollarSign, Percent, FileText } from 'lucide-react';

import GerarPDFOrcamento from "./GerarPDFOrcamento";
import GerarNFeModal from "./GerarNFeModal"; // Added GerarNFeModal import

/**
 * V21.1 - Aba 6: Financeiro
 * COM: Barra de Progresso + Geração de PDF V22.0
 */
export default function FechamentoFinanceiroTab({ formData, setFormData, onNext }) {
  const [showGerarNFe, setShowGerarNFe] = useState(false);

  const valorProdutos = formData?.valor_produtos || 0;
  const descontoPercentual = formData?.desconto_geral_pedido_percentual || 0;
  const descontoValor = (valorProdutos * descontoPercentual) / 100;
  const valorFrete = formData?.valor_frete || 0;
  // Recalculate valorTotal based on current state for local display consistency if formData.valor_total isn't already updated by parent
  const valorTotalCalculated = valorProdutos - descontoValor + valorFrete;

  // Ensure formData.valor_total is updated if discount changes in this tab
  // This useEffect could be used if there are multiple sources updating values
  // For now, it's integrated directly into the onChange handler for discount percent
  // If valor_produtos or valor_frete could be changed here, similar logic would be needed.

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
                onChange={(e) => {
                  const newDescontoPercentual = parseFloat(e.target.value) || 0;
                  const currentValorProdutos = formData?.valor_produtos || 0;
                  const currentValorFrete = formData?.valor_frete || 0;
                  const newDescontoValorCalculated = (currentValorProdutos * newDescontoPercentual) / 100;
                  const newValorTotalCalculated = currentValorProdutos - newDescontoValorCalculated + currentValorFrete;

                  setFormData(prev => ({
                    ...prev,
                    desconto_geral_pedido_percentual: newDescontoPercentual,
                    desconto_geral_pedido_valor: newDescontoValorCalculated,
                    valor_total: newValorTotalCalculated, // Ensure valor_total is updated in formData
                  }));
                }}
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

      {/* NOVO Resumo Financeiro */}
      <Card className="border-2 border-green-300">
        <CardHeader className="bg-green-50">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Resumo Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-700">Valor dos Produtos:</span>
              <span className="font-bold text-lg">
                R$ {(formData.valor_produtos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-700">Frete:</span>
              <span className="font-semibold">
                R$ {(formData.valor_frete || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {(formData.desconto_geral_pedido_valor || 0) > 0 && (
              <div className="flex justify-between text-orange-600">
                <span>Desconto:</span>
                <span className="font-semibold">
                  - R$ {(formData.desconto_geral_pedido_valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            <div className="flex justify-between pt-3 border-t-2 border-green-600">
              <span className="text-lg font-bold text-green-900">VALOR TOTAL:</span>
              <span className="text-2xl font-bold text-green-600">
                {/* Use formData.valor_total which should be kept updated by setFormData calls */}
                R$ {(formData.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Ações */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t">
            {/* V22.0: NOVO - Botão Gerar PDF */}
            <GerarPDFOrcamento pedido={formData} cliente={{ nome: formData.cliente_nome }} />

            <Button
              onClick={() => setShowGerarNFe(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              Emitir NF-e
            </Button>
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

      {showGerarNFe && (
        <GerarNFeModal
          isOpen={showGerarNFe}
          onClose={() => setShowGerarNFe(false)}
          pedido={formData}
        />
      )}
    </div>
  );
}
