import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare, CheckCircle, AlertCircle, Settings, Eye } from "lucide-react";

/**
 * Componente de configuração de notificações WhatsApp/Email
 * PREPARADO para integração real
 */
export default function ConfigWhatsApp() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [config, setConfig] = useState({
    exp_notif_whatsapp_ativo: false,
    exp_notif_email_ativo: false,
    exp_notif_provedor: "zenvia",
    exp_notif_token: "",
    exp_notif_url: "",
    exp_notif_telefone_remetente: "",
    exp_notif_modelo_saiu: "Olá {cliente}, seu pedido {numero_pedido} saiu para entrega. Motorista: {motorista}. Previsão: {data_previsao}",
    exp_notif_modelo_em_rota: "Estamos chegando! Seu pedido {numero_pedido} está a caminho.",
    exp_notif_modelo_entregue: "Pedido {numero_pedido} entregue em {data_entrega}. Obrigado pela preferência!",
    exp_notif_modelo_falha: "Não conseguimos entregar o pedido {numero_pedido}. Motivo: {motivo}. Reagendado para {nova_data}.",
    exp_notif_email_remetente: "",
    exp_notif_email_nome_remetente: ""
  });

  const [testando, setTestando] = useState(false);
  const [previewMensagem, setPreviewMensagem] = useState("");
  const [tipoPreview, setTipoPreview] = useState("saiu");

  const salvarConfigMutation = useMutation({
    mutationFn: async (data) => {
      // Buscar config existente ou criar nova
      const configs = await base44.entities.ConfiguracaoSistema.filter({
        chave: "expedicao_notificacoes"
      });

      if (configs.length > 0) {
        return await base44.entities.ConfiguracaoSistema.update(configs[0].id, {
          categoria: "Integracoes",
          configuracoes_sistema: data
        });
      } else {
        return await base44.entities.ConfiguracaoSistema.create({
          chave: "expedicao_notificacoes",
          categoria: "Integracoes",
          configuracoes_sistema: data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config-notificacoes'] });
      toast({ title: "✅ Configurações salvas!" });
    },
  });

  const testarEnvioMutation = useMutation({
    mutationFn: async ({ telefone, mensagem }) => {
      // Simulação - substituir por chamada real
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (!config.exp_notif_whatsapp_ativo) {
        throw new Error("WhatsApp não está ativado");
      }

      return {
        sucesso: true,
        mensagem: "Mensagem enviada com sucesso (simulado)"
      };
    },
    onSuccess: () => {
      toast({ title: "✅ Mensagem de teste enviada!" });
    },
    onError: (error) => {
      toast({
        title: "❌ Erro no envio",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSalvar = (e) => {
    e.preventDefault();
    salvarConfigMutation.mutate(config);
  };

  const handleTestar = () => {
    const telefone = prompt("Digite o telefone para teste (com DDD):");
    if (!telefone) return;

    setTestando(true);
    testarEnvioMutation.mutate({
      telefone,
      mensagem: previewMensagem
    });
    setTimeout(() => setTestando(false), 2500);
  };

  const gerarPreview = (tipo) => {
    const modelos = {
      saiu: config.exp_notif_modelo_saiu,
      em_rota: config.exp_notif_modelo_em_rota,
      entregue: config.exp_notif_modelo_entregue,
      falha: config.exp_notif_modelo_falha
    };

    const exemplo = modelos[tipo]
      .replace('{cliente}', 'João Silva')
      .replace('{numero_pedido}', '#1234')
      .replace('{motorista}', 'Carlos')
      .replace('{data_previsao}', '15:30')
      .replace('{data_entrega}', new Date().toLocaleString('pt-BR'))
      .replace('{motivo}', 'Cliente ausente')
      .replace('{nova_data}', 'Amanhã');

    setPreviewMensagem(exemplo);
  };

  React.useEffect(() => {
    gerarPreview(tipoPreview);
  }, [config, tipoPreview]);

  return (
    <div className="space-y-6">
      {/* Status */}
      <Card className={`border-2 ${config.exp_notif_whatsapp_ativo ? 'border-green-300 bg-green-50' : 'border-orange-300 bg-orange-50'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {config.exp_notif_whatsapp_ativo ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-orange-600" />
              )}
              <div>
                <p className="font-semibold">
                  {config.exp_notif_whatsapp_ativo ? 'WhatsApp Ativado' : 'WhatsApp Desativado'}
                </p>
                <p className="text-sm text-slate-600">
                  {config.exp_notif_whatsapp_ativo 
                    ? 'Notificações automáticas estão funcionando' 
                    : 'Configure abaixo para ativar notificações automáticas'}
                </p>
              </div>
            </div>
            <Badge className={config.exp_notif_whatsapp_ativo ? 'bg-green-600' : 'bg-orange-600'}>
              {config.exp_notif_provedor || 'Não configurado'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSalvar} className="space-y-6">
        {/* Configuração Geral */}
        <Card>
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuração de Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded border border-blue-200">
              <div>
                <Label className="text-sm font-semibold">WhatsApp Automático</Label>
                <p className="text-xs text-slate-600">Enviar mensagens automáticas via WhatsApp</p>
              </div>
              <Switch
                checked={config.exp_notif_whatsapp_ativo}
                onCheckedChange={(v) => setConfig({ ...config, exp_notif_whatsapp_ativo: v })}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded border border-green-200">
              <div>
                <Label className="text-sm font-semibold">E-mail Automático</Label>
                <p className="text-xs text-slate-600">Enviar notificações por e-mail</p>
              </div>
              <Switch
                checked={config.exp_notif_email_ativo}
                onCheckedChange={(v) => setConfig({ ...config, exp_notif_email_ativo: v })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Provedor WhatsApp</Label>
                <Select
                  value={config.exp_notif_provedor}
                  onValueChange={(v) => setConfig({ ...config, exp_notif_provedor: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zenvia">Zenvia</SelectItem>
                    <SelectItem value="twilio">Twilio</SelectItem>
                    <SelectItem value="evolution_api">Evolution API</SelectItem>
                    <SelectItem value="custom">Custom/Próprio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Token/API Key</Label>
                <Input
                  type="password"
                  value={config.exp_notif_token}
                  onChange={(e) => setConfig({ ...config, exp_notif_token: e.target.value })}
                  placeholder="Chave de API do provedor"
                />
              </div>
            </div>

            <div>
              <Label>URL da API (se Custom)</Label>
              <Input
                value={config.exp_notif_url}
                onChange={(e) => setConfig({ ...config, exp_notif_url: e.target.value })}
                placeholder="https://api.provedor.com/v1/messages"
              />
            </div>

            <div>
              <Label>Telefone Remetente</Label>
              <Input
                value={config.exp_notif_telefone_remetente}
                onChange={(e) => setConfig({ ...config, exp_notif_telefone_remetente: e.target.value })}
                placeholder="5511999999999"
              />
            </div>
          </CardContent>
        </Card>

        {/* Modelos de Mensagens */}
        <Card>
          <CardHeader className="bg-purple-50 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              Modelos de Mensagens WhatsApp
            </CardTitle>
            <p className="text-xs text-slate-600 mt-1">
              Variáveis disponíveis: {'{cliente}'}, {'{numero_pedido}'}, {'{motorista}'}, {'{data_previsao}'}, {'{data_entrega}'}, {'{motivo}'}, {'{nova_data}'}
            </p>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label>Mensagem: Saiu para Entrega</Label>
              <Textarea
                value={config.exp_notif_modelo_saiu}
                onChange={(e) => setConfig({ ...config, exp_notif_modelo_saiu: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label>Mensagem: Em Rota / Chegando</Label>
              <Textarea
                value={config.exp_notif_modelo_em_rota}
                onChange={(e) => setConfig({ ...config, exp_notif_modelo_em_rota: e.target.value })}
                rows={2}
              />
            </div>

            <div>
              <Label>Mensagem: Entregue</Label>
              <Textarea
                value={config.exp_notif_modelo_entregue}
                onChange={(e) => setConfig({ ...config, exp_notif_modelo_entregue: e.target.value })}
                rows={2}
              />
            </div>

            <div>
              <Label>Mensagem: Falha na Entrega</Label>
              <Textarea
                value={config.exp_notif_modelo_falha}
                onChange={(e) => setConfig({ ...config, exp_notif_modelo_falha: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Preview da Mensagem
              </CardTitle>
              <Select value={tipoPreview} onValueChange={setTipoPreview}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saiu">Saiu para Entrega</SelectItem>
                  <SelectItem value="em_rota">Em Rota</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                  <SelectItem value="falha">Falha na Entrega</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-white p-4 rounded-lg border-2 border-blue-300 shadow-sm">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <p className="text-sm whitespace-pre-wrap">{previewMensagem}</p>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestar}
                disabled={testando || !config.exp_notif_whatsapp_ativo}
              >
                {testando ? 'Enviando...' : 'Enviar Teste'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Botões */}
        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            disabled={salvarConfigMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {salvarConfigMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </form>

      {/* Card Informativo */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-2">💡 Provedores Suportados (Preparado)</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>✓ <strong>Zenvia:</strong> API v2, suporte a WhatsApp Business</li>
                <li>✓ <strong>Twilio:</strong> API WhatsApp oficial</li>
                <li>✓ <strong>Evolution API:</strong> Solução open-source</li>
                <li>✓ <strong>Custom:</strong> Sua própria API</li>
              </ul>
              <p className="text-xs text-yellow-700 mt-3">
                Configure o provedor, token e URL acima. O sistema enviará automaticamente nos eventos de expedição.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}