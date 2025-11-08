import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Truck } from "lucide-react";

export default function TipoFreteForm({ tipo, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(tipo || {
    codigo: '',
    descricao: '',
    modalidade: 'CIF',
    cobra_frete: true,
    calculo_automatico: false,
    formula_calculo: 'Por KM',
    valor_base_km: 0,
    peso_maximo_kg: 0,
    valor_por_kg_excedente: 0,
    responsavel_pagamento: 'Empresa',
    ativo: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.descricao) {
      alert('Preencha a descrição');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Código</Label>
          <Input
            value={formData.codigo}
            onChange={(e) => setFormData({...formData, codigo: e.target.value})}
            placeholder="FRETE-01"
          />
        </div>

        <div>
          <Label>Modalidade *</Label>
          <Select value={formData.modalidade} onValueChange={(v) => setFormData({...formData, modalidade: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CIF">CIF (Vendedor paga)</SelectItem>
              <SelectItem value="FOB">FOB (Comprador paga)</SelectItem>
              <SelectItem value="Próprio">Próprio</SelectItem>
              <SelectItem value="Terceiro">Terceiro</SelectItem>
              <SelectItem value="Retira">Retira (Cliente retira)</SelectItem>
              <SelectItem value="Cortesia">Cortesia (Grátis)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Descrição *</Label>
        <Input
          value={formData.descricao}
          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
          placeholder="Ex: Entrega Padrão, Express, Econômica"
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Cobra Frete</Label>
        <Switch
          checked={formData.cobra_frete}
          onCheckedChange={(v) => setFormData({...formData, cobra_frete: v})}
        />
      </div>

      {formData.cobra_frete && (
        <>
          <div>
            <Label>Fórmula de Cálculo</Label>
            <Select value={formData.formula_calculo} onValueChange={(v) => setFormData({...formData, formula_calculo: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Por KM">Por KM</SelectItem>
                <SelectItem value="Por Região">Por Região</SelectItem>
                <SelectItem value="Por Peso">Por Peso</SelectItem>
                <SelectItem value="Tabela Fixa">Tabela Fixa</SelectItem>
                <SelectItem value="API Externa">API Externa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.formula_calculo === 'Por KM' && (
            <div>
              <Label>Valor por KM (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.valor_base_km}
                onChange={(e) => setFormData({...formData, valor_base_km: parseFloat(e.target.value)})}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Peso Máximo (KG)</Label>
              <Input
                type="number"
                value={formData.peso_maximo_kg}
                onChange={(e) => setFormData({...formData, peso_maximo_kg: parseFloat(e.target.value)})}
              />
            </div>

            <div>
              <Label>Valor por KG Excedente (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.valor_por_kg_excedente}
                onChange={(e) => setFormData({...formData, valor_por_kg_excedente: parseFloat(e.target.value)})}
              />
            </div>
          </div>
        </>
      )}

      <div>
        <Label>Responsável Pagamento</Label>
        <Select value={formData.responsavel_pagamento} onValueChange={(v) => setFormData({...formData, responsavel_pagamento: v})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Empresa">Empresa</SelectItem>
            <SelectItem value="Cliente">Cliente</SelectItem>
            <SelectItem value="Terceiro">Terceiro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {tipo ? 'Atualizar' : 'Criar Tipo de Frete'}
        </Button>
      </div>
    </form>
  );
}