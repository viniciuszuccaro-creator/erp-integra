import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Webhook, Plus, Send, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

/**
 * V21.6 - Gerenciador de Webhooks
 * Cadastro, teste e monitoramento de webhooks
 */
export default function WebhookManager({ empresaId }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    nome_evento: '',
    modulo_origem: 'Financeiro',
    webhook_externo: {
      ativo: true,
      url: '',
      metodo: 'POST',
      headers: {},
      payload_template: {}
    }
  });

  const queryClient = useQueryClient();

  const { data: webhooks = [] } = useQuery({
    queryKey: ['webhooks', empresaId],
    queryFn: () => base44.entities.EventoNotificacao.filter({
      'webhook_externo.ativo': true
    })
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EventoNotificacao.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      setShowDialog(false);
      toast.success('✅ Webhook criado!');
    }
  });

  const testarWebhookMutation = useMutation({
    mutationFn: async (webhook) => {
      const response = await fetch(webhook.webhook_externo.url, {
        method: webhook.webhook_externo.metodo || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...webhook.webhook_externo.headers
        },
        body: JSON.stringify({
          teste: true,
          evento: webhook.nome_evento,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response;
    },
    onSuccess: () => {
      toast.success('✅ Webhook respondeu com sucesso!');
    },
    onError: (error) => {
      toast.error(`❌ Falha no webhook: ${error.message}`);
    }
  });

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Webhook className="w-8 h-8 text-purple-600" />
              <div>
                <h2 className="text-xl font-bold text-purple-900">Webhooks Configurados</h2>
                <p className="text-sm text-purple-700">Notificações automáticas para sistemas externos</p>
              </div>
            </div>

            <Button onClick={() => setShowDialog(true)} className="bg-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Novo Webhook
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Webhooks */}
      <div className="grid gap-4">
        {webhooks.map(webhook => (
          <Card key={webhook.id} className="border-2 border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-bold">{webhook.nome_evento}</p>
                    <Badge className="bg-blue-600">{webhook.modulo_origem}</Badge>
                    <Badge className={webhook.webhook_externo?.ativo ? 'bg-green-600' : 'bg-slate-600'}>
                      {webhook.webhook_externo?.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-slate-600 mt-2">
                    {webhook.webhook_externo?.metodo} → {webhook.webhook_externo?.url}
                  </p>

                  <div className="flex gap-4 mt-2 text-xs text-slate-500">
                    <span>Disparos: {webhook.total_disparos || 0}</span>
                    <span>Último: {webhook.ultimo_disparo 
                      ? new Date(webhook.ultimo_disparo).toLocaleString('pt-BR')
                      : 'Nunca'}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => testarWebhookMutation.mutate(webhook)}
                  variant="outline"
                  size="sm"
                  disabled={testarWebhookMutation.isPending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Testar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {webhooks.length === 0 && (
          <Card className="border-2 border-slate-200">
            <CardContent className="p-12 text-center text-slate-400">
              <Webhook className="w-16 h-16 mx-auto mb-3" />
              <p>Nenhum webhook configurado</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog Criar Webhook */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Webhook</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Nome do Evento*</Label>
              <Input
                value={formData.nome_evento}
                onChange={(e) => setFormData({ ...formData, nome_evento: e.target.value })}
                placeholder="Ex: pagamento_recebido, entrega_concluida"
              />
            </div>

            <div>
              <Label>Módulo de Origem*</Label>
              <Select
                value={formData.modulo_origem}
                onValueChange={(value) => setFormData({ ...formData, modulo_origem: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Financeiro">Financeiro</SelectItem>
                  <SelectItem value="Comercial">Comercial</SelectItem>
                  <SelectItem value="Expedição">Expedição</SelectItem>
                  <SelectItem value="Fiscal">Fiscal</SelectItem>
                  <SelectItem value="Sistema">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>URL do Webhook*</Label>
              <Input
                value={formData.webhook_externo.url}
                onChange={(e) => setFormData({
                  ...formData,
                  webhook_externo: { ...formData.webhook_externo, url: e.target.value }
                })}
                placeholder="https://seu-sistema.com/webhook"
              />
            </div>

            <div>
              <Label>Método HTTP*</Label>
              <Select
                value={formData.webhook_externo.metodo}
                onValueChange={(value) => setFormData({
                  ...formData,
                  webhook_externo: { ...formData.webhook_externo, metodo: value }
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

            <div className="bg-yellow-50 border border-yellow-300 p-3 rounded">
              <div className="flex gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-xs text-yellow-800">
                  <strong>IA Retry Automático:</strong> Em caso de falha (HTTP 500), o sistema tentará reenviar automaticamente em 5min → 15min → 30min → 1h.
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => createMutation.mutate(formData)}
                disabled={!formData.nome_evento || !formData.webhook_externo.url}
                className="bg-purple-600"
              >
                Criar Webhook
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}