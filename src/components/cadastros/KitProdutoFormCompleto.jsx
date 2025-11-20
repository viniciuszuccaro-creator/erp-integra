import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Loader2, Plus, Trash2 } from 'lucide-react';

export default function KitProdutoFormCompleto({ kit, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(kit || {
    codigo_kit: '',
    nome_kit: '',
    descricao: '',
    tipo_kit: 'Comercial',
    itens_kit: [],
    preco_kit: 0,
    desconto_kit_percentual: 0,
    exibir_no_ecommerce: false,
    ativo: true,
    observacoes: ''
  });
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    await onSubmit(formData);
    setSalvando(false);
  };

  const adicionarItem = () => {
    setFormData({
      ...formData,
      itens_kit: [...formData.itens_kit, { produto_id: '', quantidade: 1, unidade: 'UN', observacao: '' }]
    });
  };

  const removerItem = (index) => {
    setFormData({
      ...formData,
      itens_kit: formData.itens_kit.filter((_, i) => i !== index)
    });
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Código do Kit</Label>
          <Input
            value={formData.codigo_kit}
            onChange={(e) => setFormData({...formData, codigo_kit: e.target.value})}
            placeholder="Ex: KIT001"
          />
        </div>
        <div>
          <Label>Nome do Kit *</Label>
          <Input
            value={formData.nome_kit}
            onChange={(e) => setFormData({...formData, nome_kit: e.target.value})}
            required
          />
        </div>
      </div>

      <div>
        <Label>Descrição</Label>
        <Textarea
          value={formData.descricao}
          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
          rows={2}
        />
      </div>

      <div>
        <Label>Tipo de Kit</Label>
        <Select value={formData.tipo_kit} onValueChange={(val) => setFormData({...formData, tipo_kit: val})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Comercial">Comercial</SelectItem>
            <SelectItem value="Produção">Produção</SelectItem>
            <SelectItem value="Promocional">Promocional</SelectItem>
            <SelectItem value="Personalizado">Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Itens do Kit</Label>
          <Button type="button" size="sm" onClick={adicionarItem} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Item
          </Button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
          {formData.itens_kit.map((item, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                placeholder="ID do Produto"
                value={item.produto_id}
                onChange={(e) => {
                  const novosItens = [...formData.itens_kit];
                  novosItens[index].produto_id = e.target.value;
                  setFormData({...formData, itens_kit: novosItens});
                }}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Qtd"
                value={item.quantidade}
                onChange={(e) => {
                  const novosItens = [...formData.itens_kit];
                  novosItens[index].quantidade = parseFloat(e.target.value) || 1;
                  setFormData({...formData, itens_kit: novosItens});
                }}
                className="w-20"
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => removerItem(index)}>
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Preço do Kit (R$)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.preco_kit}
            onChange={(e) => setFormData({...formData, preco_kit: parseFloat(e.target.value) || 0})}
          />
        </div>
        <div>
          <Label>Desconto do Kit (%)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.desconto_kit_percentual}
            onChange={(e) => setFormData({...formData, desconto_kit_percentual: parseFloat(e.target.value) || 0})}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label>Exibir no E-commerce</Label>
        <Switch
          checked={formData.exibir_no_ecommerce}
          onCheckedChange={(val) => setFormData({...formData, exibir_no_ecommerce: val})}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label>Ativo</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(val) => setFormData({...formData, ativo: val})}
        />
      </div>

      <Button type="submit" className="w-full" disabled={salvando}>
        {salvando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Package className="w-4 h-4 mr-2" />}
        {kit ? 'Atualizar Kit' : 'Criar Kit'}
      </Button>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col bg-white">
        <div className="flex-1 overflow-auto p-6">
          {formContent}
        </div>
      </div>
    );
  }

  return formContent;
}