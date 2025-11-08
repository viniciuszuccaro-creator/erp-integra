import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Users } from "lucide-react";

export default function SegmentoClienteForm({ segmento, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(segmento || {
    nome_segmento: '',
    descricao: '',
    criterios: {
      faturamento_minimo: 0,
      quantidade_pedidos_minima: 0,
      tipo_cliente: 'Atacado'
    },
    cor_ui: '#3b82f6',
    ativo: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome_segmento) {
      alert('Preencha o nome do segmento');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome do Segmento *</Label>
        <Input
          value={formData.nome_segmento}
          onChange={(e) => setFormData({...formData, nome_segmento: e.target.value})}
          placeholder="Ex: Construtoras, Revendedores, Governo"
        />
      </div>

      <div>
        <Label>Descrição</Label>
        <Textarea
          value={formData.descricao}
          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Faturamento Mínimo (R$)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.criterios?.faturamento_minimo || 0}
            onChange={(e) => setFormData({
              ...formData,
              criterios: {
                ...formData.criterios,
                faturamento_minimo: parseFloat(e.target.value)
              }
            })}
          />
        </div>

        <div>
          <Label>Qtd Mínima de Pedidos</Label>
          <Input
            type="number"
            value={formData.criterios?.quantidade_pedidos_minima || 0}
            onChange={(e) => setFormData({
              ...formData,
              criterios: {
                ...formData.criterios,
                quantidade_pedidos_minima: parseInt(e.target.value)
              }
            })}
          />
        </div>
      </div>

      <div>
        <Label>Tipo de Cliente</Label>
        <Select 
          value={formData.criterios?.tipo_cliente || 'Atacado'} 
          onValueChange={(v) => setFormData({
            ...formData,
            criterios: {
              ...formData.criterios,
              tipo_cliente: v
            }
          })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Atacado">Atacado</SelectItem>
            <SelectItem value="Varejo">Varejo</SelectItem>
            <SelectItem value="Governo">Governo</SelectItem>
            <SelectItem value="Indústria">Indústria</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Cor (UI)</Label>
        <div className="flex gap-2 items-center">
          <Input
            type="color"
            value={formData.cor_ui}
            onChange={(e) => setFormData({...formData, cor_ui: e.target.value})}
            className="w-20 h-10"
          />
          <span className="text-sm text-slate-600">{formData.cor_ui}</span>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {segmento ? 'Atualizar' : 'Criar Segmento'}
        </Button>
      </div>
    </form>
  );
}