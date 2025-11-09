import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import SeletorUnidadeComConversao from "./SeletorUnidadeComConversao";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * V22.0: MODAL ADICIONAR ITEM DE REVENDA
 * COM CONVERSÃO AUTOMÁTICA DE UNIDADES
 */
export default function AdicionarItemRevendaModal({ isOpen, onClose, onAdd }) {
  const [busca, setBusca] = useState("");
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState(0);
  const [unidade, setUnidade] = useState('');
  const [pesoKG, setPesoKG] = useState(0);
  const [valorUnitario, setValorUnitario] = useState(0);
  const [desconto, setDesconto] = useState(0);

  const { data: produtos = [], isLoading } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list(),
  });

  const produtosFiltrados = produtos.filter(p => 
    p.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
    p.codigo?.includes(busca)
  );

  const handleSelecionarProduto = (produto) => {
    setProdutoSelecionado(produto);
    setUnidade(produto.unidade_principal || 'UN');
    setValorUnitario(produto.preco_venda || 0);
  };

  const handleAdicionar = () => {
    if (!produtoSelecionado || quantidade === 0) {
      alert('Selecione um produto e informe a quantidade');
      return;
    }

    const valorTotal = quantidade * valorUnitario;
    const valorDesconto = (valorTotal * desconto) / 100;
    const valorFinal = valorTotal - valorDesconto;

    onAdd({
      produto_id: produtoSelecionado.id,
      codigo_produto: produtoSelecionado.codigo,
      descricao: produtoSelecionado.descricao,
      foto_produto_url: produtoSelecionado.foto_produto_url,
      quantidade,
      unidade,
      peso_equivalente_kg: pesoKG,
      valor_unitario: valorUnitario,
      percentual_desconto: desconto,
      valor_total: valorFinal,
      preco_venda_total: valorFinal,
      produto: produtoSelecionado, // Para conversões futuras
      fatores_conversao: produtoSelecionado.fatores_conversao,
      peso_teorico_kg_m: produtoSelecionado.peso_teorico_kg_m
    });

    // Limpar
    setProdutoSelecionado(null);
    setQuantidade(0);
    setDesconto(0);
    setBusca("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Produto de Revenda</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* BUSCA DE PRODUTO */}
          <div>
            <Label>Buscar Produto</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Nome, código ou SKU..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* LISTA DE PRODUTOS */}
          {busca && (
            <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-2">
              {isLoading ? (
                <p className="text-center text-sm text-slate-500">Carregando...</p>
              ) : produtosFiltrados.length > 0 ? (
                produtosFiltrados.slice(0, 10).map(p => (
                  <div
                    key={p.id}
                    onClick={() => handleSelecionarProduto(p)}
                    className={`p-3 rounded cursor-pointer hover:bg-slate-100 transition-colors ${
                      produtoSelecionado?.id === p.id ? 'bg-blue-100 border border-blue-300' : 'border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {p.foto_produto_url ? (
                        <img src={p.foto_produto_url} alt={p.descricao} className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center">
                          <Package className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{p.descricao}</p>
                        <p className="text-xs text-slate-600">SKU: {p.codigo || '-'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            Estoque: {p.estoque_disponivel || 0} {p.unidade_medida}
                          </Badge>
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            R$ {(p.preco_venda || 0).toFixed(2)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-slate-500 py-4">
                  Nenhum produto encontrado
                </p>
              )}
            </div>
          )}

          {/* DETALHES DO PRODUTO SELECIONADO */}
          {produtoSelecionado && (
            <>
              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription>
                  <p className="font-semibold text-blue-900 mb-1">
                    Produto Selecionado: {produtoSelecionado.descricao}
                  </p>
                  <p className="text-xs text-blue-800">
                    SKU: {produtoSelecionado.codigo} • Preço: R$ {(produtoSelecionado.preco_venda || 0).toFixed(2)}
                  </p>
                </AlertDescription>
              </Alert>

              {/* V22.0: SELETOR COM CONVERSÃO */}
              <SeletorUnidadeComConversao
                produto={produtoSelecionado}
                quantidadeInicial={quantidade}
                unidadeInicial={unidade}
                onChange={(qtd, un, kg) => {
                  setQuantidade(qtd);
                  setUnidade(un);
                  setPesoKG(kg);
                }}
                label="Quantidade e Unidade"
                exibirPreview={true}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Preço Unitário (R$/{unidade})</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={valorUnitario}
                    onChange={(e) => setValorUnitario(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label>Desconto (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    max="100"
                    value={desconto}
                    onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* PREVIEW TOTAIS */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-slate-600">Valor Total</p>
                    <p className="font-bold text-green-700">
                      R$ {((quantidade * valorUnitario) * (1 - desconto / 100)).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Peso Total (KG)</p>
                    <p className="font-bold text-purple-700">
                      {pesoKG.toFixed(2)} KG
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Desconto</p>
                    <p className="font-bold text-orange-700">
                      {desconto}%
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleAdicionar}
            disabled={!produtoSelecionado || quantidade === 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Adicionar ao Pedido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}