import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Zap } from 'lucide-react';

export default function ApiExternaForm({ api, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(api || {
    nome_integracao: '',
    tipo_integracao: 'API',
    provedor: '',
    api_url: '',
    ambiente: 'Homologação',
    modo_simulacao: false,
    timeout_segundos: 30,
    max_retries: 3,
    status_conexao: 'Não Testado',
    ativo: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const content = (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
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
          <Label>Provedor</Label>
          <Input
            value={formData.provedor}
            onChange={(e) => setFormData({ ...formData, provedor: e.target.value })}
            placeholder="Asaas, eNotas, Twilio..."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo de Integração *</Label>
          <Select value={formData.tipo_integracao} onValueChange={(v) => setFormData({ ...formData, tipo_integracao: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NF-e">NF-e</SelectItem>
              <SelectItem value="PIX">PIX</SelectItem>
              <SelectItem value="Boleto">Boleto</SelectItem>
              <SelectItem value="Banco">Banco</SelectItem>
              <SelectItem value="WhatsApp">WhatsApp</SelectItem>
              <SelectItem value="Google Maps">Google Maps</SelectItem>
              <SelectItem value="Marketplace">Marketplace</SelectItem>
              <SelectItem value="API">API</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Ambiente</Label>
          <Select value={formData.ambiente} onValueChange={(v) => setFormData({ ...formData, ambiente: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
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
          <Label>Máximo de Tentativas</Label>
          <Input
            type="number"
            value={formData.max_retries}
            onChange={(e) => setFormData({ ...formData, max_retries: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div>
        <Label>Observações</Label>
        <Textarea
          value={formData.observacoes || ''}
          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-3 border rounded">
          <Label>Modo Simulação</Label>
          <Switch
            checked={formData.modo_simulacao}
            onCheckedChange={(v) => setFormData({ ...formData, modo_simulacao: v })}
          />
        </div>
        <div className="flex items-center justify-between p-3 border rounded bg-slate-50">
          <Label className="font-semibold">Ativo</Label>
          <Switch
            checked={formData.ativo}
            onCheckedChange={(v) => setFormData({ ...formData, ativo: v })}
          />
        </div>
      </div>

      <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700">
        {api ? 'Atualizar API' : 'Criar API Externa'}
      </Button>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-cyan-50 to-cyan-100">
          <Zap className="w-6 h-6 text-cyan-600" />
          <h2 className="text-lg font-bold text-slate-900">
            {api ? 'Editar API Externa' : 'Nova API Externa'}
          </h2>
        </div>
        <div className="flex-1 overflow-auto">{content}</div>
      </div>
    );
  }

  return content;
}