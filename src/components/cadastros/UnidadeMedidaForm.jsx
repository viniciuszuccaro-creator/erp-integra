import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Ruler } from 'lucide-react';

export default function UnidadeMedidaForm({ unidade, onSubmit, windowMode }) {
  const [formData, setFormData] = useState(unidade || {
    sigla: '',
    descricao: '',
    tipo: 'Quantidade',
    ativo: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.sigla || !formData.descricao) {
      alert('Sigla e descrição são obrigatórios');
      return;
    }
    onSubmit?.(formData);
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Sigla *</Label>
          <Input
            value={formData.sigla}
            onChange={(e) => setFormData({ ...formData, sigla: e.target.value })}
            placeholder="Ex: KG, MT, UN"
            required
          />
        </div>
        <div>
          <Label>Descrição *</Label>
          <Input
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            placeholder="Ex: Quilograma, Metro, Unidade"
            required
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Ativo</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(val) => setFormData({ ...formData, ativo: val })}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
          {unidade ? 'Atualizar' : 'Criar Unidade'}
        </Button>
      </div>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="border-b p-4 bg-gradient-to-r from-indigo-50 to-blue-50">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Ruler className="w-6 h-6 text-indigo-600" />
            {unidade ? 'Editar Unidade de Medida' : 'Nova Unidade de Medida'}
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