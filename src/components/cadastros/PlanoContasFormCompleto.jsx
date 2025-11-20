import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function PlanoContasFormCompleto({ conta, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(conta || {
    codigo_conta: '',
    nome_conta: '',
    descricao: '',
    tipo_conta: 'Despesa',
    natureza: 'Devedora',
    nivel_hierarquico: 1,
    eh_analitica: true,
    eh_sintetica: false,
    aceita_lancamento_manual: true,
    usa_em_sped: false,
    usa_apenas_gerencial: false,
    ativo: true,
    observacoes: ''
  });
  const [salvando, setSalvando] = useState(false);

  const { data: contas = [] } = useQuery({
    queryKey: ['plano-contas-lookup'],
    queryFn: () => base44.entities.PlanoDeContas.list()
  });

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
          <Label>Código da Conta *</Label>
          <Input
            value={formData.codigo_conta}
            onChange={(e) => setFormData({...formData, codigo_conta: e.target.value})}
            placeholder="Ex: 1.1.1.01"
            required
          />
        </div>
        <div>
          <Label>Nome da Conta *</Label>
          <Input
            value={formData.nome_conta}
            onChange={(e) => setFormData({...formData, nome_conta: e.target.value})}
            placeholder="Nome da conta"
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo da Conta *</Label>
          <Select value={formData.tipo_conta} onValueChange={(val) => setFormData({...formData, tipo_conta: val})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Receita">Receita</SelectItem>
              <SelectItem value="Despesa">Despesa</SelectItem>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Passivo">Passivo</SelectItem>
              <SelectItem value="Patrimônio Líquido">Patrimônio Líquido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Natureza</Label>
          <Select value={formData.natureza} onValueChange={(val) => setFormData({...formData, natureza: val})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Devedora">Devedora</SelectItem>
              <SelectItem value="Credora">Credora</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Conta Pai (hierarquia)</Label>
          <Select value={formData.conta_pai_id || ''} onValueChange={(val) => setFormData({...formData, conta_pai_id: val})}>
            <SelectTrigger>
              <SelectValue placeholder="Nenhuma (raiz)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Nenhuma (raiz)</SelectItem>
              {contas.filter(c => c.id !== conta?.id).map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.codigo_conta} - {c.nome_conta}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Nível Hierárquico</Label>
          <Input
            type="number"
            value={formData.nivel_hierarquico}
            onChange={(e) => setFormData({...formData, nivel_hierarquico: parseInt(e.target.value) || 1})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between">
          <Label>Analítica (aceita lançamentos)</Label>
          <Switch
            checked={formData.eh_analitica}
            onCheckedChange={(val) => setFormData({...formData, eh_analitica: val})}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Sintética (totalizadora)</Label>
          <Switch
            checked={formData.eh_sintetica}
            onCheckedChange={(val) => setFormData({...formData, eh_sintetica: val})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between">
          <Label>Usa em SPED</Label>
          <Switch
            checked={formData.usa_em_sped}
            onCheckedChange={(val) => setFormData({...formData, usa_em_sped: val})}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Apenas Gerencial</Label>
          <Switch
            checked={formData.usa_apenas_gerencial}
            onCheckedChange={(val) => setFormData({...formData, usa_apenas_gerencial: val})}
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
        {salvando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
        {conta ? 'Atualizar Conta' : 'Criar Conta'}
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