import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChecklistFinalV21_6 from "@/components/sistema/CHECKLIST_FINAL_V21_6";
import Sistema100CompletoFinal from "@/components/sistema/SISTEMA_100_COMPLETO_FINAL";
import ValidacaoFinalTotalV21_6 from "@/components/sistema/VALIDACAO_FINAL_TOTAL_V21_6";
import MasterDashboardV21_6 from "@/components/sistema/MASTER_DASHBOARD_V21_6";
import { Shield, FileText, Settings, Zap, Sparkles, Wrench, Rocket, Cpu, Bell, Link2, MessageCircle, ShoppingCart, Globe, MapPin, Landmark, Wallet, Edit, Plus, Database, CheckCircle2, Stars, DollarSign, Truck } from "lucide-react";

import LogsAuditoria from "@/components/auditoria/LogsAuditoria";
import ControleEstoqueCompleto from "@/components/estoque/ControleEstoqueCompleto";
import ConfigGlobal from "@/components/sistema/ConfigGlobal";
import DiagnosticoBackend from "@/components/sistema/DiagnosticoBackend";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useWindow } from "@/components/lib/useWindow";
import DashboardFechamentoPedidos from "@/components/comercial/DashboardFechamentoPedidos";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import VisualizadorUniversalEntidade from "@/components/cadastros/VisualizadorUniversalEntidade";
import EventoNotificacaoForm from "@/components/cadastros/EventoNotificacaoForm";
import ConfiguracaoIntegracaoForm from "@/components/cadastros/ConfiguracaoIntegracaoForm";
import WebhookForm from "@/components/cadastros/WebhookForm";
import ChatbotIntentForm from "@/components/cadastros/ChatbotIntentForm";
import ChatbotCanalForm from "@/components/cadastros/ChatbotCanalForm";
import ApiExternaForm from "@/components/cadastros/ApiExternaForm";
import JobAgendadoForm from "@/components/cadastros/JobAgendadoForm";
import ParametroPortalClienteForm from "@/components/cadastros/ParametroPortalClienteForm";
import ParametroOrigemPedidoForm from "@/components/cadastros/ParametroOrigemPedidoForm";
import ParametroRecebimentoNFeForm from "@/components/cadastros/ParametroRecebimentoNFeForm";
import ParametroRoteirizacaoForm from "@/components/cadastros/ParametroRoteirizacaoForm";
import ParametroConciliacaoBancariaForm from "@/components/cadastros/ParametroConciliacaoBancariaForm";
import ParametroCaixaDiarioForm from "@/components/cadastros/ParametroCaixaDiarioForm";
import StatusIntegracoes from "@/components/integracoes/StatusIntegracoes";
import ConfiguracaoNotificacoes from "@/components/sistema/ConfiguracaoNotificacoes";
import TesteNFe from "@/components/integracoes/TesteNFe";
import TesteBoletos from "@/components/integracoes/TesteBoletos";
import ConfigWhatsAppBusiness from "@/components/integracoes/ConfigWhatsAppBusiness";
import TesteTransportadoras from "@/components/integracoes/TesteTransportadoras";
import TesteGoogleMaps from "@/components/integracoes/TesteGoogleMaps";
import IALeituraProjeto from "@/components/integracoes/IALeituraProjeto";
import SincronizacaoMarketplacesAtiva from "@/components/integracoes/SincronizacaoMarketplacesAtiva";

