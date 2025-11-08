import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

export default function CondicaoComercialForm({ condicao, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(condicao || {
    nome_condicao: '',
    descricao: '',
    prazo_pagamento_dias: 0,
    percentual_desconto: 0,
    tipo_frete: 'CIF',
    permite_parcelamento: false,
    maximo_parcelas: 1,
    ativo: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome_condicao) {
      alert('Preencha o nome da condição');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome da Condição *</Label>
        <Input
          value={formData.nome_condicao}
          onChange={(e) => setFormData({...formData, nome_condicao: e.target.value})}
          placeholder="Ex: Atacado 30 dias, Varejo à vista"
        />
      </div>

      <div>
        <Label>Descrição</Label>
        <Input
          value={formData.descricao}
          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Prazo Pagamento (dias)</Label>
          <Input
            type="number"
            value={formData.prazo_pagamento_dias}
            onChange={(e) => setFormData({...formData, prazo_pagamento_dias: parseInt(e.target.value)})}
          />
        </div>
        <div>
          <Label>Desconto Padrão (%)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.percentual_desconto}
            onChange={(e) => setFormData({...formData, percentual_desconto: parseFloat(e.target.value)})}
          />
        </div>
      </div>

      <div>
        <Label>Tipo de Frete</Label>
        <Select value={formData.tipo_frete} onValueChange={(v) => setFormData({...formData, tipo_frete: v})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CIF">CIF - Empresa paga</SelectItem>
            <SelectItem value="FOB">FOB - Cliente paga</SelectItem>
            <SelectItem value="Retirada">Retirada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <div>
          <Label>Permite Parcelamento</Label>
          <p className="text-xs text-slate-500">Habilita parcelamento de pagamento</p>
        </div>
        <Switch
          checked={formData.permite_parcelamento}
          onCheckedChange={(v) => setFormData({...formData, permite_parcelamento: v})}
        />
      </div>

      {formData.permite_parcelamento && (
        <div>
          <Label>Máximo de Parcelas</Label>
          <Input
            type="number"
            value={formData.maximo_parcelas}
            onChange={(e) => setFormData({...formData, maximo_parcelas: parseInt(e.target.value)})}
          />
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {condicao ? 'Atualizar' : 'Criar Condição'}
        </Button>
      </div>
    </form>
  );
}