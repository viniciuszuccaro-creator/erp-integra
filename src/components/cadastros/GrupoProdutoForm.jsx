import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

export default function GrupoProdutoForm({ grupo, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(grupo || {
    nome_grupo: '',
    codigo: '',
    natureza: 'Revenda',
    ncm_padrao: '',
    margem_sugerida: 0,
    ativo: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome_grupo || !formData.natureza) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome do Grupo *</Label>
        <Input
          value={formData.nome_grupo}
          onChange={(e) => setFormData({...formData, nome_grupo: e.target.value})}
          placeholder="Ex: Ferragens, Bitolas, Materiais Elétricos"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Código</Label>
          <Input
            value={formData.codigo}
            onChange={(e) => setFormData({...formData, codigo: e.target.value})}
            placeholder="Ex: FERR001"
          />
        </div>
        <div>
          <Label>Natureza *</Label>
          <Select value={formData.natureza} onValueChange={(v) => setFormData({...formData, natureza: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Revenda">Revenda</SelectItem>
              <SelectItem value="Produção">Produção</SelectItem>
              <SelectItem value="Consumo">Consumo</SelectItem>
              <SelectItem value="Serviço">Serviço</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>NCM Padrão</Label>
          <Input
            value={formData.ncm_padrao}
            onChange={(e) => setFormData({...formData, ncm_padrao: e.target.value})}
            placeholder="Ex: 7213.10.00"
          />
        </div>
        <div>
          <Label>Margem Sugerida (%)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.margem_sugerida}
            onChange={(e) => setFormData({...formData, margem_sugerida: parseFloat(e.target.value)})}
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Grupo Ativo</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(v) => setFormData({...formData, ativo: v})}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {grupo ? 'Atualizar' : 'Criar Grupo'}
        </Button>
      </div>
    </form>
  );
}