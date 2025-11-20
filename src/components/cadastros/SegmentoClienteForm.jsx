import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Loader2 } from 'lucide-react';

export default function SegmentoClienteForm({ segmento, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(segmento || {
    nome_segmento: '',
    descricao: '',
    tipo_segmento: 'Comercial',
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
      <div>
        <Label>Nome do Segmento *</Label>
        <Input
          value={formData.nome_segmento}
          onChange={(e) => setFormData({...formData, nome_segmento: e.target.value})}
          placeholder="Ex: Metalúrgicas, Construtoras"
          required
        />
      </div>

      <div>
        <Label>Descrição</Label>
        <Textarea
          value={formData.descricao}
          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
          rows={3}
        />
      </div>

      <div>
        <Label>Tipo de Segmento</Label>
        <Select value={formData.tipo_segmento} onValueChange={(val) => setFormData({...formData, tipo_segmento: val})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Industrial">Industrial</SelectItem>
            <SelectItem value="Comercial">Comercial</SelectItem>
            <SelectItem value="Construção Civil">Construção Civil</SelectItem>
            <SelectItem value="Consumidor Final">Consumidor Final</SelectItem>
            <SelectItem value="Governo">Governo</SelectItem>
            <SelectItem value="Outro">Outro</SelectItem>
          </SelectContent>
        </Select>
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
        {salvando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Users className="w-4 h-4 mr-2" />}
        {segmento ? 'Atualizar Segmento' : 'Criar Segmento'}
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