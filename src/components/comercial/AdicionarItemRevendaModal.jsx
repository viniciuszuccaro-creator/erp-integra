import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Calculator, AlertTriangle, Zap } from "lucide-react";
import { 
  converterParaKG, 
  PreviewConversao, 
  gerarOpcoesUnidades,
  validarConversao
} from "@/components/lib/CalculadoraUnidades";

/**
 * V22.0 - Modal para Adicionar Item de Revenda
 * COM REGRA MESTRA DE CONVERSÃO DE UNIDADES
 */
export default function AdicionarItemRevendaModal({ 
  isOpen, 
  onClose, 
  onAdicionarItem, 
  itemEditando,
  empresaId 
}) {
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [unidadeVenda, setUnidadeVenda] = useState('UN');
  const [valorUnitario, setValorUnitario] = useState(0);
  const [percentualDesconto, setPercentualDesconto] = useState(0);

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos', empresaId],
    queryFn: () => base44.entities.Produto.filter({ 
      empresa_id: empresaId,
      status: 'Ativo'
    }),
    enabled: !!empresaId
  });

  // Carregar dados do item em edição
  useEffect(() => {
    if (itemEditando) {
      const prod = produtos.find(p => p.id === itemEditando.produto_id);
      setProdutoSelecionado(prod);
      setQuantidade(itemEditando.quantidade || 1);
      setUnidadeVenda(itemEditando.unidade || 'UN');
      setValorUnitario(itemEditando.valor_unitario || 0);
      setPercentualDesconto(itemEditando.percentual_desconto || 0);
    }
  }, [itemEditando, produtos]);

  // Quando seleciona produto, preenche preço padrão
  const handleSelecionarProduto = (produtoId) => {
    const produto = produtos.find(p => p.id === produtoId);
    if (!produto) return;

    setProdutoSelecionado(produto);
    setValorUnitario(produto.preco_venda || 0);
    
    // V22.0: Definir unidade padrão
    setUnidadeVenda(produto.unidade_principal || produto.unidade_medida || 'UN');
  };

  // V22.0: Opções de unidades baseadas no produto
  const opcoesUnidades = produtoSelecionado 
    ? gerarOpcoesUnidades(produtoSelecionado)
    : [{ value: 'UN', label: 'UN - Unidade' }];

  // Validar conversão
  const validacao = produtoSelecionado 
    ? validarConversao(produtoSelecionado, unidadeVenda)
    : { valido: true };

  // Calcular totais
  const valorBruto = quantidade * valorUnitario;
  const valorDesconto = valorBruto * (percentualDesconto / 100);
  const valorFinal = valorBruto - valorDesconto;

  // V22.0: Peso em KG (base do estoque)
  const pesoKG = produtoSelecionado 
    ? converterParaKG(quantidade, unidadeVenda, produtoSelecionado)
    : 0;

  const handleAdicionar = () => {
    if (!produtoSelecionado || quantidade <= 0) {
      alert('Selecione um produto e quantidade válida');
      return;
    }

    if (!validacao.valido) {
      alert(validacao.mensagem);
      return;
    }

    const novoItem = {
      produto_id: produtoSelecionado.id,
      codigo_produto: produtoSelecionado.codigo || produtoSelecionado.codigo_barras,
      descricao: produtoSelecionado.descricao,
      foto_produto_url: produtoSelecionado.foto_produto_url,
      quantidade: quantidade,
      unidade: unidadeVenda, // V22.0: Unidade escolhida pelo usuário
      unidade_estoque: 'KG', // V22.0: SEMPRE KG para rastreamento
      valor_unitario: valorUnitario,
      percentual_desconto: percentualDesconto,
      valor_item: valorFinal,
      peso_unitario: pesoKG / quantidade, // Peso unitário em KG
      peso_total_kg: pesoKG, // V22.0: Peso total convertido
      ncm: produtoSelecionado.ncm,
      grupo: produtoSelecionado.grupo,
      // V22.0: Dados para conversão
      fatores_conversao: produtoSelecionado.fatores_conversao,
      peso_teorico_kg_m: produtoSelecionado.peso_teorico_kg_m,
      eh_bitola: produtoSelecionado.eh_bitola,
      unidades_secundarias: produtoSelecionado.unidades_secundarias
    };

    onAdicionarItem(novoItem);
    limparFormulario();
  };

  const limparFormulario = () => {
    setProdutoSelecionado(null);
    setQuantidade(1);
    setUnidadeVenda('UN');
    setValorUnitario(0);
    setPercentualDesconto(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            {itemEditando ? 'Editar' : 'Adicionar'} Item de Revenda
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção de Produto */}
          <div>
            <Label htmlFor="produto">Produto *</Label>
            <Select 
              value={produtoSelecionado?.id || ''} 
              onValueChange={handleSelecionarProduto}
            >
              <SelectTrigger id="produto">
                <SelectValue placeholder="Selecione um produto..." />
              </SelectTrigger>
              <SelectContent>
                {produtos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{p.descricao}</span>
                      {p.eh_bitola && (
                        <Badge className="ml-2 bg-orange-600 text-xs">Aço</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {produtoSelecionado && (
            <>
              {/* V22.0: Informações do Produto */}
              <Alert className="border-blue-300 bg-blue-50">
                <Package className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <p><strong>Código:</strong> {produtoSelecionado.codigo || 'N/A'}</p>
                    <p><strong>Estoque:</strong> {produtoSelecionado.estoque_disponivel?.toFixed(2) || 0} {produtoSelecionado.unidade_estoque || 'KG'}</p>
                    <p><strong>Unidade Principal:</strong> {produtoSelecionado.unidade_principal || 'UN'}</p>
                    {produtoSelecionado.eh_bitola && (
                      <p><strong>Peso/m:</strong> {produtoSelecionado.peso_teorico_kg_m?.toFixed(3) || 0} kg/m</p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              {/* V22.0: Grid de Entrada */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantidade">Quantidade *</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={quantidade}
                    onChange={(e) => setQuantidade(parseFloat(e.target.value) || 0)}
                    placeholder="100"
                  />
                </div>

                <div>
                  <Label htmlFor="unidade-venda">Vender Por (V22.0) *</Label>
                  <Select value={unidadeVenda} onValueChange={setUnidadeVenda}>
                    <SelectTrigger id="unidade-venda">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {opcoesUnidades.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 mt-1">
                    💡 Escolha como o cliente vai comprar (PÇ/MT/KG)
                  </p>
                </div>
              </div>

              {/* V22.0: Preview de Conversão */}
              {quantidade > 0 && produtoSelecionado.eh_bitola && (
                <PreviewConversao
                  quantidade={quantidade}
                  unidadeOrigem={unidadeVenda}
                  produto={produtoSelecionado}
                />
              )}

              {/* Validação de Conversão */}
              {!validacao.valido && (
                <Alert className="border-red-300 bg-red-50">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-sm text-red-700">
                    {validacao.mensagem}
                  </AlertDescription>
                </Alert>
              )}

              {/* Preço e Desconto */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valor-unitario">Valor Unitário (R$/{unidadeVenda})</Label>
                  <Input
                    id="valor-unitario"
                    type="number"
                    step="0.01"
                    value={valorUnitario}
                    onChange={(e) => setValorUnitario(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="desconto">Desconto (%)</Label>
                  <Input
                    id="desconto"
                    type="number"
                    step="0.1"
                    max="100"
                    value={percentualDesconto}
                    onChange={(e) => setPercentualDesconto(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Resumo do Item */}
              <Card className="border-2 border-green-300 bg-green-50">
                <CardContent className="p-4">
                  <h4 className="font-bold text-sm text-green-900 mb-3 flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Resumo do Item
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-green-700">Quantidade:</p>
                      <p className="font-bold text-lg">{quantidade} {unidadeVenda}</p>
                    </div>
                    <div>
                      <p className="text-green-700">Peso Total (KG):</p>
                      <p className="font-bold text-lg">{pesoKG.toFixed(2)} kg</p>
                      <p className="text-xs text-green-600">
                        (Base para estoque e custo)
                      </p>
                    </div>
                    <div>
                      <p className="text-green-700">Valor Bruto:</p>
                      <p className="font-semibold">R$ {valorBruto.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-green-700">Desconto:</p>
                      <p className="font-semibold text-orange-600">- R$ {valorDesconto.toFixed(2)}</p>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-green-300">
                      <p className="text-green-700">Valor Final:</p>
                      <p className="font-bold text-2xl text-green-600">
                        R$ {valorFinal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* V22.0: Alerta se Bitola */}
              {produtoSelecionado.eh_bitola && (
                <Alert className="border-blue-300 bg-blue-50">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-xs text-blue-700">
                    <strong>Produto de Aço:</strong> A conversão está sendo calculada automaticamente.
                    <br />• Venda: <strong>{quantidade} {unidadeVenda}</strong>
                    <br />• Estoque: <strong>{pesoKG.toFixed(2)} KG</strong> (rastreamento financeiro)
                    <br />• Peso/m: <strong>{produtoSelecionado.peso_teorico_kg_m?.toFixed(3)} kg/m</strong>
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleAdicionar}
            disabled={!produtoSelecionado || quantidade <= 0 || !validacao.valido}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Package className="w-4 h-4 mr-2" />
            {itemEditando ? 'Atualizar' : 'Adicionar'} Item
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}