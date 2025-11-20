import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Loader2 } from 'lucide-react';

export default function MoedaIndiceFormCompleto({ moeda, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(moeda || {
    codigo: '',
    nome: '',
    tipo: 'Moeda',
    cotacao_atual: 0,
    fonte_cotacao: '',
    ativo: true,
    observacoes: ''
  });
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    await onSubmit(formData);
    setSalvando(false);
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Código *</Label>
          <Input
            value={formData.codigo}
            onChange={(e) => setFormData({...formData, codigo: e.target.value.toUpperCase()})}
            placeholder="Ex: USD, EUR, IPCA"
            required
          />
        </div>
        <div>
          <Label>Nome *</Label>
          <Input
            value={formData.nome}
            onChange={(e) => setFormData({...formData, nome: e.target.value})}
            placeholder="Ex: Dólar Americano"
            required
          />
        </div>
      </div>

      <div>
        <Label>Tipo</Label>
        <Select value={formData.tipo} onValueChange={(val) => setFormData({...formData, tipo: val})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Moeda">Moeda</SelectItem>
            <SelectItem value="Índice">Índice</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Cotação Atual</Label>
        <Input
          type="number"
          step="0.0001"
          value={formData.cotacao_atual}
          onChange={(e) => setFormData({...formData, cotacao_atual: parseFloat(e.target.value) || 0})}
        />
      </div>

      <div>
        <Label>Fonte de Cotação</Label>
        <Input
          value={formData.fonte_cotacao}
          onChange={(e) => setFormData({...formData, fonte_cotacao: e.target.value})}
          placeholder="Ex: Banco Central, IBGE"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label>Ativo</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(val) => setFormData({...formData, ativo: val})}
        />
      </div>

      <div>
        <Label>Observações</Label>
        <Textarea
          value={formData.observacoes}
          onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
          rows={2}
        />
      </div>

      <Button type="submit" className="w-full" disabled={salvando}>
        {salvando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TrendingUp className="w-4 h-4 mr-2" />}
        {moeda ? 'Atualizar Moeda/Índice' : 'Criar Moeda/Índice'}
      </Button>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col bg-white">
        <div className="flex-1 overflow-auto p-6">
          {formContent}
        </div>
      </div>
    );
  }

  return formContent;
}