import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, MessageSquare, Send, Zap } from 'lucide-react';
import { toast } from 'sonner';

/**
 * V21.5 - GERENCIADOR DE NOTIFICAÇÕES POR CANAL
 * 
 * Configura notificações automáticas para:
 * ✅ Nova mensagem do cliente
 * ✅ Transbordo de bot para humano
 * ✅ Conversa inativa há X minutos
 * ✅ Cliente insatisfeito detectado
 * ✅ Nova avaliação recebida
 */
export default function NotificacoesCanal({ canalConfig }) {
  const [config, setConfig] = React.useState({
    notificar_nova_mensagem: true,
    notificar_transbordo: true,
    notificar_inatividade: true,
    notificar_insatisfacao: true,
    notificar_avaliacao: true,
    tempo_inatividade_minutos: 30,
    canais_notificacao: ['Email', 'Sistema']
  });

  const salvarMutation = useMutation({
    mutationFn: async () => {
      if (!canalConfig?.id) return;
      
      await base44.entities.ConfiguracaoCanal.update(canalConfig.id, {
        acoes_automaticas: [
          ...(canalConfig.acoes_automaticas || []).filter(a => a.trigger !== 'notificacoes'),
          {
            trigger: 'notificacoes',
            acao: 'enviar_notificacao',
            parametros: config
          }
        ]
      });
    },
    onSuccess: () => {
      toast.success('Notificações configuradas!');
    }
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          Notificações Automáticas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="nova-msg" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Nova mensagem do cliente
          </Label>
          <Switch
            id="nova-msg"
            checked={config.notificar_nova_mensagem}
            onCheckedChange={(checked) => setConfig({ ...config, notificar_nova_mensagem: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="transbordo" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Transbordo para atendente
          </Label>
          <Switch
            id="transbordo"
            checked={config.notificar_transbordo}
            onCheckedChange={(checked) => setConfig({ ...config, notificar_transbordo: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="inatividade">
            Conversa inativa
          </Label>
          <Switch
            id="inatividade"
            checked={config.notificar_inatividade}
            onCheckedChange={(checked) => setConfig({ ...config, notificar_inatividade: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="insatisfacao">
            Cliente insatisfeito (IA)
          </Label>
          <Switch
            id="insatisfacao"
            checked={config.notificar_insatisfacao}
            onCheckedChange={(checked) => setConfig({ ...config, notificar_insatisfacao: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="avaliacao">
            Nova avaliação
          </Label>
          <Switch
            id="avaliacao"
            checked={config.notificar_avaliacao}
            onCheckedChange={(checked) => setConfig({ ...config, notificar_avaliacao: checked })}
          />
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={() => salvarMutation.mutate()}
            disabled={salvarMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Salvar Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}