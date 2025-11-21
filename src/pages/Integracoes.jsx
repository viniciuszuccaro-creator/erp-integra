import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Link2,
  FileText,
  MessageCircle,
  Truck,
  MapPin,
  Zap,
  DollarSign,
  MessageSquare,
  ShoppingCart,
  CheckCircle2,
  Bell // Added CheckCircle2 import
} from "lucide-react";
import TesteNFe from "../components/integracoes/TesteNFe";
import TesteBoletos from "../components/integracoes/TesteBoletos";
import TesteTransportadoras from "../components/integracoes/TesteTransportadoras";
import TesteGoogleMaps from "../components/integracoes/TesteGoogleMaps";
import IALeituraProjeto from "../components/integracoes/IALeituraProjeto";
import SincronizacaoMarketplacesAtiva from '@/components/integracoes/SincronizacaoMarketplacesAtiva';
import ConfigWhatsAppBusiness from '@/components/integracoes/ConfigWhatsAppBusiness';
import StatusIntegracoes from '../components/integracoes/StatusIntegracoes';
import ConfiguracaoNotificacoes from '../components/sistema/ConfiguracaoNotificacoes';
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useWindow } from "@/components/lib/useWindow";
import ApiExternaForm from "../components/cadastros/ApiExternaForm";
import WebhookForm from "../components/cadastros/WebhookForm";
import ChatbotCanalForm from "../components/cadastros/ChatbotCanalForm";
import ChatbotIntentForm from "../components/cadastros/ChatbotIntentForm";
import JobAgendadoForm from "../components/cadastros/JobAgendadoForm";

