import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { TrendingUp } from 'lucide-react';

export default function MoedaIndiceForm({ moeda, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(moeda || {
    codigo: '',
    nome: '',
    tipo: 'Moeda',
    cotacao_atual: 1,
    ativo: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const content = (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Código *</Label>
          <Input
            value={formData.codigo}
            onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
            placeholder="USD, EUR, IPCA..."
            required
          />
        </div>
        <div>
          <Label>Nome *</Label>
          <Input
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo</Label>
          <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v })}>
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
            onChange={(e) => setFormData({ ...formData, cotacao_atual: parseFloat(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-3 border rounded bg-slate-50">
        <Label className="font-semibold">Ativo</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(v) => setFormData({ ...formData, ativo: v })}
        />
      </div>

      <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
        {moeda ? 'Atualizar' : 'Criar Moeda/Índice'}
      </Button>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-emerald-50 to-emerald-100">
          <TrendingUp className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900">
            {moeda ? 'Editar Moeda/Índice' : 'Nova Moeda/Índice'}
          </h2>
        </div>
        <div className="flex-1 overflow-auto">{content}</div>
      </div>
    );
  }

  return content;
}