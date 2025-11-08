import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function PlanoContasForm({ conta, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(conta || {
    codigo_conta: '',
    descricao_conta: '',
    tipo: 'Despesa',
    natureza: 'Devedora',
    nivel: 1,
    aceita_lancamento: true,
    visivel_dre: true,
    status: 'Ativa'
  });

  const { data: contas = [] } = useQuery({
    queryKey: ['plano-contas'],
    queryFn: () => base44.entities.PlanoDeContas.list(),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.codigo_conta || !formData.descricao_conta) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Código da Conta *</Label>
          <Input
            value={formData.codigo_conta}
            onChange={(e) => setFormData({...formData, codigo_conta: e.target.value})}
            placeholder="Ex: 1.1.01.001"
          />
        </div>
        <div>
          <Label>Nível</Label>
          <Input
            type="number"
            value={formData.nivel}
            onChange={(e) => setFormData({...formData, nivel: parseInt(e.target.value)})}
          />
        </div>
      </div>

      <div>
        <Label>Descrição *</Label>
        <Input
          value={formData.descricao_conta}
          onChange={(e) => setFormData({...formData, descricao_conta: e.target.value})}
          placeholder="Ex: Receita de Vendas, Despesas Administrativas"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo *</Label>
          <Select value={formData.tipo} onValueChange={(v) => setFormData({...formData, tipo: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Passivo">Passivo</SelectItem>
              <SelectItem value="Receita">Receita</SelectItem>
              <SelectItem value="Despesa">Despesa</SelectItem>
              <SelectItem value="Custo">Custo</SelectItem>
              <SelectItem value="Patrimônio Líquido">Patrimônio Líquido</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Natureza *</Label>
          <Select value={formData.natureza} onValueChange={(v) => setFormData({...formData, natureza: v})}>
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

      <div>
        <Label>Conta Superior (Hierarquia)</Label>
        <Select value={formData.conta_superior_id} onValueChange={(v) => setFormData({...formData, conta_superior_id: v})}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione (opcional)" />
          </SelectTrigger>
          <SelectContent>
            {contas.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.codigo_conta} - {c.descricao_conta}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <div>
          <Label>Aceita Lançamentos</Label>
          <p className="text-xs text-slate-500">Contas sintéticas = false</p>
        </div>
        <Switch
          checked={formData.aceita_lancamento}
          onCheckedChange={(v) => setFormData({...formData, aceita_lancamento: v})}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {conta ? 'Atualizar' : 'Criar Conta'}
        </Button>
      </div>
    </form>
  );
}