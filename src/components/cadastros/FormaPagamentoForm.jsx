import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

export default function FormaPagamentoForm({ forma, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(forma || {
    descricao: '',
    tipo: 'Dinheiro',
    ativa: true,
    aceita_desconto: true,
    percentual_desconto_padrao: 0,
    aplicar_acrescimo: false,
    percentual_acrescimo_padrao: 0,
    prazo_compensacao_dias: 0,
    permite_parcelamento: false,
    maximo_parcelas: 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.descricao || !formData.tipo) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Descrição *</Label>
        <Input
          value={formData.descricao}
          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
          placeholder="Ex: Boleto Bancário, PIX à Vista"
        />
      </div>

      <div>
        <Label>Tipo *</Label>
        <Select value={formData.tipo} onValueChange={(v) => setFormData({...formData, tipo: v})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Dinheiro">Dinheiro</SelectItem>
            <SelectItem value="PIX">PIX</SelectItem>
            <SelectItem value="Boleto">Boleto</SelectItem>
            <SelectItem value="Cartão Crédito">Cartão Crédito</SelectItem>
            <SelectItem value="Cartão Débito">Cartão Débito</SelectItem>
            <SelectItem value="Transferência">Transferência</SelectItem>
            <SelectItem value="Cheque">Cheque</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Desconto Padrão (%)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.percentual_desconto_padrao}
            onChange={(e) => setFormData({...formData, percentual_desconto_padrao: parseFloat(e.target.value)})}
          />
        </div>

        <div>
          <Label>Acréscimo/Taxa (%)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.percentual_acrescimo_padrao}
            onChange={(e) => setFormData({...formData, percentual_acrescimo_padrao: parseFloat(e.target.value)})}
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <div>
          <Label>Permite Parcelamento</Label>
          <p className="text-xs text-slate-500">Habilitar parcelamento</p>
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
            min="1"
            max="36"
          />
        </div>
      )}

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <div>
          <Label>Forma Ativa</Label>
          <p className="text-xs text-slate-500">Disponível para uso</p>
        </div>
        <Switch
          checked={formData.ativa}
          onCheckedChange={(v) => setFormData({...formData, ativa: v})}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {forma ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}