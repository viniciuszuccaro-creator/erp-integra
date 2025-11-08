import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Boxes } from "lucide-react";

export default function LocalEstoqueForm({ local, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(local || {
    nome_centro: '',
    tipo: 'CD',
    endereco: {},
    permite_estoque: true,
    capacidade_m3: 0,
    area_m2: 0,
    ativo: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome_centro || !formData.tipo) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome do Local *</Label>
        <Input
          value={formData.nome_centro}
          onChange={(e) => setFormData({...formData, nome_centro: e.target.value})}
          placeholder="Ex: CD Guarulhos, Obra Cliente X"
        />
      </div>

      <div>
        <Label>Tipo *</Label>
        <Select value={formData.tipo} onValueChange={(v) => setFormData({...formData, tipo: v})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CD">CD (Centro de Distribuição)</SelectItem>
            <SelectItem value="Obra">Obra</SelectItem>
            <SelectItem value="Loja">Loja</SelectItem>
            <SelectItem value="Depósito">Depósito</SelectItem>
            <SelectItem value="Fábrica">Fábrica</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Área (m²)</Label>
          <Input
            type="number"
            value={formData.area_m2}
            onChange={(e) => setFormData({...formData, area_m2: parseFloat(e.target.value)})}
          />
        </div>

        <div>
          <Label>Capacidade (m³)</Label>
          <Input
            type="number"
            value={formData.capacidade_m3}
            onChange={(e) => setFormData({...formData, capacidade_m3: parseFloat(e.target.value)})}
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Controle de Estoque Ativo</Label>
        <Switch
          checked={formData.permite_estoque}
          onCheckedChange={(v) => setFormData({...formData, permite_estoque: v})}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {local ? 'Atualizar' : 'Criar Local'}
        </Button>
      </div>
    </form>
  );
}