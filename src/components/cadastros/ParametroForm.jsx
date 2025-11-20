import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function ParametroForm({ tipo, parametro, onSubmit, windowMode }) {
  const [formData, setFormData] = useState(parametro || {});

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list()
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  const renderFormByType = () => {
    switch (tipo) {
      case 'PortalCliente':
        return (
          <div className="space-y-4">
            <div>
              <Label>Empresa *</Label>
              <Select value={formData.empresa_id} onValueChange={(val) => setFormData({ ...formData, empresa_id: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {empresas.map(e => <SelectItem key={e.id} value={e.id}>{e.nome_fantasia}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <Label>Portal Ativo</Label>
              <Switch checked={formData.portal_ativo} onCheckedChange={(val) => setFormData({ ...formData, portal_ativo: val })} />
            </div>
            <div>
              <Label>Cor Primária (Hex)</Label>
              <Input value={formData.cor_primaria} onChange={(e) => setFormData({ ...formData, cor_primaria: e.target.value })} placeholder="#3b82f6" />
            </div>
          </div>
        );

      case 'RecebimentoNFe':
        return (
          <div className="space-y-4">
            <div>
              <Label>Empresa *</Label>
              <Select value={formData.empresa_id} onValueChange={(val) => setFormData({ ...formData, empresa_id: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {empresas.map(e => <SelectItem key={e.id} value={e.id}>{e.nome_fantasia}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <Label>Cadastro Automático de Produto</Label>
              <Switch checked={formData.sugerir_cadastro_automatico_produto !== false} onCheckedChange={(val) => setFormData({ ...formData, sugerir_cadastro_automatico_produto: val })} />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <Label>Usar IA para Classificação</Label>
              <Switch checked={formData.usar_ia_para_classificacao !== false} onCheckedChange={(val) => setFormData({ ...formData, usar_ia_para_classificacao: val })} />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <Label>Empresa *</Label>
              <Select value={formData.empresa_id} onValueChange={(val) => setFormData({ ...formData, empresa_id: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {empresas.map(e => <SelectItem key={e.id} value={e.id}>{e.nome_fantasia}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} />
            </div>
          </div>
        );
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {renderFormByType()}
      <div className="flex justify-end pt-4">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          {parametro ? 'Atualizar' : 'Criar Parâmetro'}
        </Button>
      </div>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="border-b p-4 bg-gradient-to-r from-blue-50 to-cyan-50">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            {parametro ? 'Editar Parâmetro' : 'Novo Parâmetro'}
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