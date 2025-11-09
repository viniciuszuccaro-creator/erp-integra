import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Webhook, Brain, Shield, Activity } from "lucide-react";
import StatusAPIMonitor from "@/components/integracoes/StatusAPIMonitor";
import WebhookManager from "@/components/integracoes/WebhookManager";
import ChatbotIntentsForm from "@/components/chatbot/ChatbotIntentsForm";
import { useUser } from "@/components/lib/UserContext";

/**
 * V21.6 - Página de Integrações & IA Avançada
 * O "Cérebro do Sistema" - Automação, Segurança e Cognição
 */
export default function IntegracoesIA() {
  const [activeTab, setActiveTab] = useState("apis");
  const { empresaAtual } = useUser();

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">🧠 Integrações & IA Avançada</h1>
        <p className="text-slate-600">O Cérebro do Sistema - Automação Neural e Monitoramento Contínuo</p>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md border-2 border-blue-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">APIs Monitoradas</CardTitle>
            <Zap className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">IA</div>
            <p className="text-xs text-blue-600 mt-1">Verificação a cada hora</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md border-2 border-purple-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Webhooks</CardTitle>
            <Webhook className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">Retry</div>
            <p className="text-xs text-purple-600 mt-1">Reenvio automático</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md border-2 border-green-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Chatbot Intents</CardTitle>
            <Brain className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">Auto</div>
            <p className="text-xs text-green-600 mt-1">Aprendizado contínuo</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md border-2 border-red-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Risco Global</CardTitle>
            <Shield className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">IA</div>
            <p className="text-xs text-red-600 mt-1">Correlação de falhas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="apis" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Zap className="w-4 h-4 mr-2" />
            Monitor de APIs
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Webhook className="w-4 h-4 mr-2" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="chatbot" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Brain className="w-4 h-4 mr-2" />
            Chatbot Intents
          </TabsTrigger>
          <TabsTrigger value="jobs" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Activity className="w-4 h-4 mr-2" />
            Jobs Agendados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="apis">
          <StatusAPIMonitor empresaId={empresaAtual?.id} />
        </TabsContent>

        <TabsContent value="webhooks">
          <WebhookManager empresaId={empresaAtual?.id} />
        </TabsContent>

        <TabsContent value="chatbot">
          <ChatbotIntentsForm />
        </TabsContent>

        <TabsContent value="jobs">
          <Card className="border-2 border-slate-200">
            <CardHeader>
              <CardTitle>Jobs de IA Agendados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { nome: 'IA Monitor API', frequencia: 'A cada hora', status: 'Ativo' },
                  { nome: 'IA Webhook Retry', frequencia: 'A cada 5 minutos', status: 'Ativo' },
                  { nome: 'IA Motor Intents', frequencia: 'Diário (8h)', status: 'Ativo' },
                  { nome: 'IA Risco Global', frequencia: 'A cada 2 horas', status: 'Ativo' },
                  { nome: 'IA DIFAL Update', frequencia: 'Diário (1h)', status: 'Ativo' },
                  { nome: 'IA PriceBrain', frequencia: 'Semanal', status: 'Ativo' },
                  { nome: 'IA Previsão Pagamento', frequencia: 'Diário (2h)', status: 'Ativo' }
                ].map((job, idx) => (
                  <div
                    key={idx}
                    className="p-4 border-2 border-slate-200 rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold">{job.nome}</p>
                        <p className="text-sm text-slate-600">Frequência: {job.frequencia}</p>
                      </div>
                      <Badge className={job.status === 'Ativo' ? 'bg-green-600' : 'bg-slate-600'}>
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}