import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Truck, MessageCircle, Mail, MapPin, Settings } from "lucide-react";

/**
 * Configuração de Integrações de Expedição
 */
export default function ConfiguracaoExpedicao({ empresaId }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: config } = useQuery({
    queryKey: ['config-expedicao', empresaId],
    queryFn: async () => {
      const configs = await base44.entities.ConfiguracaoSistema.filter({
        chave: `expedicao_${empresaId}`,
        categoria: "Integracoes"
      });
      return configs[0] || null;
    },
  });

  const [configTransportadora, setConfigTransportadora] = useState({
    provider: "Nenhum",
    api_url: "",
    api_token: "",
    calcular_frete_auto: false,
    enviar_rastreamento_auto: false
  });

  const [configWhatsApp, setConfigWhatsApp] = useState({
    provider: "Nenhum",
    api_url: "",
    api_token: "",
    enviar_auto: false,
    modelo_saida: "Seu pedido {{numero_pedido}} saiu para entrega. Previsão: {{data_prevista}}.",
    modelo_entregue: "Seu pedido {{numero_pedido}} foi entregue. Obrigado!",
    modelo_frustrada: "Tentativa de entrega do pedido {{numero_pedido}} não concluída. Motivo: {{motivo}}"
  });

  const [configEmail, setConfigEmail] = useState({
    enviar_auto: false,
    assunto_saida: "Seu pedido saiu para entrega",
    assunto_entregue: "Pedido entregue",
    corpo_saida: "",
    corpo_entregue: ""
  });

  const salvarMutation = useMutation({
    mutationFn: async () => {
      const dadosConfig = {
        chave: `expedicao_${empresaId}`,
        categoria: "Integracoes",
        integracao_transportadoras: configTransportadora,
        integracao_whatsapp: configWhatsApp,
        configuracoes_email: configEmail
      };

      if (config) {
        return await base44.entities.ConfiguracaoSistema.update(config.id, dadosConfig);
      } else {
        return await base44.entities.ConfiguracaoSistema.create(dadosConfig);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config-expedicao'] });
      toast({ title: "✅ Configurações salvas!" });
    },
  });

  return (
    <div className="space-y-6">
      <Tabs defaultValue="transportadora">
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="transportadora">
            <Truck className="w-4 h-4 mr-2" />
            Transportadoras
          </TabsTrigger>
          <TabsTrigger value="whatsapp">
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="w-4 h-4 mr-2" />
            E-mail
          </TabsTrigger>
          <TabsTrigger value="geral">
            <Settings className="w-4 h-4 mr-2" />
            Geral
          </TabsTrigger>
        </TabsList>

        {/* TAB: Transportadora */}
        <TabsContent value="transportadora" className="space-y-4">
          <Card>
            <CardHeader className="bg-blue-50 border-b">
              <CardTitle className="text-base">Integração com Transportadoras</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>Provedor</Label>
                <Select
                  value={configTransportadora.provider}
                  onValueChange={(v) => setConfigTransportadora({ ...configTransportadora, provider: v })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nenhum">Nenhum</SelectItem>
                    <SelectItem value="Melhor Envio">Melhor Envio</SelectItem>
                    <SelectItem value="Kangu">Kangu</SelectItem>
                    <SelectItem value="Correios">Correios (API)</SelectItem>
                    <SelectItem value="Jadlog">Jadlog</SelectItem>
                    <SelectItem value="Custom">Custom API</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {configTransportadora.provider !== "Nenhum" && (
                <>
                  <div>
                    <Label>URL da API</Label>
                    <Input
                      value={configTransportadora.api_url}
                      onChange={(e) => setConfigTransportadora({ ...configTransportadora, api_url: e.target.value })}
                      placeholder="https://api.melhorenvio.com/..."
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>API Token/Key</Label>
                    <Input
                      type="password"
                      value={configTransportadora.api_token}
                      onChange={(e) => setConfigTransportadora({ ...configTransportadora, api_token: e.target.value })}
                      placeholder="Seu token de API"
                      className="mt-2"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-3">
                    <input
                      type="checkbox"
                      id="calc-frete"
                      checked={configTransportadora.calcular_frete_auto}
                      onChange={(e) => setConfigTransportadora({ ...configTransportadora, calcular_frete_auto: e.target.checked })}
                    />
                    <label htmlFor="calc-frete" className="text-sm">
                      Calcular frete automaticamente ao criar entrega
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="rastreamento"
                      checked={configTransportadora.enviar_rastreamento_auto}
                      onChange={(e) => setConfigTransportadora({ ...configTransportadora, enviar_rastreamento_auto: e.target.checked })}
                    />
                    <label htmlFor="rastreamento" className="text-sm">
                      Enviar código de rastreamento para o cliente
                    </label>
                  </div>
                </>
              )}

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                ⚠️ <strong>Atenção:</strong> As integrações estão preparadas mas ainda não implementadas.
                Configure agora e elas serão ativadas em atualizações futuras.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: WhatsApp */}
        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader className="bg-green-50 border-b">
              <CardTitle className="text-base">Integração WhatsApp</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>Provedor WhatsApp</Label>
                <Select
                  value={configWhatsApp.provider}
                  onValueChange={(v) => setConfigWhatsApp({ ...configWhatsApp, provider: v })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nenhum">Nenhum</SelectItem>
                    <SelectItem value="Twilio">Twilio</SelectItem>
                    <SelectItem value="Zenvia">Zenvia</SelectItem>
                    <SelectItem value="Evolution API">Evolution API</SelectItem>
                    <SelectItem value="Custom">Custom API</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {configWhatsApp.provider !== "Nenhum" && (
                <>
                  <div>
                    <Label>URL da API</Label>
                    <Input
                      value={configWhatsApp.api_url}
                      onChange={(e) => setConfigWhatsApp({ ...configWhatsApp, api_url: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>API Token</Label>
                    <Input
                      type="password"
                      value={configWhatsApp.api_token}
                      onChange={(e) => setConfigWhatsApp({ ...configWhatsApp, api_token: e.target.value })}
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-3 pt-4">
                    <h4 className="font-semibold text-sm">Modelos de Mensagens</h4>
                    
                    <div>
                      <Label>Saída para Entrega</Label>
                      <Textarea
                        value={configWhatsApp.modelo_saida}
                        onChange={(e) => setConfigWhatsApp({ ...configWhatsApp, modelo_saida: e.target.value })}
                        rows={2}
                        className="mt-2"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Variáveis: {'{'}{'{'}<span className="font-mono">numero_pedido</span>{'}'}{'}'},  {'{'}{'{'}<span className="font-mono">data_prevista</span>{'}'}{'}'}
                      </p>
                    </div>

                    <div>
                      <Label>Entrega Concluída</Label>
                      <Textarea
                        value={configWhatsApp.modelo_entregue}
                        onChange={(e) => setConfigWhatsApp({ ...configWhatsApp, modelo_entregue: e.target.value })}
                        rows={2}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Entrega Frustrada</Label>
                      <Textarea
                        value={configWhatsApp.modelo_frustrada}
                        onChange={(e) => setConfigWhatsApp({ ...configWhatsApp, modelo_frustrada: e.target.value })}
                        rows={2}
                        className="mt-2"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Variável: {'{'}{'{'}<span className="font-mono">motivo</span>{'}'}{'}'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="whats-auto"
                      checked={configWhatsApp.enviar_auto}
                      onChange={(e) => setConfigWhatsApp({ ...configWhatsApp, enviar_auto: e.target.checked })}
                    />
                    <label htmlFor="whats-auto" className="text-sm">
                      Enviar mensagens automaticamente
                    </label>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: E-mail */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader className="bg-purple-50 border-b">
              <CardTitle className="text-base">Notificações por E-mail</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded">
                <input
                  type="checkbox"
                  id="email-auto"
                  checked={configEmail.enviar_auto}
                  onChange={(e) => setConfigEmail({ ...configEmail, enviar_auto: e.target.checked })}
                />
                <label htmlFor="email-auto" className="text-sm">
                  Enviar e-mails automaticamente nas mudanças de status
                </label>
              </div>

              <div>
                <Label>Assunto - Saída para Entrega</Label>
                <Input
                  value={configEmail.assunto_saida}
                  onChange={(e) => setConfigEmail({ ...configEmail, assunto_saida: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Corpo do E-mail - Saída</Label>
                <Textarea
                  value={configEmail.corpo_saida}
                  onChange={(e) => setConfigEmail({ ...configEmail, corpo_saida: e.target.value })}
                  rows={4}
                  className="mt-2"
                  placeholder="Olá {{cliente_nome}}, seu pedido {{numero_pedido}} saiu para entrega..."
                />
              </div>

              <div>
                <Label>Assunto - Entrega Concluída</Label>
                <Input
                  value={configEmail.assunto_entregue}
                  onChange={(e) => setConfigEmail({ ...configEmail, assunto_entregue: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Corpo do E-mail - Entregue</Label>
                <Textarea
                  value={configEmail.corpo_entregue}
                  onChange={(e) => setConfigEmail({ ...configEmail, corpo_entregue: e.target.value })}
                  rows={4}
                  className="mt-2"
                />
              </div>

              <p className="text-xs text-slate-500 p-3 bg-slate-50 rounded">
                💡 O servidor SMTP é configurado em Integrações → E-mail
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Geral */}
        <TabsContent value="geral" className="space-y-4">
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-base">Configurações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Regras de Expedição</h4>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded">
                  <input type="checkbox" id="separacao-obrigatoria" />
                  <label htmlFor="separacao-obrigatoria" className="text-sm">
                    Exigir separação/conferência antes de gerar romaneio
                  </label>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 rounded">
                  <input type="checkbox" id="foto-obrigatoria" />
                  <label htmlFor="foto-obrigatoria" className="text-sm">
                    Foto de comprovante obrigatória para finalizar entrega
                  </label>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded">
                  <input type="checkbox" id="assinatura-obrigatoria" />
                  <label htmlFor="assinatura-obrigatoria" className="text-sm">
                    Assinatura digital obrigatória para finalizar entrega
                  </label>
                </div>

                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded">
                  <input type="checkbox" id="salvar-cliente" />
                  <label htmlFor="salvar-cliente" className="text-sm">
                    Perguntar se quer salvar endereço/contato no cliente
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold text-sm mb-3">Integração Google Maps (preparado)</h4>
                <div>
                  <Label>Google Maps API Key</Label>
                  <Input
                    type="password"
                    placeholder="Chave de API do Google Maps"
                    className="mt-2"
                    disabled
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    🔧 Será usado para roteirização e cálculo de rotas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button
          onClick={() => salvarMutation.mutate()}
          disabled={salvarMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {salvarMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
}