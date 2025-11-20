import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Receipt } from 'lucide-react';

export default function TipoDespesaForm({ tipoDespesa, onSubmit, windowMode }) {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome) {
      alert('Nome é obrigatório');
      return;
    }
    onSubmit?.(formData);
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Código</Label>
          <Input
            value={formData.codigo}
            onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
            placeholder="Ex: DESP-001"
          />
        </div>
        <div>
          <Label>Nome *</Label>
          <Input
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Ex: Aluguel, Energia"
            required
          />
        </div>
      </div>

      <div>
        <Label>Categoria</Label>
        <Select value={formData.categoria} onValueChange={(val) => setFormData({ ...formData, categoria: val })}>
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

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Exige Aprovação</Label>
        <Switch
          checked={formData.exige_aprovacao}
          onCheckedChange={(val) => setFormData({ ...formData, exige_aprovacao: val })}
        />
      </div>

      {formData.exige_aprovacao && (
        <div>
          <Label>Limite para Aprovação Automática (R$)</Label>
          <Input
            type="number"
            value={formData.limite_aprovacao_automatica}
            onChange={(e) => setFormData({ ...formData, limite_aprovacao_automatica: parseFloat(e.target.value) })}
          />
        </div>
      )}

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Despesa Recorrente</Label>
        <Switch
          checked={formData.recorrente}
          onCheckedChange={(val) => setFormData({ ...formData, recorrente: val })}
        />
      </div>

      <div>
        <Label>Observações</Label>
        <Textarea
          value={formData.observacoes}
          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Ativo</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(val) => setFormData({ ...formData, ativo: val })}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
          {tipoDespesa ? 'Atualizar' : 'Criar Tipo de Despesa'}
        </Button>
      </div>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="border-b p-4 bg-gradient-to-r from-purple-50 to-blue-50">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-purple-600" />
            {tipoDespesa ? 'Editar Tipo de Despesa' : 'Novo Tipo de Despesa'}
          </h2>
        </div>
        <div className="flex-1 overflow-auto p-6">
          {renderForm()}
        </div>
      </div>
    );
  }

  return renderForm();
}