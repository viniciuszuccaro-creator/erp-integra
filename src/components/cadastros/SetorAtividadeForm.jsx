import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export default function SetorAtividadeForm({ setor, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    nome: setor?.nome || '',
    descricao: setor?.descricao || '',
    codigo: setor?.codigo || '',
    ativo: setor?.ativo !== undefined ? setor.ativo : true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome do Setor *</Label>
        <Input
          value={formData.nome}
          onChange={(e) => setFormData({...formData, nome: e.target.value})}
          placeholder="Ex: Revenda, Almoxarifado, Produção"
          required
        />
      </div>

      <div>
        <Label>Código</Label>
        <Input
          value={formData.codigo}
          onChange={(e) => setFormData({...formData, codigo: e.target.value})}
          placeholder="Ex: REV, ALM, PROD"
        />
      </div>

      <div>
        <Label>Descrição</Label>
        <Textarea
          value={formData.descricao}
          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
          placeholder="Descreva a finalidade deste setor..."
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Ativo</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(v) => setFormData({...formData, ativo: v})}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {setor ? 'Atualizar Setor' : 'Criar Setor'}
      </Button>
    </form>
  );
}