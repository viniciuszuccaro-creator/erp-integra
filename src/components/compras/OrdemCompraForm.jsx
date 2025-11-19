import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Save, ShoppingCart, Plus, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/**
 * V21.1.2: Ordem Compra Form - Adaptado para Window Mode
 */
export default function OrdemCompraForm({ ordemCompra, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(ordemCompra || {
    numero_oc: `OC-${Date.now()}`,
    fornecedor_id: '',
    fornecedor_nome: '',
    data_solicitacao: new Date().toISOString().split('T')[0],
    data_entrega_prevista: '',
    valor_total: 0,
    prazo_entrega_acordado: 30,
    condicao_pagamento: 'À Vista',
    forma_pagamento: 'Boleto',
    observacoes: '',
    status: 'Solicitada',
    itens: []
  });

  const [novoItem, setNovoItem] = useState({
    produto_id: '',
    descricao: '',
    quantidade_solicitada: 1,
    unidade: 'UN',
    valor_unitario: 0,
    valor_total: 0
  });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: () => base44.entities.Fornecedor.list(),
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list(),
  });

  const handleAddItem = () => {
    if (!novoItem.produto_id) return;
    
    const itemComValorTotal = {
      ...novoItem,
      valor_total: novoItem.quantidade_solicitada * novoItem.valor_unitario
    };

    setFormData({
      ...formData,
      itens: [...formData.itens, itemComValorTotal],
      valor_total: formData.valor_total + itemComValorTotal.valor_total
    });

    setNovoItem({
      produto_id: '',
      descricao: '',
      quantidade_solicitada: 1,
      unidade: 'UN',
      valor_unitario: 0,
      valor_total: 0
    });
  };

  const handleRemoveItem = (index) => {
    const item = formData.itens[index];
    setFormData({
      ...formData,
      itens: formData.itens.filter((_, i) => i !== index),
      valor_total: formData.valor_total - item.valor_total
    });
  };

  const handleProdutoChange = (produtoId) => {
    const produto = produtos.find(p => p.id === produtoId);
    if (produto) {
      setNovoItem({
        ...novoItem,
        produto_id: produtoId,
        descricao: produto.descricao,
        unidade: produto.unidade_medida || 'UN',
        valor_unitario: produto.custo_aquisicao || 0
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const content = (
    <form onSubmit={handleSubmit} className={`space-y-6 ${windowMode ? 'p-6 h-full overflow-auto' : ''}`}>
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            Dados da Ordem de Compra
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Número OC *</Label>
              <Input
                value={formData.numero_oc}
                onChange={(e) => setFormData({ ...formData, numero_oc: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Fornecedor *</Label>
              <Select
                value={formData.fornecedor_id}
                onValueChange={(v) => {
                  const forn = fornecedores.find(f => f.id === v);
                  setFormData({ 
                    ...formData, 
                    fornecedor_id: v,
                    fornecedor_nome: forn?.nome || ''
                  });
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {fornecedores.filter(f => f.status === 'Ativo').map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Data Solicitação *</Label>
              <Input
                type="date"
                value={formData.data_solicitacao}
                onChange={(e) => setFormData({ ...formData, data_solicitacao: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Entrega Prevista</Label>
              <Input
                type="date"
                value={formData.data_entrega_prevista}
                onChange={(e) => setFormData({ ...formData, data_entrega_prevista: e.target.value })}
              />
            </div>

            <div>
              <Label>Prazo Entrega (dias)</Label>
              <Input
                type="number"
                value={formData.prazo_entrega_acordado}
                onChange={(e) => setFormData({ ...formData, prazo_entrega_acordado: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label>Condição Pagamento</Label>
              <Select
                value={formData.condicao_pagamento}
                onValueChange={(v) => setFormData({ ...formData, condicao_pagamento: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="À Vista">À Vista</SelectItem>
                  <SelectItem value="30 dias">30 dias</SelectItem>
                  <SelectItem value="60 dias">60 dias</SelectItem>
                  <SelectItem value="90 dias">90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label>Observações</Label>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold text-lg">Itens da OC</h3>

          <div className="grid grid-cols-5 gap-3 p-4 bg-slate-50 rounded-lg">
            <div>
              <Label className="text-xs">Produto</Label>
              <Select value={novoItem.produto_id} onValueChange={handleProdutoChange}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {produtos.filter(p => p.status === 'Ativo').map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.codigo} - {p.descricao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Qtd</Label>
              <Input
                type="number"
                step="0.01"
                value={novoItem.quantidade_solicitada}
                onChange={(e) => setNovoItem({ ...novoItem, quantidade_solicitada: parseFloat(e.target.value) || 0 })}
                className="h-9 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs">Unidade</Label>
              <Input
                value={novoItem.unidade}
                readOnly
                className="h-9 text-xs bg-slate-100"
              />
            </div>

            <div>
              <Label className="text-xs">Valor Unit.</Label>
              <Input
                type="number"
                step="0.01"
                value={novoItem.valor_unitario}
                onChange={(e) => setNovoItem({ ...novoItem, valor_unitario: parseFloat(e.target.value) || 0 })}
                className="h-9 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs mb-1 block">Ação</Label>
              <Button type="button" onClick={handleAddItem} size="sm" className="w-full h-9 bg-green-600 hover:bg-green-700">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Valor Unit.</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formData.itens.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.descricao}</TableCell>
                  <TableCell>{item.quantidade_solicitada} {item.unidade}</TableCell>
                  <TableCell>R$ {item.valor_unitario?.toFixed(2)}</TableCell>
                  <TableCell className="font-bold">R$ {item.valor_total?.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {formData.itens.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              Adicione produtos à ordem de compra
            </div>
          )}

          <div className="flex justify-end p-4 bg-blue-50 rounded-lg">
            <div className="text-right">
              <p className="text-sm text-blue-700">Valor Total</p>
              <p className="text-2xl font-bold text-blue-900">
                R$ {formData.valor_total.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          {ordemCompra ? 'Atualizar' : 'Criar'} Ordem de Compra
        </Button>
      </div>
    </form>
  );

  if (windowMode) {
    return <div className="w-full h-full bg-white">{content}</div>;
  }

  return content;
}