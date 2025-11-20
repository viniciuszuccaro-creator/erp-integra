import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Zap } from 'lucide-react';

export default function ApiExternaForm({ api, onSubmit, windowMode }) {
  const [formData, setFormData] = useState(api || {
    nome_integracao: '',
    tipo_integracao: 'Outro',
    provedor: '',
    api_url: '',
    ambiente: 'Homologação',
    modo_simulacao: false,
    timeout_segundos: 30,
    max_retries: 3,
    ativo: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome_integracao || !formData.tipo_integracao) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    onSubmit?.(formData);
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nome da Integração *</Label>
          <Input
            value={formData.nome_integracao}
            onChange={(e) => setFormData({ ...formData, nome_integracao: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Tipo *</Label>
          <Select value={formData.tipo_integracao} onValueChange={(val) => setFormData({ ...formData, tipo_integracao: val })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="NF-e">NF-e</SelectItem>
              <SelectItem value="PIX">PIX</SelectItem>
              <SelectItem value="Boleto">Boleto</SelectItem>
              <SelectItem value="Banco">Banco</SelectItem>
              <SelectItem value="WhatsApp">WhatsApp</SelectItem>
              <SelectItem value="E-mail">E-mail</SelectItem>
              <SelectItem value="Google Maps">Google Maps</SelectItem>
              <SelectItem value="Marketplace">Marketplace</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Provedor</Label>
          <Input
            value={formData.provedor}
            onChange={(e) => setFormData({ ...formData, provedor: e.target.value })}
            placeholder="Ex: Asaas, eNotas"
          />
        </div>
        <div>
          <Label>Ambiente</Label>
          <Select value={formData.ambiente} onValueChange={(val) => setFormData({ ...formData, ambiente: val })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Produção">Produção</SelectItem>
              <SelectItem value="Homologação">Homologação</SelectItem>
              <SelectItem value="Sandbox">Sandbox</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>URL da API</Label>
        <Input
          type="url"
          value={formData.api_url}
          onChange={(e) => setFormData({ ...formData, api_url: e.target.value })}
          placeholder="https://api.exemplo.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Timeout (segundos)</Label>
          <Input
            type="number"
            value={formData.timeout_segundos}
            onChange={(e) => setFormData({ ...formData, timeout_segundos: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <Label>Máx. Tentativas</Label>
          <Input
            type="number"
            value={formData.max_retries}
            onChange={(e) => setFormData({ ...formData, max_retries: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Modo Simulação</Label>
        <Switch
          checked={formData.modo_simulacao}
          onCheckedChange={(val) => setFormData({ ...formData, modo_simulacao: val })}
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Ativo</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(val) => setFormData({ ...formData, ativo: val })}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          {api ? 'Atualizar' : 'Criar API'}
        </Button>
      </div>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="border-b p-4 bg-gradient-to-r from-blue-50 to-cyan-50">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600" />
            {api ? 'Editar API Externa' : 'Nova API Externa'}
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