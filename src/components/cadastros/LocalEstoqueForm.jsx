import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, MapPin } from "lucide-react";

export default function LocalEstoqueForm({ local, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(local || {
    nome_local: '',
    codigo: '',
    tipo: 'Almoxarifado',
    endereco_completo: '',
    responsavel_nome: '',
    permite_entrada: true,
    permite_saida: true,
    ativo: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome_local) {
      alert('Preencha o nome do local');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome do Local *</Label>
        <Input
          value={formData.nome_local}
          onChange={(e) => setFormData({...formData, nome_local: e.target.value})}
          placeholder="Ex: CD Principal, Almoxarifado Filial 2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Código</Label>
          <Input
            value={formData.codigo}
            onChange={(e) => setFormData({...formData, codigo: e.target.value})}
            placeholder="Ex: ALM001"
          />
        </div>
        <div>
          <Label>Tipo</Label>
          <Input
            value={formData.tipo}
            onChange={(e) => setFormData({...formData, tipo: e.target.value})}
            placeholder="Almoxarifado, CD, Depósito"
          />
        </div>
      </div>

      <div>
        <Label>Endereço Completo</Label>
        <Textarea
          value={formData.endereco_completo}
          onChange={(e) => setFormData({...formData, endereco_completo: e.target.value})}
          rows={2}
          placeholder="Endereço completo do local"
        />
      </div>

      <div>
        <Label>Responsável</Label>
        <Input
          value={formData.responsavel_nome}
          onChange={(e) => setFormData({...formData, responsavel_nome: e.target.value})}
          placeholder="Nome do responsável"
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Permite Entrada</Label>
        <Switch
          checked={formData.permite_entrada}
          onCheckedChange={(v) => setFormData({...formData, permite_entrada: v})}
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Permite Saída</Label>
        <Switch
          checked={formData.permite_saida}
          onCheckedChange={(v) => setFormData({...formData, permite_saida: v})}
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