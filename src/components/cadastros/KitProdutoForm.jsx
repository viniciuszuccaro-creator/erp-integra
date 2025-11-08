import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";

export default function KitProdutoForm({ kit, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(kit || {
    nome_kit: '',
    descricao: '',
    codigo_kit: '',
    tipo_kit: 'Armadura',
    itens_kit: [],
    preco_kit: 0,
    desconto_kit_percentual: 0,
    ativo: true
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list(),
  });

  const adicionarItem = () => {
    setFormData({
      ...formData,
      itens_kit: [
        ...(formData.itens_kit || []),
        { produto_id: '', descricao_produto: '', quantidade: 1, obrigatorio: true }
      ]
    });
  };

  const removerItem = (idx) => {
    setFormData({
      ...formData,
      itens_kit: formData.itens_kit.filter((_, i) => i !== idx)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome_kit || (formData.itens_kit || []).length === 0) {
      alert('Preencha o nome e adicione pelo menos 1 item');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome do Kit *</Label>
        <Input
          value={formData.nome_kit}
          onChange={(e) => setFormData({...formData, nome_kit: e.target.value})}
          placeholder="Ex: Kit Armadura Coluna 20x40"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Código</Label>
          <Input
            value={formData.codigo_kit}
            onChange={(e) => setFormData({...formData, codigo_kit: e.target.value})}
          />
        </div>
        <div>
          <Label>Tipo</Label>
          <Input
            value={formData.tipo_kit}
            onChange={(e) => setFormData({...formData, tipo_kit: e.target.value})}
            placeholder="Armadura, Cerca, Estrutura..."
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
        <div className="flex justify-between items-center mb-3">
          <Label>Itens do Kit ({(formData.itens_kit || []).length})</Label>
          <Button type="button" size="sm" onClick={adicionarItem}>
            <Plus className="w-3 h-3 mr-1" />
            Adicionar Item
          </Button>
        </div>
        
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {(formData.itens_kit || []).map((item, idx) => (
            <Card key={idx} className="border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    className="w-20"
                    value={item.quantidade}
                    onChange={(e) => {
                      const itens = [...formData.itens_kit];
                      itens[idx].quantidade = parseInt(e.target.value);
                      setFormData({...formData, itens_kit: itens});
                    }}
                    placeholder="Qtd"
                  />
                  <Input
                    className="flex-1"
                    value={item.descricao_produto}
                    onChange={(e) => {
                      const itens = [...formData.itens_kit];
                      itens[idx].descricao_produto = e.target.value;
                      setFormData({...formData, itens_kit: itens});
                    }}
                    placeholder="Descrição do produto"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removerItem(idx)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
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
            onChange={(e) => setFormData({...formData, preco_kit: parseFloat(e.target.value)})}
          />
        </div>
        <div>
          <Label>Desconto vs Individual (%)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.desconto_kit_percentual}
            onChange={(e) => setFormData({...formData, desconto_kit_percentual: parseFloat(e.target.value)})}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {kit ? 'Atualizar' : 'Criar Kit'}
        </Button>
      </div>
    </form>
  );
}