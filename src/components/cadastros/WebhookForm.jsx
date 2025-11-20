import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Webhook, CheckCircle2, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function WebhookForm({ webhook, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(webhook || {
    nome_evento: 'pagamento_recebido',
    modulo_origem: 'Financeiro',
    url_destino: '',
    metodo_http: 'POST',
    headers_personalizados: {},
    ativo: true,
    webhook_externo: {
      ativo: true,
      url: '',
      metodo: 'POST',
      headers: {},
      payload_template: {}
    }
  });

  const [testando, setTestando] = useState(false);
  const [resultadoTeste, setResultadoTeste] = useState(null);

  const testarWebhook = async () => {
    setTestando(true);
    
    try {
      // Simular teste de webhook (em produção, chamaria a URL real)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const sucesso = Math.random() > 0.3;
      
      setResultadoTeste({
        sucesso,
        mensagem: sucesso ? '✅ Webhook respondeu com 200 OK' : '❌ Erro 500 - Timeout',
        timestamp: new Date().toLocaleString('pt-BR')
      });
      
      if (sucesso) {
        toast.success('✅ Webhook testado com sucesso!');
      } else {
        toast.error('❌ Falha ao testar webhook');
      }
    } catch (error) {
      toast.error('Erro ao testar');
    } finally {
      setTestando(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome_evento || !formData.webhook_externo?.url) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    onSubmit(formData);
  };

  const eventosDisponiveis = [
    'pagamento_recebido',
    'entrega_saiu',
    'pedido_aprovado',
    'nfe_emitida',
    'producao_iniciada',
    'estoque_baixo'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Evento Trigger *</Label>
        <Select value={formData.nome_evento} onValueChange={(v) => setFormData({...formData, nome_evento: v})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {eventosDisponiveis.map(evt => (
              <SelectItem key={evt} value={evt}>{evt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>URL de Destino *</Label>
        <Input
          value={formData.webhook_externo?.url}
          onChange={(e) => setFormData({
            ...formData,
            webhook_externo: {...formData.webhook_externo, url: e.target.value}
          })}
          placeholder="https://api.externa.com/webhook"
        />
      </div>

      <div>
        <Label>Método HTTP</Label>
        <Select 
          value={formData.webhook_externo?.metodo} 
          onValueChange={(v) => setFormData({
            ...formData,
            webhook_externo: {...formData.webhook_externo, metodo: v}
          })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Webhook Ativo</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(v) => setFormData({...formData, ativo: v})}
        />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={testarWebhook}
        disabled={testando || !formData.webhook_externo?.url}
      >
        {testando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
        Testar Webhook
      </Button>

      {resultadoTeste && (
        <Alert className={resultadoTeste.sucesso ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <AlertDescription className="text-sm">
            {resultadoTeste.sucesso ? <CheckCircle2 className="w-4 h-4 inline mr-2" /> : <AlertTriangle className="w-4 h-4 inline mr-2" />}
            {resultadoTeste.mensagem}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {webhook ? 'Atualizar' : 'Criar Webhook'}
        </Button>
      </div>
    </form>
  );
}