export default function ConfiguracoesSistema() {
  const [activeTab, setActiveTab] = useState("diagnostico");
  const { empresaAtual, estaNoGrupo } = useContextoVisual();
  const { openWindow } = useWindow();

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: configsIA = [] } = useQuery({
    queryKey: ['configs-ia'],
    queryFn: () => base44.entities.IAConfig.list(),
  });

  // Integrações & IA - dados centralizados
  const { data: eventosNotificacao = [] } = useQuery({ queryKey: ['eventos-notificacao'], queryFn: () => base44.entities.EventoNotificacao.list('-created_date') });
  const { data: configsIntegracao = [] } = useQuery({ queryKey: ['configs-integracao-marketplace'], queryFn: () => base44.entities.ConfiguracaoIntegracaoMarketplace.list() });
  const { data: webhooks = [] } = useQuery({ queryKey: ['webhooks'], queryFn: () => base44.entities.Webhook.list() });
  const { data: chatbotIntents = [] } = useQuery({ queryKey: ['chatbotIntents'], queryFn: () => base44.entities.ChatbotIntent.list() });
  const { data: chatbotCanais = [] } = useQuery({ queryKey: ['chatbotCanais'], queryFn: () => base44.entities.ChatbotCanal.list() });
  const { data: apisExternas = [] } = useQuery({ queryKey: ['apis-externas'], queryFn: () => base44.entities.ApiExterna.list() });
  const { data: jobsAgendados = [] } = useQuery({ queryKey: ['jobs-agendados'], queryFn: () => base44.entities.JobAgendado.list() });
  const { data: parametrosPortal = [] } = useQuery({ queryKey: ['parametros-portal'], queryFn: () => base44.entities.ParametroPortalCliente.list() });
  const { data: parametrosOrigemPedido = [] } = useQuery({ queryKey: ['parametros-origem-pedido'], queryFn: () => base44.entities.ParametroOrigemPedido.list() });
  const { data: parametrosRecebimentoNFe = [] } = useQuery({ queryKey: ['parametros-recebimento-nfe'], queryFn: () => base44.entities.ParametroRecebimentoNFe.list() });
  const { data: parametrosRoteirizacao = [] } = useQuery({ queryKey: ['parametros-roteirizacao'], queryFn: () => base44.entities.ParametroRoteirizacao.list() });
  const { data: parametrosConciliacao = [] } = useQuery({ queryKey: ['parametros-conciliacao'], queryFn: () => base44.entities.ParametroConciliacaoBancaria.list() });
  const { data: parametrosCaixa = [] } = useQuery({ queryKey: ['parametros-caixa'], queryFn: () => base44.entities.ParametroCaixaDiario.list() });
  const { data: configuracao } = useQuery({
    queryKey: ['configuracaoSistema'],
    queryFn: async () => (await base44.entities.ConfiguracaoSistema.list())[0] || null,
  });

  const handleSubmitGenerico = (entityName, queryKey) => async (data) => {
    if (data?._salvamentoCompleto) return;
    try {
      if (data.id) {
        await base44.entities[entityName].update(data.id, data);
        toast({ title: `✅ ${entityName} atualizado com sucesso!` });
      } else {
        await base44.entities[entityName].create(data);
        toast({ title: `✅ ${entityName} criado com sucesso!` });
      }
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    } catch (error) {
      toast({ title: `❌ Erro ao salvar ${entityName}`, description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Configurações do Sistema</h1>
        <p className="text-slate-600">Gerenciamento de acessos, auditoria, integrações e controles</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border shadow-sm flex-wrap h-auto">
          <TabsTrigger
            value="diagnostico"
            className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white"
          >
            <Wrench className="w-4 h-4 mr-2" />
            🔧 Diagnóstico
          </TabsTrigger>

          <TabsTrigger
            value="ia"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Integrações & IA
          </TabsTrigger>

          <TabsTrigger value="config-global" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Zap className="w-4 h-4 mr-2" />
            Configurações Globais
          </TabsTrigger>
          
          <TabsTrigger value="auditoria" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" />
            Auditoria
          </TabsTrigger>
          <TabsTrigger value="estoque-avancado" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Settings className="w-4 h-4 mr-2" />
            Estoque Avançado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostico">
          <div className="space-y-4">
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-900">🔧 Diagnóstico do Sistema</CardTitle>
                <p className="text-sm text-yellow-700">
                  Teste se as funcionalidades backend estão ativas (necessário para busca de CNPJ/CPF)
                </p>
              </CardHeader>
            </Card>
            <DiagnosticoBackend />
          </div>
        </TabsContent>

        <TabsContent value="ia">
          <div className="space-y-6">
            <Card>
              <CardHeader className="bg-purple-50 border-b">
                <CardTitle>Configuração de Inteligência Artificial</CardTitle>
                <p className="text-sm text-slate-600 mt-1">Configure modelos e limites de IA por módulo</p>
              </CardHeader>
              <CardContent className="p-6">
                {configsIA.length > 0 ? (
                  <div className="space-y-3">
                    {configsIA.map((config) => (
                      <div key={config.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-semibold">{config.modulo} - {config.funcionalidade}</p>
                          <p className="text-sm text-slate-600">Modelo: {config.modelo_base} | Limite: {config.limite_tokens} tokens</p>
                        </div>
                        <Badge className={config.ativo ? 'bg-green-600' : 'bg-slate-600'}>
                          {config.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <Sparkles className="w-16 h-16 mx-auto mb-3 opacity-30" />
                    <p>Nenhuma configuração de IA cadastrada</p>
                    <p className="text-sm mt-2">As configurações são criadas automaticamente ao usar funcionalidades IA</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Integrações & Automações */}
            <Tabs defaultValue="gerenciamento" className="mt-2">
              <TabsList className="bg-slate-100 mb-6 flex-wrap h-auto">
                <TabsTrigger value="gerenciamento"><Database className="w-4 h-4 mr-2" />Gerenciamento</TabsTrigger>
                <TabsTrigger value="parametros"><Settings className="w-4 h-4 mr-2" />Parâmetros Operacionais</TabsTrigger>
                <TabsTrigger value="status"><CheckCircle2 className="w-4 h-4 mr-2" />Status Integrações</TabsTrigger>
                <TabsTrigger value="notificacoes"><Bell className="w-4 h-4 mr-2" />Notificações</TabsTrigger>
                <TabsTrigger value="nfe"><FileText className="w-4 h-4 mr-2" />Testes NF-e</TabsTrigger>
                <TabsTrigger value="boletos"><DollarSign className="w-4 h-4 mr-2" />Testes Boletos/PIX</TabsTrigger>
                <TabsTrigger value="whatsapp"><MessageCircle className="w-4 h-4 mr-2" />Testes WhatsApp</TabsTrigger>
                <TabsTrigger value="transportadoras"><Truck className="w-4 h-4 mr-2" />Transportadoras</TabsTrigger>
                <TabsTrigger value="maps"><Globe className="w-4 h-4 mr-2" />Maps</TabsTrigger>
                <TabsTrigger value="ia-integracoes"><Zap className="w-4 h-4 mr-2" />Testes IA</TabsTrigger>
                <TabsTrigger value="marketplaces"><ShoppingCart className="w-4 h-4 mr-2" />Marketplaces</TabsTrigger>
              </TabsList>

              {/* GERENCIAMENTO */}
              <TabsContent value="gerenciamento">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Eventos de Notificação */}
                  <Card className="border-cyan-200">
                    <CardHeader className="bg-cyan-50 border-b border-cyan-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base cursor-pointer hover:text-cyan-700"
                          onClick={() => openWindow(VisualizadorUniversalEntidade, {
                            nomeEntidade: 'EventoNotificacao',
                            tituloDisplay: 'Eventos de Notificação',
                            icone: Bell,
                            camposPrincipais: ['nome_evento','tipo_evento','canais','ativo'],
                            componenteEdicao: EventoNotificacaoForm,
                            windowMode: true
                          }, { title: '🔔 Todos os Eventos', width: 1400, height: 800 })}
                        >
                          🔔 Eventos de Notificação ({eventosNotificacao.length})
                        </CardTitle>
                        <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700"
                          onClick={() => openWindow(EventoNotificacaoForm, { windowMode: true, onSubmit: handleSubmitGenerico('EventoNotificacao','eventos-notificacao') }, { title: '🔔 Novo Evento', width: 1000, height: 700 })}> 
                          <Plus className="w-4 h-4 mr-1" />Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {eventosNotificacao.map(evento => (
                        <div key={evento.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{evento.nome_evento}</p>
                            <Badge variant="outline" className="text-xs">{evento.tipo_evento}</Badge>
                          </div>
                          <Button variant="ghost" size="sm"
                            onClick={() => openWindow(EventoNotificacaoForm, { eventoNotificacao: evento, windowMode: true, onSubmit: handleSubmitGenerico('EventoNotificacao','eventos-notificacao') }, { title: `🔔 Editar: ${evento.nome_evento}`, width: 1000, height: 700 })}>
                            <Edit className="w-3 h-3 text-cyan-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Integrações Marketplace */}
                  <Card className="border-purple-200">
                    <CardHeader className="bg-purple-50 border-b border-purple-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base cursor-pointer hover:text-purple-700"
                          onClick={() => openWindow(VisualizadorUniversalEntidade, {
                            nomeEntidade: 'ConfiguracaoIntegracaoMarketplace',
                            tituloDisplay: 'Integrações Marketplace',
                            icone: ShoppingCart,
                            camposPrincipais: ['marketplace','ativo','api_key','url_base'],
                            componenteEdicao: ConfiguracaoIntegracaoForm,
                            windowMode: true
                          }, { title: '🛒 Todas as Integrações', width: 1400, height: 800 })}
                        >
                          🛒 Integrações Marketplace ({configsIntegracao.length})
                        </CardTitle>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700"
                          onClick={() => openWindow(ConfiguracaoIntegracaoForm, { windowMode: true, onSubmit: handleSubmitGenerico('ConfiguracaoIntegracaoMarketplace','configs-integracao-marketplace') }, { title: '🔗 Nova Integração', width: 1100, height: 750 })}>
                          <Plus className="w-4 h-4 mr-1" />Nova
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {configsIntegracao.map(config => (
                        <div key={config.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{config.marketplace}</p>
                            <Badge className={config.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{config.ativo ? 'Ativa' : 'Inativa'}</Badge>
                          </div>
                          <Button variant="ghost" size="sm"
                            onClick={() => openWindow(ConfiguracaoIntegracaoForm, { configuracaoIntegracaoMarketplace: config, windowMode: true, onSubmit: handleSubmitGenerico('ConfiguracaoIntegracaoMarketplace','configs-integracao-marketplace') }, { title: `🔗 Editar: ${config.marketplace}`, width: 1100, height: 750 })}>
                            <Edit className="w-3 h-3 text-purple-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Webhooks */}
                  <Card className="border-indigo-200">
                    <CardHeader className="bg-indigo-50 border-b border-indigo-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base cursor-pointer hover:text-indigo-700"
                          onClick={() => openWindow(VisualizadorUniversalEntidade, {
                            nomeEntidade: 'Webhook',
                            tituloDisplay: 'Webhooks',
                            icone: Link2,
                            camposPrincipais: ['nome_webhook','url','evento_gatilho','ativo'],
                            componenteEdicao: WebhookForm,
                            windowMode: true
                          }, { title: '🔗 Todos os Webhooks', width: 1400, height: 800 })}
                        >
                          🔗 Webhooks ({webhooks.length})
                        </CardTitle>
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700"
                          onClick={() => openWindow(WebhookForm, { windowMode: true, onSubmit: handleSubmitGenerico('Webhook','webhooks') }, { title: '🔗 Novo Webhook', width: 900, height: 600 })}>
                          <Plus className="w-4 h-4 mr-1" />Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {webhooks.map(wh => (
                        <div key={wh.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <div className="flex-1"><p className="font-semibold text-sm">{wh.nome_webhook}</p></div>
                          <Button variant="ghost" size="sm"
                            onClick={() => openWindow(WebhookForm, { webhook: wh, windowMode: true, onSubmit: handleSubmitGenerico('Webhook','webhooks') }, { title: `🔗 Editar: ${wh.nome_webhook}`, width: 900, height: 600 })}>
                            <Edit className="w-3 h-3 text-indigo-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Chatbot Intents */}
                  <Card className="border-purple-200">
                    <CardHeader className="bg-purple-50 border-b border-purple-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base cursor-pointer hover:text-purple-700"
                          onClick={() => openWindow(VisualizadorUniversalEntidade, {
                            nomeEntidade: 'ChatbotIntent',
                            tituloDisplay: 'Chatbot Intents',
                            icone: MessageCircle,
                            camposPrincipais: ['nome_intent','exemplos_frases','resposta_padrao','ativo'],
                            componenteEdicao: ChatbotIntentForm,
                            windowMode: true
                          }, { title: '💬 Todas as Intents', width: 1400, height: 800 })}
                        >
                          💬 Intents ({chatbotIntents.length})
                        </CardTitle>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700"
                          onClick={() => openWindow(ChatbotIntentForm, { windowMode: true, onSubmit: handleSubmitGenerico('ChatbotIntent','chatbotIntents') }, { title: '💬 Nova Intent', width: 900, height: 650 })}>
                          <Plus className="w-4 h-4 mr-1" />Nova
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {chatbotIntents.map(intent => (
                        <div key={intent.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <div className="flex-1"><p className="font-semibold text-sm">{intent.nome_intent}</p></div>
                          <Button variant="ghost" size="sm"
                            onClick={() => openWindow(ChatbotIntentForm, { chatbotIntent: intent, windowMode: true, onSubmit: handleSubmitGenerico('ChatbotIntent','chatbotIntents') }, { title: `💬 Editar: ${intent.nome_intent}`, width: 900, height: 650 })}>
                            <Edit className="w-3 h-3 text-purple-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Chatbot Canais */}
                  <Card className="border-green-200">
                    <CardHeader className="bg-green-50 border-b border-green-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base cursor-pointer hover:text-green-700"
                          onClick={() => openWindow(VisualizadorUniversalEntidade, {
                            nomeEntidade: 'ChatbotCanal',
                            tituloDisplay: 'Canais de Chatbot',
                            icone: MessageCircle,
                            camposPrincipais: ['nome_canal','tipo_canal','configuracao','ativo'],
                            componenteEdicao: ChatbotCanalForm,
                            windowMode: true
                          }, { title: '📱 Todos os Canais', width: 1400, height: 800 })}
                        >
                          📱 Canais ({chatbotCanais.length})
                        </CardTitle>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700"
                          onClick={() => openWindow(ChatbotCanalForm, { windowMode: true, onSubmit: handleSubmitGenerico('ChatbotCanal','chatbotCanais') }, { title: '📱 Novo Canal', width: 800, height: 550 })}>
                          <Plus className="w-4 h-4 mr-1" />Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {chatbotCanais.map(canal => (
                        <div key={canal.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <div className="flex-1"><p className="font-semibold text-sm">{canal.nome_canal}</p></div>
                          <Button variant="ghost" size="sm"
                            onClick={() => openWindow(ChatbotCanalForm, { chatbotCanal: canal, windowMode: true, onSubmit: handleSubmitGenerico('ChatbotCanal','chatbotCanais') }, { title: `📱 Editar: ${canal.nome_canal}`, width: 800, height: 550 })}>
                            <Edit className="w-3 h-3 text-green-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* APIs Externas */}
                  <Card className="border-blue-200">
                    <CardHeader className="bg-blue-50 border-b border-blue-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base cursor-pointer hover:text-blue-700"
                          onClick={() => openWindow(VisualizadorUniversalEntidade, {
                            nomeEntidade: 'ApiExterna',
                            tituloDisplay: 'APIs Externas',
                            icone: Link2,
                            camposPrincipais: ['nome_integracao','url_base','autenticacao','ativo'],
                            componenteEdicao: ApiExternaForm,
                            windowMode: true
                          }, { title: '🔌 Todas as APIs', width: 1400, height: 800 })}
                        >
                          🔌 APIs ({apisExternas.length})
                        </CardTitle>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => openWindow(ApiExternaForm, { windowMode: true, onSubmit: handleSubmitGenerico('ApiExterna','apis-externas') }, { title: '🔌 Nova API', width: 900, height: 700 })}>
                          <Plus className="w-4 h-4 mr-1" />Nova
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {apisExternas.map(api => (
                        <div key={api.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <div className="flex-1"><p className="font-semibold text-sm">{api.nome_integracao}</p></div>
                          <Button variant="ghost" size="sm"
                            onClick={() => openWindow(ApiExternaForm, { apiExterna: api, windowMode: true, onSubmit: handleSubmitGenerico('ApiExterna','apis-externas') }, { title: `🔌 Editar: ${api.nome_integracao}`, width: 900, height: 700 })}>
                            <Edit className="w-3 h-3 text-blue-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Jobs IA */}
                  <Card className="border-amber-200">
                    <CardHeader className="bg-amber-50 border-b border-amber-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base cursor-pointer hover:text-amber-700"
                          onClick={() => openWindow(VisualizadorUniversalEntidade, {
                            nomeEntidade: 'JobAgendado',
                            tituloDisplay: 'Jobs Agendados (IA)',
                            icone: Clock,
                            camposPrincipais: ['nome_job','tipo_job','periodicidade','ativo','ultima_execucao'],
                            componenteEdicao: JobAgendadoForm,
                            windowMode: true
                          }, { title: '⏰ Todos os Jobs de IA', width: 1400, height: 800 })}
                        >
                          ⏰ Jobs IA ({jobsAgendados.length})
                        </CardTitle>
                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700"
                          onClick={() => openWindow(JobAgendadoForm, { windowMode: true, onSubmit: handleSubmitGenerico('JobAgendado','jobs-agendados') }, { title: '⏰ Novo Job', width: 900, height: 650 })}>
                          <Plus className="w-4 h-4 mr-1" />Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {jobsAgendados.map(job => (
                        <div key={job.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <div className="flex-1"><p className="font-semibold text-sm">{job.nome_job}</p></div>
                          <Button variant="ghost" size="sm"
                            onClick={() => openWindow(JobAgendadoForm, { jobAgendado: job, windowMode: true, onSubmit: handleSubmitGenerico('JobAgendado','jobs-agendados') }, { title: `⏰ Editar: ${job.nome_job}`, width: 900, height: 650 })}>
                            <Edit className="w-3 h-3 text-amber-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* PARÂMETROS */}
              <TabsContent value="parametros">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Portal Cliente */}
                  <Card className="border-blue-200">
                    <CardHeader className="bg-blue-50 border-b border-blue-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base cursor-pointer hover:text-blue-700"
                          onClick={() => openWindow(VisualizadorUniversalEntidade, {
                            nomeEntidade: 'ParametroPortalCliente',
                            tituloDisplay: 'Parâmetros Portal Cliente',
                            icone: Globe,
                            camposPrincipais: ['empresa_id','habilitar_portal','habilitar_aprovacao_orcamento'],
                            componenteEdicao: ParametroPortalClienteForm,
                            windowMode: true
                          }, { title: '🌐 Todos os Parâmetros Portal', width: 1400, height: 800 })}
                        >
                          🌐 Portal Cliente ({parametrosPortal.length})
                        </CardTitle>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => openWindow(ParametroPortalClienteForm, { windowMode: true, onSubmit: handleSubmitGenerico('ParametroPortalCliente','parametros-portal') }, { title: '🌐 Novo Parâmetro Portal', width: 900, height: 650 })}>
                          <Plus className="w-4 h-4 mr-1" />Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {parametrosPortal.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <p className="font-semibold text-sm flex-1">Portal Config</p>
                          <Button variant="ghost" size="sm"
                            onClick={() => openWindow(ParametroPortalClienteForm, { parametroPortalCliente: p, windowMode: true, onSubmit: handleSubmitGenerico('ParametroPortalCliente','parametros-portal') }, { title: '🌐 Editar Parâmetro Portal', width: 900, height: 650 })}>
                            <Edit className="w-3 h-3 text-blue-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Origem Pedido */}
                  <Card className="border-purple-200">
                    <CardHeader className="bg-purple-50 border-b border-purple-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base cursor-pointer hover:text-purple-700"
                          onClick={() => openWindow(VisualizadorUniversalEntidade, {
                            nomeEntidade: 'ParametroOrigemPedido',
                            tituloDisplay: 'Parâmetros Origem de Pedido',
                            icone: ShoppingCart,
                            camposPrincipais: ['nome','canal','tipo_criacao','ativo'],
                            componenteEdicao: ParametroOrigemPedidoForm,
                            windowMode: true
                          }, { title: '🛒 Todos os Canais de Origem', width: 1400, height: 800 })}
                        >
                          🛒 Origem Pedido ({parametrosOrigemPedido.length})
                        </CardTitle>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700"
                          onClick={() => openWindow(ParametroOrigemPedidoForm, { windowMode: true, onSubmit: handleSubmitGenerico('ParametroOrigemPedido','parametros-origem-pedido') }, { title: '🛒 Novo Canal de Origem', width: 900, height: 650 })}>
                          <Plus className="w-4 h-4 mr-1" />Novo Canal
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {parametrosOrigemPedido.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{p.nome}</p>
                            <div className="flex gap-2 mt-1 flex-wrap">
                              <Badge variant="outline" className="text-xs">{p.canal}</Badge>
                              <Badge className={`text-xs ${p.tipo_criacao === 'Manual' ? 'bg-blue-100 text-blue-700' : p.tipo_criacao === 'Automático' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>{p.tipo_criacao}</Badge>
                              {p.ativo && <Badge className="bg-green-100 text-green-700 text-xs">✅ Ativo</Badge>}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm"
                            onClick={() => openWindow(ParametroOrigemPedidoForm, { parametroOrigemPedido: p, windowMode: true, onSubmit: handleSubmitGenerico('ParametroOrigemPedido','parametros-origem-pedido') }, { title: `🛒 Editar: ${p.nome}`, width: 900, height: 650 })}>
                            <Edit className="w-3 h-3 text-purple-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Recebimento NFe */}
                  <Card className="border-green-200">
                    <CardHeader className="bg-green-50 border-b border-green-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base cursor-pointer hover:text-green-700"
                          onClick={() => openWindow(VisualizadorUniversalEntidade, {
                            nomeEntidade: 'ParametroRecebimentoNFe',
                            tituloDisplay: 'Parâmetros Recebimento NF-e',
                            icone: FileText,
                            camposPrincipais: ['empresa_id','criar_produto_automaticamente','validar_duplicidade'],
                            componenteEdicao: ParametroRecebimentoNFeForm,
                            windowMode: true
                          }, { title: '📄 Todos os Parâmetros NF-e', width: 1400, height: 800 })}
                        >
                          📄 Recebimento NF-e ({parametrosRecebimentoNFe.length})
                        </CardTitle>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700"
                          onClick={() => openWindow(ParametroRecebimentoNFeForm, { windowMode: true, onSubmit: handleSubmitGenerico('ParametroRecebimentoNFe','parametros-recebimento-nfe') }, { title: '📄 Novo Parâmetro NFe', width: 900, height: 650 })}>
                          <Plus className="w-4 h-4 mr-1" />Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {parametrosRecebimentoNFe.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <p className="font-semibold text-sm flex-1">NF-e Config</p>
                          <Button variant="ghost" size="sm"
                            onClick={() => openWindow(ParametroRecebimentoNFeForm, { parametroRecebimentoNFe: p, windowMode: true, onSubmit: handleSubmitGenerico('ParametroRecebimentoNFe','parametros-recebimento-nfe') }, { title: '📄 Editar Parâmetro NFe', width: 900, height: 650 })}>
                            <Edit className="w-3 h-3 text-green-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Roteirização */}
                  <Card className="border-orange-200">
                    <CardHeader className="bg-orange-50 border-b border-orange-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base cursor-pointer hover:text-orange-700"
                          onClick={() => openWindow(VisualizadorUniversalEntidade, {
                            nomeEntidade: 'ParametroRoteirizacao',
                            tituloDisplay: 'Parâmetros de Roteirização',
                            icone: MapPin,
                            camposPrincipais: ['empresa_id','otimizar_por','habilitar_ia'],
                            componenteEdicao: ParametroRoteirizacaoForm,
                            windowMode: true
                          }, { title: '🗺️ Todos os Parâmetros de Rotas', width: 1400, height: 800 })}
                        >
                          🗺️ Roteirização ({parametrosRoteirizacao.length})
                        </CardTitle>
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700"
                          onClick={() => openWindow(ParametroRoteirizacaoForm, { windowMode: true, onSubmit: handleSubmitGenerico('ParametroRoteirizacao','parametros-roteirizacao') }, { title: '🗺️ Novo Parâmetro Rotas', width: 800, height: 600 })}>
                          <Plus className="w-4 h-4 mr-1" />Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {parametrosRoteirizacao.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <p className="font-semibold text-sm flex-1">Roteirização Config</p>
                          <Button variant="ghost" size="sm"
                            onClick={() => openWindow(ParametroRoteirizacaoForm, { parametroRoteirizacao: p, windowMode: true, onSubmit: handleSubmitGenerico('ParametroRoteirizacao','parametros-roteirizacao') }, { title: '🗺️ Editar Parâmetro Rotas', width: 800, height: 600 })}>
                            <Edit className="w-3 h-3 text-orange-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Conciliação */}
                  <Card className="border-cyan-200">
                    <CardHeader className="bg-cyan-50 border-b border-cyan-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base cursor-pointer hover:text-cyan-700"
                          onClick={() => openWindow(VisualizadorUniversalEntidade, {
                            nomeEntidade: 'ParametroConciliacaoBancaria',
                            tituloDisplay: 'Parâmetros Conciliação',
                            icone: Landmark,
                            camposPrincipais: ['empresa_id','tolerancia_valor','habilitar_ia'],
                            componenteEdicao: ParametroConciliacaoBancariaForm,
                            windowMode: true
                          }, { title: '🏦 Todos os Parâmetros Conciliação', width: 1400, height: 800 })}
                        >
                          🏦 Conciliação ({parametrosConciliacao.length})
                        </CardTitle>
                        <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700"
                          onClick={() => openWindow(ParametroConciliacaoBancariaForm, { windowMode: true, onSubmit: handleSubmitGenerico('ParametroConciliacaoBancaria','parametros-conciliacao') }, { title: '🏦 Novo Parâmetro Conciliação', width: 900, height: 650 })}>
                          <Plus className="w-4 h-4 mr-1" />Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {parametrosConciliacao.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <p className="font-semibold text-sm flex-1">Conciliação Config</p>
                          <Button variant="ghost" size="sm"
                            onClick={() => openWindow(ParametroConciliacaoBancariaForm, { parametroConciliacaoBancaria: p, windowMode: true, onSubmit: handleSubmitGenerico('ParametroConciliacaoBancaria','parametros-conciliacao') }, { title: '🏦 Editar Parâmetro Conciliação', width: 900, height: 650 })}>
                            <Edit className="w-3 h-3 text-cyan-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Caixa Diário */}
                  <Card className="border-emerald-200">
                    <CardHeader className="bg-emerald-50 border-b border-emerald-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base cursor-pointer hover:text-emerald-700"
                          onClick={() => openWindow(VisualizadorUniversalEntidade, {
                            nomeEntidade: 'ParametroCaixaDiario',
                            tituloDisplay: 'Parâmetros Caixa Diário',
                            icone: Wallet,
                            camposPrincipais: ['empresa_id','horario_abertura','horario_fechamento'],
                            componenteEdicao: ParametroCaixaDiarioForm,
                            windowMode: true
                          }, { title: '💰 Todos os Parâmetros Caixa', width: 1400, height: 800 })}
                        >
                          💰 Caixa Diário ({parametrosCaixa.length})
                        </CardTitle>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => openWindow(ParametroCaixaDiarioForm, { windowMode: true, onSubmit: handleSubmitGenerico('ParametroCaixaDiario','parametros-caixa') }, { title: '💰 Novo Parâmetro Caixa', width: 800, height: 600 })}>
                          <Plus className="w-4 h-4 mr-1" />Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {parametrosCaixa.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <p className="font-semibold text-sm flex-1">Caixa Config</p>
                          <Button variant="ghost" size="sm"
                            onClick={() => openWindow(ParametroCaixaDiarioForm, { parametroCaixaDiario: p, windowMode: true, onSubmit: handleSubmitGenerico('ParametroCaixaDiario','parametros-caixa') }, { title: '💰 Editar Parâmetro Caixa', width: 800, height: 600 })}>
                            <Edit className="w-3 h-3 text-emerald-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* STATUS / TESTES */}
              <TabsContent value="status"><StatusIntegracoes empresaId={empresaAtual?.id} /></TabsContent>
              <TabsContent value="notificacoes"><ConfiguracaoNotificacoes empresaId={empresaAtual?.id} /></TabsContent>
              <TabsContent value="nfe"><TesteNFe configuracao={configuracao} /></TabsContent>
              <TabsContent value="boletos"><TesteBoletos configuracao={configuracao} /></TabsContent>
              <TabsContent value="whatsapp"><ConfigWhatsAppBusiness empresaId={empresaAtual?.id} /></TabsContent>
              <TabsContent value="transportadoras"><TesteTransportadoras configuracao={configuracao} /></TabsContent>
              <TabsContent value="maps"><TesteGoogleMaps configuracao={configuracao} /></TabsContent>
              <TabsContent value="ia-integracoes"><IALeituraProjeto configuracao={configuracao} /></TabsContent>
              <TabsContent value="marketplaces"><SincronizacaoMarketplacesAtiva /></TabsContent>
            </Tabs>

            <Alert className="mt-2 border-purple-300 bg-gradient-to-r from-purple-50 to-cyan-50">
              <Stars className="w-4 h-4 text-purple-600" />
              <AlertDescription className="text-sm text-purple-900">
                <strong>28 IAs Ativas:</strong> PriceBrain 3.0 • ChurnDetection • ProductClassifier • FiscalValidator • LeadScoring • RouteOptimizer • QualityPredictor • StockRecommender • e mais 20 IAs rodando 24/7
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>

        <TabsContent value="config-global">
          <ConfigGlobal
            empresaId={empresaAtual?.id}
            grupoId={estaNoGrupo ? empresaAtual?.grupo_id : null}
          />
        </TabsContent>

        

        <TabsContent value="auditoria">
          <LogsAuditoria />
        </TabsContent>

        <TabsContent value="estoque-avancado">
          <ControleEstoqueCompleto empresaId={empresaAtual?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}