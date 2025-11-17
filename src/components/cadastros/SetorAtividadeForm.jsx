import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export default function SetorAtividadeForm({ setor, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(setor || {
    nome: '',
    descricao: '',
    tipo_operacao: 'Revenda',
    icone: '',
    cor: '#3B82F6',
    ativo: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <div>
        <Label>Nome do Setor *</Label>
        <Input
          value={formData.nome}
          onChange={(e) => setFormData({...formData, nome: e.target.value})}
          placeholder="Ex: Revenda, Almoxarifado, Fábrica"
          required
        />
      </div>

      <div>
        <Label>Descrição</Label>
        <Textarea
          value={formData.descricao}
          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
          placeholder="Detalhes sobre este setor de atividade"
        />
      </div>

      <div>
        <Label>Tipo de Operação</Label>
        <Select value={formData.tipo_operacao} onValueChange={(v) => setFormData({...formData, tipo_operacao: v})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Revenda">Revenda</SelectItem>
            <SelectItem value="Produção">Produção</SelectItem>
            <SelectItem value="Serviço">Serviço</SelectItem>
            <SelectItem value="Consumo Interno">Consumo Interno</SelectItem>
            <SelectItem value="Logística">Logística</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Ícone (Emoji)</Label>
          <Input
            value={formData.icone}
            onChange={(e) => setFormData({...formData, icone: e.target.value})}
            placeholder="📦"
          />
        </div>

        <div>
          <Label>Cor</Label>
          <Input
            type="color"
            value={formData.cor}
            onChange={(e) => setFormData({...formData, cor: e.target.value})}
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-50 rounded">
        <Label>Setor Ativo</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(v) => setFormData({...formData, ativo: v})}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {setor ? 'Atualizar' : 'Criar'} Setor
        </Button>
      </div>
    </form>
  );
}