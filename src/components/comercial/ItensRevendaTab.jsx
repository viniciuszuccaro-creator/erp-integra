
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Search, Copy, Package, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Aba 2: Itens de Revenda
 * Produtos de estoque
 */
export default function ItensRevendaTab({ formData, setFormData, onNext }) {
  const [search, setSearch] = useState('');
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [descontoItem, setDescontoItem] = useState(0);

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos-revenda', formData?.empresa_id],
    queryFn: async () => {
      const filter = formData?.empresa_id 
        ? { empresa_id: formData.empresa_id, tipo_item: 'Revenda', status: 'Ativo' }
        : { tipo_item: 'Revenda', status: 'Ativo' };
      return await base44.entities.Produto.filter(filter);
    },
    enabled: true
  });

  const produtosFiltrados = produtos.filter(p =>
    p.descricao?.toLowerCase().includes(search.toLowerCase()) ||
    p.codigo?.toLowerCase().includes(search.toLowerCase())
  );

  const adicionarItem = () => {
    if (!produtoSelecionado) {
      toast.error('Selecione um produto');
      return;
    }

    const precoBase = produtoSelecionado.preco_venda || 0;
    const descontoValor = (precoBase * descontoItem) / 100;
    const precoUnitario = precoBase - descontoValor;
    const valorTotal = precoUnitario * quantidade;

    const novoItem = {
      produto_id: produtoSelecionado.id,
      codigo_sku: produtoSelecionado.codigo,
      descricao: produtoSelecionado.descricao,
      unidade: produtoSelecionado.unidade_medida,
      quantidade,
      custo_unitario: produtoSelecionado.custo_medio || 0,
      preco_base_produto: precoBase,
      preco_unitario_bruto: precoBase,
      desconto_item_percentual: descontoItem,
      desconto_item_valor: descontoValor * quantidade,
      preco_unitario: precoUnitario,
      valor_item: valorTotal,
      margem_percentual: precoUnitario > 0 
        ? (((precoUnitario - (produtoSelecionado.custo_medio || 0)) / precoUnitario) * 100)
        : 0,
      estoque_disponivel: produtoSelecionado.estoque_disponivel || 0,
      peso_unitario: produtoSelecionado.peso_kg || 0
    };

    setFormData(prev => ({
      ...prev,
      itens_revenda: [...(prev?.itens_revenda || []), novoItem]
    }));

    // Reset
    setProdutoSelecionado(null);
    setQuantidade(1);
    setDescontoItem(0);
    setSearch('');
    toast.success('✅ Item adicionado');
  };

  const removerItem = (index) => {
    setFormData(prev => ({
      ...prev,
      itens_revenda: (prev?.itens_revenda || []).filter((_, i) => i !== index)
    }));
    toast.success('✅ Item removido');
  };

  const copiarUltimoPedido = async () => {
    if (!formData?.cliente_id) {
      toast.error('Selecione um cliente primeiro');
      return;
    }

    const pedidosCliente = await base44.entities.Pedido.filter(
      { cliente_id: formData.cliente_id },
      '-data_pedido',
      1
    );

    if (pedidosCliente.length > 0) {
      const ultimoPedido = pedidosCliente[0];
      if (ultimoPedido.itens_revenda && ultimoPedido.itens_revenda.length > 0) {
        setFormData(prev => ({
          ...prev,
          itens_revenda: [...(prev?.itens_revenda || []), ...ultimoPedido.itens_revenda]
        }));
        toast.success(`✅ ${ultimoPedido.itens_revenda.length} item(ns) copiado(s)`);
      } else {
        toast.error('Último pedido não tem itens de revenda');
      }
    } else {
      toast.error('Cliente não tem pedidos anteriores');
    }
  };

  return (
    <div className="space-y-6">
      {/* Busca e Adição */}
      <Card className="border-2 border-blue-300 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Produto de Revenda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar produto por código ou nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={copiarUltimoPedido}
              variant="outline"
              disabled={!formData?.cliente_id}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar Último Pedido
            </Button>
          </div>

          {/* Lista de Produtos */}
          {search && produtosFiltrados.length > 0 && (
            <div className="max-h-48 overflow-y-auto border rounded-lg bg-white">
              {produtosFiltrados.slice(0, 10).map((produto) => (
                <div
                  key={produto.id}
                  onClick={() => {
                    setProdutoSelecionado(produto);
                    setSearch('');
                  }}
                  className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{produto.descricao}</p>
                      <p className="text-xs text-slate-600">
                        SKU: {produto.codigo} • Estoque: {produto.estoque_disponivel || 0}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-green-600">
                      R$ {produto.preco_venda?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Produto Selecionado */}
          {produtoSelecionado && (
            <div className="bg-white border-2 border-blue-600 rounded-lg p-4">
              <p className="font-semibold mb-3">{produtoSelecionado.descricao}</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-600">Quantidade</label>
                  <Input
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(e) => setQuantidade(parseFloat(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600">Desconto (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={descontoItem}
                    onChange={(e) => setDescontoItem(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600">Valor Total</label>
                  <Input
                    value={`R$ ${((produtoSelecionado.preco_venda * quantidade) * (1 - descontoItem / 100)).toFixed(2)}`}
                    disabled
                    className="font-bold text-green-600"
                  />
                </div>
              </div>
              <Button
                onClick={adicionarItem}
                className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar ao Pedido
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Itens */}
      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base">
            Itens Adicionados ({formData.itens_revenda?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {formData.itens_revenda && formData.itens_revenda.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>SKU</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Preço Unit</TableHead>
                  <TableHead>Desc %</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Margem</TableHead>
                  <TableHead className="text-center">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.itens_revenda.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-xs">{item.codigo_sku}</TableCell>
                    <TableCell>{item.descricao}</TableCell>
                    <TableCell>{item.quantidade}</TableCell>
                    <TableCell>R$ {item.preco_unitario?.toFixed(2)}</TableCell>
                    <TableCell>
                      {item.desconto_item_percentual > 0 && (
                        <Badge className="bg-orange-100 text-orange-700">
                          {item.desconto_item_percentual.toFixed(1)}%
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      R$ {item.valor_item?.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        item.margem_percentual >= 20 ? 'bg-green-100 text-green-700' :
                        item.margem_percentual >= 10 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }>
                        {item.margem_percentual?.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removerItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhum item de revenda adicionado</p>
              <p className="text-sm mt-1">Use a busca acima para adicionar produtos</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navegação */}
      {formData?.itens_revenda && formData.itens_revenda.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={onNext} className="bg-blue-600">
            Próximo: Armado Padrão
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
