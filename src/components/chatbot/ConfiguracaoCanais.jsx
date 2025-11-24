import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageCircle,
  Instagram,
  Send as Telegram,
  Mail,
  Globe,
  Settings,
  CheckCircle,
  AlertCircle,
  Smartphone
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import RoteamentoInteligente from "./RoteamentoInteligente";
import NotificacoesCanal from "./NotificacoesCanal";
import AutomacaoFluxos from "./AutomacaoFluxos";
import BaseConhecimento from "./BaseConhecimento";
import WebhooksTester from "./WebhooksTester";

/**
 * V21.5 - CONFIGURAÇÃO DE CANAIS OMNICANAL
 * 
 * Interface para configurar todos os canais de comunicação
 */
export default function ConfiguracaoCanais() {
  const queryClient = useQueryClient();
  const { empresaAtual } = useContextoVisual();
  const [canalSelecionado, setCanalSelecionado] = useState("WhatsApp");

  const canais = [
    { nome: "WhatsApp", icon: MessageCircle, cor: "green" },
    { nome: "Instagram", icon: Instagram, cor: "pink" },
    { nome: "Facebook", icon: MessageCircle, cor: "blue" },
    { nome: "Telegram", icon: Telegram, cor: "sky" },
    { nome: "Email", icon: Mail, cor: "slate" },
    { nome: "WebChat", icon: Globe, cor: "purple" },
    { nome: "Portal", icon: Smartphone, cor: "indigo" }
  ];

  // Buscar configurações
  const { data: configs = [] } = useQuery({
    queryKey: ['config-canais', empresaAtual?.id],
    queryFn: async () => {
      return await base44.entities.ConfiguracaoCanal.filter({
        empresa_id: empresaAtual?.id
      });
    },
    enabled: !!empresaAtual
  });

  const configAtual = configs.find(c => c.canal === canalSelecionado);

  // Salvar configuração
  const salvarConfigMutation = useMutation({
    mutationFn: async (dados) => {
      if (configAtual) {
        return await base44.entities.ConfiguracaoCanal.update(configAtual.id, dados);
      } else {
        return await base44.entities.ConfiguracaoCanal.create({
          ...dados,
          empresa_id: empresaAtual?.id,
          canal: canalSelecionado
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config-canais'] });
      toast.success("Configuração salva!");
    }
  });

  return (
    <div className="w-full h-full overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Cards de Status dos Canais */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {canais.map((canal) => {
            const config = configs.find(c => c.canal === canal.nome);
            const Icon = canal.icon;
            
            return (
              <Card
                key={canal.nome}
                className={`cursor-pointer transition-all ${
                  canalSelecionado === canal.nome ? 'ring-2 ring-blue-600' : ''
                }`}
                onClick={() => setCanalSelecionado(canal.nome)}
              >
                <CardContent className="p-4 text-center">
                  <Icon className={`w-8 h-8 mx-auto mb-2 text-${canal.cor}-600`} />
                  <p className="text-sm font-semibold mb-1">{canal.nome}</p>
                  {config?.ativo ? (
                    <Badge className="bg-green-600 text-xs">Ativo</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">Inativo</Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Grid: Config + Recursos Avançados */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Configuração Básica */}
          <Card className="lg:col-span-2">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurar {canalSelecionado}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ConfiguracaoCanalForm
                canal={canalSelecionado}
                config={configAtual}
                onSave={(dados) => salvarConfigMutation.mutate(dados)}
                isSaving={salvarConfigMutation.isPending}
              />
            </CardContent>
          </Card>

          {/* Recursos Avançados */}
          <div className="space-y-4">
            <RoteamentoInteligente canalConfig={configAtual} />
            <NotificacoesCanal canalConfig={configAtual} />
          </div>
        </div>

        {/* Automações e Base de Conhecimento */}
        <div className="grid md:grid-cols-2 gap-6">
          <AutomacaoFluxos canalConfig={configAtual} />
          <BaseConhecimento />
        </div>

        {/* Testador de Webhooks */}
        <WebhooksTester canalConfig={configAtual} />
      </div>
    </div>
  );
}

function ConfiguracaoCanalForm({ canal, config, onSave, isSaving }) {
  const [formData, setFormData] = useState({
    ativo: config?.ativo || false,
    modo_atendimento: config?.modo_atendimento || 'Bot com Transbordo',
    mensagem_boas_vindas: config?.mensagem_boas_vindas || '',
    mensagem_ausencia: config?.mensagem_ausencia || '',
    tempo_timeout_minutos: config?.tempo_timeout_minutos || 30,
    ...config
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Ativar/Desativar */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
        <div>
          <Label className="text-base font-semibold">Canal Ativo</Label>
          <p className="text-sm text-slate-600">Habilitar atendimento neste canal</p>
        </div>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
        />
      </div>

      {/* Modo de Atendimento */}
      <div>
        <Label>Modo de Atendimento</Label>
        <select
          value={formData.modo_atendimento}
          onChange={(e) => setFormData({ ...formData, modo_atendimento: e.target.value })}
          className="w-full px-3 py-2 border rounded-md mt-1"
        >
          <option value="Apenas Bot">Apenas Bot</option>
          <option value="Bot com Transbordo">Bot com Transbordo (Recomendado)</option>
          <option value="Apenas Humano">Apenas Humano</option>
          <option value="Híbrido">Híbrido</option>
        </select>
        <p className="text-xs text-slate-500 mt-1">
          {formData.modo_atendimento === 'Bot com Transbordo' && 
            'Bot atende primeiro, transfere para humano quando necessário'}
        </p>
      </div>

      {/* Mensagens Automáticas */}
      <div>
        <Label>Mensagem de Boas-Vindas</Label>
        <Input
          value={formData.mensagem_boas_vindas}
          onChange={(e) => setFormData({ ...formData, mensagem_boas_vindas: e.target.value })}
          placeholder="Olá! Como posso ajudar?"
          className="mt-1"
        />
      </div>

      <div>
        <Label>Mensagem Fora de Horário</Label>
        <Input
          value={formData.mensagem_ausencia}
          onChange={(e) => setFormData({ ...formData, mensagem_ausencia: e.target.value })}
          placeholder="Estamos fora do horário de atendimento..."
          className="mt-1"
        />
      </div>

      {/* Timeout */}
      <div>
        <Label>Tempo de Timeout (minutos)</Label>
        <Input
          type="number"
          value={formData.tempo_timeout_minutos}
          onChange={(e) => setFormData({ ...formData, tempo_timeout_minutos: parseInt(e.target.value) })}
          className="mt-1"
        />
        <p className="text-xs text-slate-500 mt-1">
          Conversa será marcada como inativa após este período sem mensagens
        </p>
      </div>

      {/* Credenciais - Campos específicos por canal */}
      {canal === 'WhatsApp' && (
        <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-900">Credenciais WhatsApp Business API</h3>
          <Alert>
            <AlertDescription className="text-sm">
              ⚠️ Integração bidirecional requer <strong>Backend Functions habilitadas</strong>
            </AlertDescription>
          </Alert>
          
          <div>
            <Label>Token de Acesso</Label>
            <Input
              type="password"
              placeholder="EAAxxxxxxxxxxxx"
              className="mt-1"
              disabled
            />
            <p className="text-xs text-slate-500 mt-1">Disponível com Backend Functions</p>
          </div>
        </div>
      )}

      {/* Botão Salvar */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Salvando...' : 'Salvar Configuração'}
        </Button>
      </div>
    </form>
  );
}