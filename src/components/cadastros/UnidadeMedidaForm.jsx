import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ruler, Loader2 } from 'lucide-react';

export default function UnidadeMedidaForm({ unidade, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(unidade || {
    sigla: '',
    nome_completo: '',
    tipo_grandeza: 'Unidade',
    permite_conversao: true,
    fator_conversao_para_base: 1,
    usa_em_estoque: true,
    usa_em_compras: true,
    usa_em_vendas: true,
    usa_em_producao: false,
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
          <Label>Sigla *</Label>
          <Input
            value={formData.sigla}
            onChange={(e) => setFormData({...formData, sigla: e.target.value.toUpperCase()})}
            placeholder="Ex: KG, MT, UN"
            maxLength={5}
            required
          />
        </div>
        <div>
          <Label>Nome Completo *</Label>
          <Input
            value={formData.nome_completo}
            onChange={(e) => setFormData({...formData, nome_completo: e.target.value})}
            placeholder="Ex: Quilograma, Metro"
            required
          />
        </div>
      </div>

      <div>
        <Label>Tipo de Grandeza</Label>
        <Select value={formData.tipo_grandeza} onValueChange={(val) => setFormData({...formData, tipo_grandeza: val})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Massa">Massa (peso)</SelectItem>
            <SelectItem value="Comprimento">Comprimento</SelectItem>
            <SelectItem value="Volume">Volume</SelectItem>
            <SelectItem value="Área">Área</SelectItem>
            <SelectItem value="Unidade">Unidade (contagem)</SelectItem>
            <SelectItem value="Tempo">Tempo</SelectItem>
            <SelectItem value="Outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Unidade Base (conversão)</Label>
          <Input
            value={formData.unidade_base_conversao || ''}
            onChange={(e) => setFormData({...formData, unidade_base_conversao: e.target.value})}
            placeholder="Ex: KG, MT"
          />
        </div>
        <div>
          <Label>Fator de Conversão</Label>
          <Input
            type="number"
            step="0.0001"
            value={formData.fator_conversao_para_base}
            onChange={(e) => setFormData({...formData, fator_conversao_para_base: parseFloat(e.target.value) || 1})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between">
          <Label>Usa em Estoque</Label>
          <Switch
            checked={formData.usa_em_estoque}
            onCheckedChange={(val) => setFormData({...formData, usa_em_estoque: val})}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>Usa em Compras</Label>
          <Switch
            checked={formData.usa_em_compras}
            onCheckedChange={(val) => setFormData({...formData, usa_em_compras: val})}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>Usa em Vendas</Label>
          <Switch
            checked={formData.usa_em_vendas}
            onCheckedChange={(val) => setFormData({...formData, usa_em_vendas: val})}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>Usa em Produção</Label>
          <Switch
            checked={formData.usa_em_producao}
            onCheckedChange={(val) => setFormData({...formData, usa_em_producao: val})}
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

      <Button type="submit" className="w-full" disabled={salvando}>
        {salvando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Ruler className="w-4 h-4 mr-2" />}
        {unidade ? 'Atualizar Unidade' : 'Criar Unidade'}
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