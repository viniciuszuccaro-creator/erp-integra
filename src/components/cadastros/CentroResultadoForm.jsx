import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

export default function CentroResultadoForm({ centro, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(centro || {
    codigo: '',
    descricao: '',
    tipo: 'Receita',
    categoria: 'Operacional',
    meta_mensal: 0,
    ativo: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.codigo || !formData.descricao || !formData.tipo) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Código *</Label>
          <Input
            value={formData.codigo}
            onChange={(e) => setFormData({...formData, codigo: e.target.value})}
            placeholder="Ex: CR001"
          />
        </div>
        <div>
          <Label>Tipo *</Label>
          <Select value={formData.tipo} onValueChange={(v) => setFormData({...formData, tipo: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Receita">Receita</SelectItem>
              <SelectItem value="Despesa">Despesa</SelectItem>
              <SelectItem value="Custo">Custo</SelectItem>
              <SelectItem value="Investimento">Investimento</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Descrição *</Label>
        <Input
          value={formData.descricao}
          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
          placeholder="Descrição do centro de resultado"
        />
      </div>

      <div>
        <Label>Categoria</Label>
        <Select value={formData.categoria} onValueChange={(v) => setFormData({...formData, categoria: v})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Operacional">Operacional</SelectItem>
            <SelectItem value="Administrativo">Administrativo</SelectItem>
            <SelectItem value="Comercial">Comercial</SelectItem>
            <SelectItem value="Financeiro">Financeiro</SelectItem>
            <SelectItem value="Industrial">Industrial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Meta Mensal (R$)</Label>
        <Input
          type="number"
          step="0.01"
          value={formData.meta_mensal}
          onChange={(e) => setFormData({...formData, meta_mensal: parseFloat(e.target.value)})}
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Centro Ativo</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(v) => setFormData({...formData, ativo: v})}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {centro ? 'Atualizar' : 'Criar Centro'}
        </Button>
      </div>
    </form>
  );
}