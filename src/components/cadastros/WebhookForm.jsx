import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link2, Loader2 } from 'lucide-react';

export default function WebhookForm({ webhook, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(webhook || {
    nome_webhook: '',
    descricao: '',
    evento_gatilho: 'pedido_aprovado',
    url_destino: '',
    metodo_http: 'POST',
    formato_payload: 'JSON',
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
        <Label>Nome do Webhook *</Label>
        <Input
          value={formData.nome_webhook}
          onChange={(e) => setFormData({...formData, nome_webhook: e.target.value})}
          placeholder="Ex: Webhook Pagamento Aprovado"
          required
        />
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
          <Label>Evento Gatilho</Label>
          <Select value={formData.evento_gatilho} onValueChange={(val) => setFormData({...formData, evento_gatilho: val})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pagamento_recebido">Pagamento Recebido</SelectItem>
              <SelectItem value="pedido_aprovado">Pedido Aprovado</SelectItem>
              <SelectItem value="pedido_faturado">Pedido Faturado</SelectItem>
              <SelectItem value="entrega_enviada">Entrega Enviada</SelectItem>
              <SelectItem value="entrega_concluida">Entrega Concluída</SelectItem>
              <SelectItem value="nfe_autorizada">NF-e Autorizada</SelectItem>
              <SelectItem value="nfe_cancelada">NF-e Cancelada</SelectItem>
              <SelectItem value="conta_vencida">Conta Vencida</SelectItem>
              <SelectItem value="estoque_baixo">Estoque Baixo</SelectItem>
              <SelectItem value="producao_concluida">Produção Concluída</SelectItem>
              <SelectItem value="cliente_cadastrado">Cliente Cadastrado</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Método HTTP</Label>
          <Select value={formData.metodo_http} onValueChange={(val) => setFormData({...formData, metodo_http: val})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="GET">GET</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>URL de Destino *</Label>
        <Input
          value={formData.url_destino}
          onChange={(e) => setFormData({...formData, url_destino: e.target.value})}
          placeholder="https://api.exemplo.com/webhook"
          required
        />
      </div>

      <div>
        <Label>Formato do Payload</Label>
        <Select value={formData.formato_payload} onValueChange={(val) => setFormData({...formData, formato_payload: val})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="JSON">JSON</SelectItem>
            <SelectItem value="XML">XML</SelectItem>
            <SelectItem value="Form-Data">Form-Data</SelectItem>
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
        {salvando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Link2 className="w-4 h-4 mr-2" />}
        {webhook ? 'Atualizar Webhook' : 'Criar Webhook'}
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