import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

export default function SegmentoClienteForm({ segmento, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(segmento || {
    nome_segmento: '',
    descricao: '',
    criterios: {
      faturamento_minimo: 0,
      quantidade_pedidos_minima: 0,
      tipo_cliente: ''
    },
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
          rows={3}
        />
      </div>

      <div>
        <Label className="mb-3 block">Critérios de Classificação Automática</Label>
        
        <div className="space-y-3 p-4 bg-slate-50 rounded">
          <div>
            <Label className="text-xs">Faturamento Mínimo (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.criterios.faturamento_minimo}
              onChange={(e) => setFormData({
                ...formData,
                criterios: {...formData.criterios, faturamento_minimo: parseFloat(e.target.value)}
              })}
            />
          </div>
          
          <div>
            <Label className="text-xs">Quantidade Mínima de Pedidos</Label>
            <Input
              type="number"
              value={formData.criterios.quantidade_pedidos_minima}
              onChange={(e) => setFormData({
                ...formData,
                criterios: {...formData.criterios, quantidade_pedidos_minima: parseInt(e.target.value)}
              })}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Segmento Ativo</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(v) => setFormData({...formData, ativo: v})}
        />
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