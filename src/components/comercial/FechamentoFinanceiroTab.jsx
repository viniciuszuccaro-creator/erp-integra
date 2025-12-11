import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, Percent, FileText, Receipt, CheckCircle, AlertTriangle } from 'lucide-react';
import GerarNFeModal from './GerarNFeModal';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * V21.1 - Aba 7: Fechamento Financeiro
 * AGORA COM: Emissão de NF-e por Etapa + Barra de Progresso
 */
export default function FechamentoFinanceiroTab({ formData, setFormData, onNext }) {
  const [modalNFeOpen, setModalNFeOpen] = useState(false);
  const [gerandoFinanceiro, setGerandoFinanceiro] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const gerarTitulosFinanceiros = async () => {
    if (!formData?.id) {
      toast.error('❌ Salve o pedido antes de gerar títulos');
      return;
    }

    setGerandoFinanceiro(true);
    try {
      const numParcelas = formData.numero_parcelas || 1;
      const valorParcela = valorTotal / numParcelas;
      const intervalo = formData.intervalo_parcelas || 30;

      for (let i = 0; i < numParcelas; i++) {
        const dataVencimento = new Date(formData.data_pedido);
        dataVencimento.setDate(dataVencimento.getDate() + (intervalo * i));

        await base44.entities.ContaReceber.create({
          empresa_id: formData.empresa_id,
          origem_tipo: 'pedido',
          pedido_id: formData.id,
          descricao: `Pedido ${formData.numero_pedido} - Parcela ${i + 1}/${numParcelas}`,
          cliente: formData.cliente_nome,
          cliente_id: formData.cliente_id,
          numero_parcela: `${i + 1}/${numParcelas}`,
          valor: valorParcela,
          data_emissao: formData.data_pedido,
          data_vencimento: dataVencimento.toISOString().split('T')[0],
          status: 'Pendente',
          forma_cobranca: formData.forma_pagamento === 'Boleto' ? 'Boleto' : 'Não Definida',
          numero_documento: `${formData.numero_pedido}-${i + 1}`,
          visivel_no_portal: true
        });
      }

      toast.success(`✅ ${numParcelas} título(s) gerado(s) com sucesso!`);
    } catch (error) {
      toast.error('❌ Erro ao gerar títulos financeiros');
    } finally {
      setGerandoFinanceiro(false);
    }
  };

  const valorProdutos = formData?.valor_produtos || 0;
  const descontoPercentual = formData?.desconto_geral_pedido_percentual || 0;
  const descontoValor = (valorProdutos * descontoPercentual) / 100;
  const valorFrete = formData?.valor_frete || 0;
  const valorTotal = valorProdutos - descontoValor + valorFrete;

  // V21.1: Calcular Progresso de Faturamento
  const etapas = formData?.etapas_entrega || [];
  const valorFaturado = etapas
    .filter(e => e.faturada)
    .reduce((sum, e) => sum + (e.valor_total_etapa || 0), 0);
  const percentualFaturado = valorTotal > 0 ? (valorFaturado / valorTotal) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* V21.1: Barra de Progresso do Faturamento */}
      {etapas.length > 0 && (
        <Card className="border-2 border-purple-300 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="w-5 h-5 text-purple-600" />
              Progresso de Faturamento por Etapas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-700">Valor Faturado</span>
              <span className="font-bold text-purple-900">
                R$ {valorFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <Progress value={percentualFaturado} className="h-3" />
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">
                {etapas.filter(e => e.faturada).length} de {etapas.length} etapa(s) faturada(s)
              </span>
              <span className="font-bold text-purple-600">
                {percentualFaturado.toFixed(1)}%
              </span>
            </div>

            {percentualFaturado === 100 && (
              <Alert className="border-green-300 bg-green-50 p-3">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-sm text-green-700 ml-6">
                  ✅ Pedido 100% faturado
                </AlertDescription>
              </Alert>
            )}

            {/* V21.1: Botão Emitir NF-e com Escopo */}
            <Button
              onClick={() => setModalNFeOpen(true)}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              <Receipt className="w-5 h-5 mr-2" />
              Emitir NF-e (Pedido Completo ou por Etapa)
            </Button>
          </CardContent>
        </Card>
      )}

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

      {/* Informações Fiscais */}
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

      {/* Geração de Títulos Financeiros */}
      {formData?.id && (
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Geração de Títulos Financeiros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert className="bg-blue-100 border-blue-300">
              <AlertDescription className="text-sm text-blue-900">
                <p className="font-semibold mb-2">💡 Quando usar:</p>
                <ul className="list-disc ml-4 space-y-1 text-xs">
                  <li>Status <strong>"Faturado"</strong>: Gera automaticamente os títulos a receber</li>
                  <li>Parcelamento: Divide o valor conforme número de parcelas e intervalo</li>
                  <li>Títulos ficam visíveis no Portal do Cliente</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Button
              onClick={gerarTitulosFinanceiros}
              disabled={gerandoFinanceiro || !formData?.forma_pagamento}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              size="lg"
            >
              <DollarSign className="w-5 h-5 mr-2" />
              {gerandoFinanceiro ? 'Gerando...' : '💰 Gerar Títulos a Receber'}
            </Button>

            {formData?.forma_pagamento === 'Parcelado' && (
              <p className="text-xs text-center text-slate-600">
                Será gerado {formData.numero_parcelas || 2}x de R$ {(valorTotal / (formData.numero_parcelas || 2)).toFixed(2)}
              </p>
            )}
          </CardContent>
        </Card>
      )}

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

      {/* V21.1: Modal de Emissão de NF-e */}
      <GerarNFeModal
        open={modalNFeOpen}
        onClose={() => setModalNFeOpen(false)}
        pedidoData={formData}
        onEmitir={(dadosNFe) => {
          console.log('Emitir NF-e:', dadosNFe);
          setModalNFeOpen(false);
        }}
      />
    </div>
  );
}