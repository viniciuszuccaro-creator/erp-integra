import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Briefcase } from "lucide-react";

export default function DepartamentoForm({ departamento, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(departamento || {
    nome: '',
    descricao: '',
    codigo: '',
    responsavel_nome: '',
    responsavel_id: '',
    custo_mensal: 0,
    quantidade_colaboradores: 0,
    ativo: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome) {
      alert('Preencha o nome do departamento');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome do Departamento *</Label>
        <Input
          value={formData.nome}
          onChange={(e) => setFormData({...formData, nome: e.target.value})}
          placeholder="Ex: Comercial, Financeiro, Produção"
        />
      </div>

      <div>
        <Label>Código</Label>
        <Input
          value={formData.codigo}
          onChange={(e) => setFormData({...formData, codigo: e.target.value})}
          placeholder="Ex: COM, FIN, PROD"
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

      <div>
        <Label>Responsável</Label>
        <Input
          value={formData.responsavel_nome}
          onChange={(e) => setFormData({...formData, responsavel_nome: e.target.value})}
          placeholder="Nome do gestor"
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Departamento Ativo</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(v) => setFormData({...formData, ativo: v})}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {departamento ? 'Atualizar' : 'Criar Departamento'}
        </Button>
      </div>
    </form>
  );
}