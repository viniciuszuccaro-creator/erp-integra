import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";

export default function PedidoForm({ clientes, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    numero_pedido: `PED-${Date.now()}`,
    cliente_nome: "",
    cliente_id: "",
    data_pedido: new Date().toISOString().split('T')[0],
    status: "Orçamento",
    forma_pagamento: "À Vista",
    itens: [{ descricao: "", quantidade: 1, valor_unitario: 0, valor_total: 0 }],
    observacoes: ""
  });

  const handleAddItem = () => {
    setFormData({
      ...formData,
      itens: [...formData.itens, { descricao: "", quantidade: 1, valor_unitario: 0, valor_total: 0 }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItens = formData.itens.filter((_, i) => i !== index);
    setFormData({ ...formData, itens: newItens });
  };

  const handleItemChange = (index, field, value) => {
    const newItens = [...formData.itens];
    newItens[index][field] = value;
    
    if (field === 'quantidade' || field === 'valor_unitario') {
      newItens[index].valor_total = newItens[index].quantidade * newItens[index].valor_unitario;
    }
    
    setFormData({ ...formData, itens: newItens });
  };

  const calculateTotal = () => {
    return formData.itens.reduce((sum, item) => sum + (item.valor_total || 0), 0);
  };

  const pedidoSchema = z.object({
    numero_pedido: z.string().min(3),
    cliente_id: z.string().min(1, 'Cliente é obrigatório'),
    cliente_nome: z.string().min(1),
    data_pedido: z.string().min(8),
    forma_pagamento: z.string().min(1),
    itens: z.array(z.object({
      descricao: z.string().min(1, 'Descrição obrigatória'),
      quantidade: z.number().positive('Qtd > 0'),
      valor_unitario: z.number().nonnegative(),
      valor_total: z.number().nonnegative()
    })).min(1, 'Inclua pelo menos 1 item')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData, valor_total: calculateTotal() };
    const parsed = pedidoSchema.safeParse(payload);
    if (!parsed.success) {
      alert(parsed.error.issues.map(i => `• ${i.message}`).join('\n'));
      return;
    }
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full h-full">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="numero_pedido">Nº Pedido</Label>
          <Input
            id="numero_pedido"
            value={formData.numero_pedido}
            onChange={(e) => setFormData({ ...formData, numero_pedido: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="data_pedido">Data</Label>
          <Input
            id="data_pedido"
            type="date"
            value={formData.data_pedido}
            onChange={(e) => setFormData({ ...formData, data_pedido: e.target.value })}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="cliente">Cliente *</Label>
          <Select
            value={formData.cliente_id}
            onValueChange={(value) => {
              const cliente = clientes.find(c => c.id === value);
              setFormData({
                ...formData,
                cliente_id: value,
                cliente_nome: cliente?.nome || ""
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Orçamento">Orçamento</SelectItem>
              <SelectItem value="Aprovado">Aprovado</SelectItem>
              <SelectItem value="Em Produção">Em Produção</SelectItem>
              <SelectItem value="Pronto para Envio">Pronto para Envio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
          <Select
            value={formData.forma_pagamento}
            onValueChange={(value) => setFormData({ ...formData, forma_pagamento: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="À Vista">À Vista</SelectItem>
              <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
              <SelectItem value="Boleto">Boleto</SelectItem>
              <SelectItem value="Parcelado">Parcelado</SelectItem>
              <SelectItem value="PIX">PIX</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>Itens do Pedido</Label>
          <Button type="button" size="sm" variant="outline" onClick={handleAddItem}>
            <Plus className="w-4 h-4 mr-1" /> Adicionar Item
          </Button>
        </div>

        <div className="space-y-3">
          {formData.itens.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 p-3 border rounded-lg">
              <div className="col-span-5">
                <Input
                  placeholder="Descrição"
                  value={item.descricao}
                  onChange={(e) => handleItemChange(index, 'descricao', e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  placeholder="Qtd"
                  value={item.quantidade}
                  onChange={(e) => handleItemChange(index, 'quantidade', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Valor"
                  value={item.valor_unitario}
                  onChange={(e) => handleItemChange(index, 'valor_unitario', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="col-span-2">
                <Input
                  value={`R$ ${item.valor_total.toFixed(2)}`}
                  readOnly
                  className="bg-slate-50"
                />
              </div>
              <div className="col-span-1 flex items-center">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemoveItem(index)}
                  disabled={formData.itens.length === 1}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <div className="text-right">
          <p className="text-sm text-slate-500">Valor Total</p>
          <p className="text-2xl font-bold text-blue-600">
            R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
          {isSubmitting ? 'Salvando...' : 'Salvar Pedido'}
        </Button>
      </div>
    </form>
  );
}