import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Loader2 } from 'lucide-react';

export default function CentroResultadoFormCompleto({ centro, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(centro || {
    codigo: '',
    nome: '',
    descricao: '',
    tipo_centro: 'Departamento',
    meta_receita_mensal: 0,
    meta_despesa_mensal: 0,
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
            placeholder="Ex: CR001"
          />
        </div>
        <div>
          <Label>Nome *</Label>
          <Input
            value={formData.nome}
            onChange={(e) => setFormData({...formData, nome: e.target.value})}
            required
          />
        </div>
      </div>

      <div>
        <Label>Descrição</Label>
        <Textarea
          value={formData.descricao}
          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
          rows={2}
        />
      </div>

      <div>
        <Label>Tipo de Centro</Label>
        <Select value={formData.tipo_centro} onValueChange={(val) => setFormData({...formData, tipo_centro: val})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Produto">Produto</SelectItem>
            <SelectItem value="Serviço">Serviço</SelectItem>
            <SelectItem value="Departamento">Departamento</SelectItem>
            <SelectItem value="Projeto">Projeto</SelectItem>
            <SelectItem value="Cliente">Cliente</SelectItem>
            <SelectItem value="Regional">Regional</SelectItem>
            <SelectItem value="Outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Meta de Receita Mensal (R$)</Label>
          <Input
            type="number"
            value={formData.meta_receita_mensal}
            onChange={(e) => setFormData({...formData, meta_receita_mensal: parseFloat(e.target.value) || 0})}
          />
        </div>
        <div>
          <Label>Meta de Despesa Mensal (R$)</Label>
          <Input
            type="number"
            value={formData.meta_despesa_mensal}
            onChange={(e) => setFormData({...formData, meta_despesa_mensal: parseFloat(e.target.value) || 0})}
          />
        </div>
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
        {salvando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Target className="w-4 h-4 mr-2" />}
        {centro ? 'Atualizar Centro de Resultado' : 'Criar Centro de Resultado'}
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