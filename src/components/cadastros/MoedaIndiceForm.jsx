import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, TrendingUp, Sparkles } from "lucide-react";

export default function MoedaIndiceForm({ moeda, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(moeda || {
    codigo: '',
    nome: '',
    tipo: 'Moeda',
    simbolo: '',
    valor_atual: 0,
    fonte_dados: 'BCB',
    atualiza_automaticamente: false,
    frequencia_atualizacao: 'Diário',
    ativo: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.codigo || !formData.nome) {
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
            placeholder="BRL, USD, SELIC, IPCA"
          />
        </div>

        <div>
          <Label>Tipo *</Label>
          <Select value={formData.tipo} onValueChange={(v) => setFormData({...formData, tipo: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Moeda">Moeda</SelectItem>
              <SelectItem value="Índice Econômico">Índice Econômico</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Nome *</Label>
        <Input
          value={formData.nome}
          onChange={(e) => setFormData({...formData, nome: e.target.value})}
          placeholder="Ex: Real Brasileiro, Taxa Selic"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Símbolo</Label>
          <Input
            value={formData.simbolo}
            onChange={(e) => setFormData({...formData, simbolo: e.target.value})}
            placeholder="R$, $, €, %"
          />
        </div>

        <div>
          <Label>Valor Atual</Label>
          <Input
            type="number"
            step="0.0001"
            value={formData.valor_atual}
            onChange={(e) => setFormData({...formData, valor_atual: parseFloat(e.target.value)})}
          />
        </div>
      </div>

      <div>
        <Label>Fonte de Dados</Label>
        <Input
          value={formData.fonte_dados}
          onChange={(e) => setFormData({...formData, fonte_dados: e.target.value})}
          placeholder="BCB, IBGE, API Awesome"
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
        <div>
          <Label>Atualização Automática (IA)</Label>
          <p className="text-xs text-slate-500">API do Banco Central</p>
        </div>
        <Switch
          checked={formData.atualiza_automaticamente}
          onCheckedChange={(v) => setFormData({...formData, atualiza_automaticamente: v})}
        />
      </div>

      {formData.atualiza_automaticamente && (
        <div>
          <Label>Frequência</Label>
          <Select value={formData.frequencia_atualizacao} onValueChange={(v) => setFormData({...formData, frequencia_atualizacao: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tempo Real">Tempo Real</SelectItem>
              <SelectItem value="Diário">Diário</SelectItem>
              <SelectItem value="Semanal">Semanal</SelectItem>
              <SelectItem value="Mensal">Mensal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {formData.atualiza_automaticamente && (
        <Alert className="border-purple-200 bg-purple-50">
          <Sparkles className="w-4 h-4" />
          <AlertDescription className="text-sm">
            🤖 IA ativa: Cotação será atualizada automaticamente via API
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {moeda ? 'Atualizar' : 'Criar Moeda/Índice'}
        </Button>
      </div>
    </form>
  );
}