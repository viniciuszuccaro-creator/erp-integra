import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Loader2, TestTube } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ApiExternaForm({ apiExterna, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(apiExterna || {
    nome_integracao: '',
    tipo_integracao: 'Outro',
    provedor: '',
    api_url: '',
    api_key: '',
    api_token: '',
    ambiente: 'Homologação',
    modo_simulacao: false,
    timeout_segundos: 30,
    max_retries: 3,
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
          <Label>Nome da Integração *</Label>
          <Input
            value={formData.nome_integracao}
            onChange={(e) => setFormData({...formData, nome_integracao: e.target.value})}
            required
          />
        </div>
        <div>
          <Label>Provedor</Label>
          <Input
            value={formData.provedor}
            onChange={(e) => setFormData({...formData, provedor: e.target.value})}
            placeholder="Ex: Asaas, eNotas, Twilio"
          />
        </div>
      </div>

      <div>
        <Label>Tipo de Integração</Label>
        <Select value={formData.tipo_integracao} onValueChange={(val) => setFormData({...formData, tipo_integracao: val})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NF-e">NF-e</SelectItem>
            <SelectItem value="PIX">PIX</SelectItem>
            <SelectItem value="Boleto">Boleto</SelectItem>
            <SelectItem value="Banco">Banco</SelectItem>
            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
            <SelectItem value="SMS">SMS</SelectItem>
            <SelectItem value="E-mail">E-mail</SelectItem>
            <SelectItem value="Google Maps">Google Maps</SelectItem>
            <SelectItem value="Marketplace">Marketplace</SelectItem>
            <SelectItem value="E-commerce">E-commerce</SelectItem>
            <SelectItem value="ERP Externo">ERP Externo</SelectItem>
            <SelectItem value="Contabilidade">Contabilidade</SelectItem>
            <SelectItem value="BI">BI</SelectItem>
            <SelectItem value="Rastreamento">Rastreamento</SelectItem>
            <SelectItem value="Outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>URL da API</Label>
        <Input
          value={formData.api_url}
          onChange={(e) => setFormData({...formData, api_url: e.target.value})}
          placeholder="https://api.exemplo.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>API Key</Label>
          <Input
            type="password"
            value={formData.api_key}
            onChange={(e) => setFormData({...formData, api_key: e.target.value})}
          />
        </div>
        <div>
          <Label>API Token</Label>
          <Input
            type="password"
            value={formData.api_token}
            onChange={(e) => setFormData({...formData, api_token: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Ambiente</Label>
          <Select value={formData.ambiente} onValueChange={(val) => setFormData({...formData, ambiente: val})}>
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
        <div>
          <Label>Timeout (s)</Label>
          <Input
            type="number"
            value={formData.timeout_segundos}
            onChange={(e) => setFormData({...formData, timeout_segundos: parseInt(e.target.value) || 30})}
          />
        </div>
        <div>
          <Label>Max Retries</Label>
          <Input
            type="number"
            value={formData.max_retries}
            onChange={(e) => setFormData({...formData, max_retries: parseInt(e.target.value) || 3})}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label>Modo Simulação</Label>
        <Switch
          checked={formData.modo_simulacao}
          onCheckedChange={(val) => setFormData({...formData, modo_simulacao: val})}
        />
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

      {apiExterna && (
        <div className="bg-slate-50 p-4 rounded-lg">
          <p className="text-sm font-semibold text-slate-700 mb-2">Status da Conexão</p>
          <div className="flex items-center gap-2">
            <Badge className={
              apiExterna.status_conexao === 'Conectado' ? 'bg-green-600' :
              apiExterna.status_conexao === 'Erro' ? 'bg-red-600' : 'bg-gray-600'
            }>
              {apiExterna.status_conexao || 'Não Testado'}
            </Badge>
            {apiExterna.taxa_sucesso !== undefined && (
              <span className="text-xs text-slate-600">Taxa de Sucesso: {apiExterna.taxa_sucesso}%</span>
            )}
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={salvando}>
        {salvando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
        {apiExterna ? 'Atualizar API Externa' : 'Criar API Externa'}
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