export default function Integracoes() {
  const [activeTab, setActiveTab] = useState("status");
  const { empresaAtual } = useContextoVisual();
  const { openWindow } = useWindow();

  const { data: configuracao } = useQuery({
    queryKey: ['configuracaoSistema'],
    queryFn: async () => {
      const configs = await base44.entities.ConfiguracaoSistema.list();
      return configs[0] || null;
    },
  });

  const { data: logsFiscais = [] } = useQuery({
    queryKey: ['logsFiscais'],
    queryFn: async () => {
      const response = await base44.entities.LogFiscal.list();
      return response || [];
    },
  });

  const { data: logsCobranca = [] } = useQuery({
    queryKey: ['logsCobranca'],
    queryFn: async () => {
      const response = await base44.entities.LogCobranca.list();
      return response || [];
    },
  });

  const { data: apisExternas = [] } = useQuery({
    queryKey: ['apis-externas'],
    queryFn: () => base44.entities.ApiExterna.list(),
  });

  const { data: webhooks = [] } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => base44.entities.Webhook.list(),
  });

  const { data: chatbotCanais = [] } = useQuery({
    queryKey: ['chatbotCanais'],
    queryFn: () => base44.entities.ChatbotCanal.list(),
  });

  const { data: chatbotIntents = [] } = useQuery({
    queryKey: ['chatbotIntents'],
    queryFn: () => base44.entities.ChatbotIntent.list(),
  });

  const { data: jobsAgendados = [] } = useQuery({
    queryKey: ['jobs-agendados'],
    queryFn: () => base44.entities.JobAgendado.list(),
  });

  const statusIntegracoes = {
    nfe: configuracao?.integracao_nfe?.ativa || false,
    boletos: configuracao?.integracao_boletos?.ativa || false,
    whatsapp: configuracao?.integracao_whatsapp?.ativa || false,
    transportadoras: false,
    maps: false,
    ia_producao: configuracao?.integracao_ia_producao?.ativada || false,
    marketplaces: false
  };

  const totalAtivas = Object.values(statusIntegracoes).filter(Boolean).length;
  const totalDisponiveis = 7;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Integrações • ETAPA 4</h1>
          <p className="text-slate-600">APIs Externas • Webhooks • Chatbot • Gateways • Marketplaces • Automações IA</p>
        </div>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{totalAtivas}</p>
                <p className="text-xs text-slate-600">Ativas</p>
              </div>
              <div className="w-px h-12 bg-slate-200" />
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-400">{totalDisponiveis - totalAtivas}</p>
                <p className="text-xs text-slate-600">Disponíveis</p>
              </div>
              <div className="w-px h-12 bg-slate-200" />
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {Math.round((totalAtivas / totalDisponiveis) * 100)}%
                </p>
                <p className="text-xs text-slate-500">Ativação</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border shadow-sm flex-wrap h-auto">
          <TabsTrigger value="status" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Status
          </TabsTrigger>
          <TabsTrigger value="apis" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <Link2 className="w-4 h-4 mr-2" />
            APIs ({apisExternas.length})
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Zap className="w-4 h-4 mr-2" />
            Webhooks ({webhooks.length})
          </TabsTrigger>
          <TabsTrigger value="chatbot" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
            <MessageSquare className="w-4 h-4 mr-2" />
            Chatbot ({chatbotCanais.length})
          </TabsTrigger>
          <TabsTrigger value="jobs" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
            <Zap className="w-4 h-4 mr-2" />
            Jobs IA ({jobsAgendados.length})
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Bell className="w-4 h-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="nfe" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" />
            NF-e
          </TabsTrigger>
          <TabsTrigger value="boletos" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <DollarSign className="w-4 h-4 mr-2" />
            Boletos/PIX
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="transportadoras" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            <Truck className="w-4 h-4 mr-2" />
            Transportadoras
          </TabsTrigger>
          <TabsTrigger value="maps" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <MapPin className="w-4 h-4 mr-2" />
            Google Maps
          </TabsTrigger>
          <TabsTrigger value="marketplaces" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Marketplaces
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <StatusIntegracoes empresaId={empresaAtual?.id} />
        </TabsContent>

        <TabsContent value="apis">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>APIs Externas Configuradas</CardTitle>
              <Button onClick={() => openWindow(ApiExternaForm, {
                windowMode: true,
                onSubmit: async (data) => {
                  await base44.entities.ApiExterna.create(data);
                }
              }, { title: '🔌 Nova API Externa', width: 900, height: 700 })}>
                <Plus className="w-4 h-4 mr-2" />
                Nova API
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {apisExternas.map(api => (
                  <Card key={api.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{api.nome_integracao}</p>
                        <p className="text-sm text-slate-600">{api.tipo_integracao} • {api.provedor}</p>
                      </div>
                      <Badge className={api.status_conexao === "Conectado" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}>
                        {api.status_conexao}
                      </Badge>
                    </div>
                  </Card>
                ))}
                {apisExternas.length === 0 && (
                  <div className="text-center py-12 text-slate-500">Nenhuma API configurada</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Webhooks Configurados</CardTitle>
              <Button onClick={() => openWindow(WebhookForm, {
                windowMode: true,
                onSubmit: async (data) => {
                  await base44.entities.Webhook.create(data);
                }
              }, { title: '🔗 Novo Webhook', width: 900, height: 600 })}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Webhook
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {webhooks.map(wh => (
                  <Card key={wh.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{wh.nome_webhook}</p>
                        <p className="text-sm text-slate-600">{wh.evento_gatilho} → {wh.url_destino}</p>
                      </div>
                      <Badge className={wh.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                        {wh.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </Card>
                ))}
                {webhooks.length === 0 && (
                  <div className="text-center py-12 text-slate-500">Nenhum webhook configurado</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chatbot">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Canais Chatbot</CardTitle>
                <Button onClick={() => openWindow(ChatbotCanalForm, {
                  windowMode: true,
                  onSubmit: async (data) => {
                    await base44.entities.ChatbotCanal.create(data);
                  }
                }, { title: '📱 Novo Canal', width: 800, height: 550 })}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Canal
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {chatbotCanais.map(canal => (
                    <div key={canal.id} className="p-3 border rounded hover:bg-slate-50">
                      <p className="font-semibold text-sm">{canal.nome_canal}</p>
                      <Badge variant="outline">{canal.tipo_canal}</Badge>
                    </div>
                  ))}
                  {chatbotCanais.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-sm">Nenhum canal configurado</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Intents Chatbot</CardTitle>
                <Button onClick={() => openWindow(ChatbotIntentForm, {
                  windowMode: true,
                  onSubmit: async (data) => {
                    await base44.entities.ChatbotIntent.create(data);
                  }
                }, { title: '💬 Nova Intent', width: 900, height: 650 })}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Intent
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {chatbotIntents.map(intent => (
                    <div key={intent.id} className="p-3 border rounded hover:bg-slate-50">
                      <p className="font-semibold text-sm">{intent.nome_intent}</p>
                      <p className="text-xs text-slate-600">{intent.descricao}</p>
                    </div>
                  ))}
                  {chatbotIntents.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-sm">Nenhuma intent cadastrada</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Jobs Agendados de IA</CardTitle>
              <Button onClick={() => openWindow(JobAgendadoForm, {
                windowMode: true,
                onSubmit: async (data) => {
                  await base44.entities.JobAgendado.create(data);
                }
              }, { title: '⏰ Novo Job', width: 900, height: 650 })}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Job
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {jobsAgendados.map(job => (
                  <Card key={job.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{job.nome_job}</p>
                        <p className="text-sm text-slate-600">{job.tipo_job} • {job.periodicidade}</p>
                      </div>
                      <Badge className={job.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                        {job.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </Card>
                ))}
                {jobsAgendados.length === 0 && (
                  <div className="text-center py-12 text-slate-500">Nenhum job agendado</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes">
          <ConfiguracaoNotificacoes empresaId={empresaAtual?.id} />
        </TabsContent>

        <TabsContent value="nfe">
          <TesteNFe configuracao={configuracao} />
        </TabsContent>

        <TabsContent value="boletos">
          <TesteBoletos configuracao={configuracao} />
        </TabsContent>

        <TabsContent value="whatsapp">
          <ConfigWhatsAppBusiness empresaId={empresaAtual?.id} />
        </TabsContent>

        <TabsContent value="transportadoras">
          <TesteTransportadoras configuracao={configuracao} />
        </TabsContent>

        <TabsContent value="maps">
          <TesteGoogleMaps configuracao={configuracao} />
        </TabsContent>

        <TabsContent value="ia-projeto">
          <IALeituraProjeto configuracao={configuracao} />
        </TabsContent>

        <TabsContent value="marketplaces">
          <SincronizacaoMarketplacesAtiva />
        </TabsContent>
      </Tabs>
    </div>
  );
}