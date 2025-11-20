import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Receipt, Loader2 } from 'lucide-react';

export default function TipoDespesaForm({ tipoDespesa, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(tipoDespesa || {
    codigo: '',
    nome: '',
    categoria: 'Operacional',
    exige_aprovacao: false,
    limite_aprovacao_automatica: 0,
    recorrente: false,
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
          <Label>Código</Label>
          <Input
            value={formData.codigo}
            onChange={(e) => setFormData({...formData, codigo: e.target.value})}
            placeholder="Ex: DESP001"
          />
        </div>
        <div>
          <Label>Nome *</Label>
          <Input
            value={formData.nome}
            onChange={(e) => setFormData({...formData, nome: e.target.value})}
            placeholder="Nome do tipo de despesa"
            required
          />
        </div>
      </div>

      <div>
        <Label>Categoria</Label>
        <Select value={formData.categoria} onValueChange={(val) => setFormData({...formData, categoria: val})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Fixa">Fixa</SelectItem>
            <SelectItem value="Variável">Variável</SelectItem>
            <SelectItem value="Operacional">Operacional</SelectItem>
            <SelectItem value="Administrativa">Administrativa</SelectItem>
            <SelectItem value="Comercial">Comercial</SelectItem>
            <SelectItem value="Fiscal">Fiscal</SelectItem>
            <SelectItem value="Financeira">Financeira</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Limite Aprovação Automática (R$)</Label>
        <Input
          type="number"
          value={formData.limite_aprovacao_automatica}
          onChange={(e) => setFormData({...formData, limite_aprovacao_automatica: parseFloat(e.target.value) || 0})}
          placeholder="0.00"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label>Exige Aprovação</Label>
        <Switch
          checked={formData.exige_aprovacao}
          onCheckedChange={(val) => setFormData({...formData, exige_aprovacao: val})}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label>Recorrente</Label>
        <Switch
          checked={formData.recorrente}
          onCheckedChange={(val) => setFormData({...formData, recorrente: val})}
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
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={salvando}>
        {salvando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Receipt className="w-4 h-4 mr-2" />}
        {tipoDespesa ? 'Atualizar Tipo de Despesa' : 'Criar Tipo de Despesa'}
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