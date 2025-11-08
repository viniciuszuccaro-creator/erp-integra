import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, UserCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function CargoForm({ cargo, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(cargo || {
    nome_cargo: '',
    descricao: '',
    codigo_cbo: '',
    departamento_id: '',
    nivel_hierarquico: 'Operacional',
    salario_base: 0,
    competencias_requeridas: [],
    ativo: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome_cargo) {
      alert('Preencha o nome do cargo');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome do Cargo *</Label>
        <Input
          value={formData.nome_cargo}
          onChange={(e) => setFormData({...formData, nome_cargo: e.target.value})}
          placeholder="Ex: Vendedor, Operador de CNC"
        />
      </div>

      <div>
        <Label>Código CBO</Label>
        <Input
          value={formData.codigo_cbo}
          onChange={(e) => setFormData({...formData, codigo_cbo: e.target.value})}
          placeholder="0000-00"
        />
      </div>

      <div>
        <Label>Nível Hierárquico</Label>
        <Select value={formData.nivel_hierarquico} onValueChange={(v) => setFormData({...formData, nivel_hierarquico: v})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Diretoria">Diretoria</SelectItem>
            <SelectItem value="Gerência">Gerência</SelectItem>
            <SelectItem value="Coordenação">Coordenação</SelectItem>
            <SelectItem value="Supervisão">Supervisão</SelectItem>
            <SelectItem value="Operacional">Operacional</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Salário Base</Label>
        <Input
          type="number"
          step="0.01"
          value={formData.salario_base}
          onChange={(e) => setFormData({...formData, salario_base: parseFloat(e.target.value)})}
          placeholder="R$ 0,00"
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

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Cargo Ativo</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(v) => setFormData({...formData, ativo: v})}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {cargo ? 'Atualizar' : 'Criar Cargo'}
        </Button>
      </div>
    </form>
  );
}