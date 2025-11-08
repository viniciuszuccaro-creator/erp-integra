import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Package, Plus, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

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
        ...formData.itens_kit,
        {
          produto_id: '',
          descricao_produto: '',
          quantidade: 1,
          unidade: 'UN',
          obrigatorio: true
        }
      ]
    });
  };

  const removerItem = (index) => {
    setFormData({
      ...formData,
      itens_kit: formData.itens_kit.filter((_, i) => i !== index)
    });
  };

  const atualizarItem = (index, campo, valor) => {
    const novosItens = [...formData.itens_kit];
    novosItens[index][campo] = valor;
    setFormData({
      ...formData,
      itens_kit: novosItens
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome_kit || formData.itens_kit.length === 0) {
      alert('Preencha o nome e adicione pelo menos um item');
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
          placeholder="Ex: Kit Pilar 20x20, Kit Cerca Padrão"
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
          <Label>Tipo de Kit</Label>
          <Select value={formData.tipo_kit} onValueChange={(v) => setFormData({...formData, tipo_kit: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Armadura">Armadura</SelectItem>
              <SelectItem value="Cerca">Cerca</SelectItem>
              <SelectItem value="Estrutura">Estrutura</SelectItem>
              <SelectItem value="Ferramentas">Ferramentas</SelectItem>
              <SelectItem value="EPIs">EPIs</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <Label>Itens do Kit ({formData.itens_kit.length})</Label>
          <Button type="button" size="sm" onClick={adicionarItem}>
            <Plus className="w-3 h-3 mr-2" />
            Adicionar Item
          </Button>
        </div>
        
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {formData.itens_kit.map((item, idx) => (
            <Card key={idx} className="border">
              <CardContent className="p-3">
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <Select 
                      value={item.produto_id} 
                      onValueChange={(v) => {
                        atualizarItem(idx, 'produto_id', v);
                        const prod = produtos.find(p => p.id === v);
                        if (prod) {
                          atualizarItem(idx, 'descricao_produto', prod.descricao);
                          atualizarItem(idx, 'unidade', prod.unidade_medida);
                        }
                      }}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {produtos.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.descricao}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      placeholder="Qtd"
                      value={item.quantidade}
                      onChange={(e) => atualizarItem(idx, 'quantidade', parseFloat(e.target.value))}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      placeholder="UN"
                      value={item.unidade}
                      onChange={(e) => atualizarItem(idx, 'unidade', e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removerItem(idx)}
                      className="h-9"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {formData.itens_kit.length === 0 && (
          <div className="text-center py-6 text-slate-500 text-sm border-2 border-dashed rounded">
            Nenhum item adicionado
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Preço do Kit</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.preco_kit}
            onChange={(e) => setFormData({...formData, preco_kit: parseFloat(e.target.value)})}
            placeholder="R$ 0,00"
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