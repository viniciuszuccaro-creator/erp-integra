import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

export default function TipoDespesaForm({ tipo, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(tipo || {
    nome: '',
    codigo: '',
    categoria: 'Variável',
    natureza: 'Operacional',
    recorrente: false,
    alerta_valor_acima: 0,
    ativo: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome || !formData.categoria) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome *</Label>
        <Input
          value={formData.nome}
          onChange={(e) => setFormData({...formData, nome: e.target.value})}
          placeholder="Ex: Energia Elétrica, Material de Limpeza"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Código</Label>
          <Input
            value={formData.codigo}
            onChange={(e) => setFormData({...formData, codigo: e.target.value})}
          />
        </div>
        <div>
          <Label>Categoria *</Label>
          <Select value={formData.categoria} onValueChange={(v) => setFormData({...formData, categoria: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fixa">Fixa</SelectItem>
              <SelectItem value="Variável">Variável</SelectItem>
              <SelectItem value="Semifixo">Semifixo</SelectItem>
              <SelectItem value="Investimento">Investimento</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Natureza</Label>
        <Select value={formData.natureza} onValueChange={(v) => setFormData({...formData, natureza: v})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Operacional">Operacional</SelectItem>
            <SelectItem value="Administrativa">Administrativa</SelectItem>
            <SelectItem value="Comercial">Comercial</SelectItem>
            <SelectItem value="Financeira">Financeira</SelectItem>
            <SelectItem value="Tributária">Tributária</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Alerta se Valor Acima (R$)</Label>
        <Input
          type="number"
          step="0.01"
          value={formData.alerta_valor_acima}
          onChange={(e) => setFormData({...formData, alerta_valor_acima: parseFloat(e.target.value)})}
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Despesa Recorrente Mensal</Label>
        <Switch
          checked={formData.recorrente}
          onCheckedChange={(v) => setFormData({...formData, recorrente: v})}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {tipo ? 'Atualizar' : 'Criar Tipo'}
        </Button>
      </div>
    </form>
  );
}