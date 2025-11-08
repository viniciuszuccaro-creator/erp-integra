import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MessageCircle, Bot, Users, Bell, CheckCircle2, AlertTriangle, 
  Send, User as UserIcon, Settings, TrendingUp 
} from "lucide-react";
import IntentEngine from "@/components/chatbot/IntentEngine";
import { useUser } from "@/components/lib/UserContext";
import { toast } from "sonner";

/**
 * CHATBOT ATENDIMENTO V21.1
 * Painel de atendimento humano + IA + transbordo inteligente
 */
export default function ChatbotAtendimento() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('conversas');
  const [conversaSelecionada, setConversaSelecionada] = useState(null);

  // Simula conversas em atendimento (preparado para integração real)
  const { data: conversasAbertas = [] } = useQuery({
    queryKey: ['conversas-chatbot'],
    queryFn: async () => {
      // Preparado para carregar conversas reais do agente
      return [];
    }
  });

  const { data: oportunidades = [] } = useQuery({
    queryKey: ['oportunidades-chatbot'],
    queryFn: () => base44.entities.Oportunidade.filter({ origem: 'Chatbot' }, '-created_date', 20)
  });

  const { data: orcamentosSite = [] } = useQuery({
    queryKey: ['orcamentos-site'],
    queryFn: () => base44.entities.OrcamentoSite.filter({ 
      status: 'Recebido' 
    }, '-created_date', 20)
  });

  const totalLeads = orcamentosSite.length;
  const totalConversoes = oportunidades.filter(o => o.status === 'Ganho').length;
  const taxaConversao = totalLeads > 0 ? (totalConversoes / totalLeads * 100).toFixed(1) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            🤖 Chatbot Atendimento
          </h1>
          <p className="text-slate-600">Central de Atendimento IA + Humano</p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2">
          <Bot className="w-4 h-4 mr-2" />
          IA Ativa
        </Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{conversasAbertas.length}</div>
            <p className="text-xs text-slate-600">Conversas Ativas</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{totalLeads}</div>
            <p className="text-xs text-slate-600">Leads Gerados (IA)</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">{totalConversoes}</div>
            <p className="text-xs text-slate-600">Conversões</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-cyan-600" />
            </div>
            <div className="text-2xl font-bold text-cyan-600">{taxaConversao}%</div>
            <p className="text-xs text-slate-600">Taxa Conversão IA</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="conversas">
            <MessageCircle className="w-4 h-4 mr-2" />
            Conversas
          </TabsTrigger>
          <TabsTrigger value="leads">
            <Users className="w-4 h-4 mr-2" />
            Leads Site
          </TabsTrigger>
          <TabsTrigger value="intents">
            <Settings className="w-4 h-4 mr-2" />
            Configuração Intents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversas">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Lista de Conversas */}
            <Card>
              <CardHeader>
                <CardTitle>Conversas em Atendimento</CardTitle>
              </CardHeader>
              <CardContent>
                {conversasAbertas.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Nenhuma conversa ativa</p>
                    <p className="text-xs mt-2">Quando clientes iniciarem chat, aparecerão aqui</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Placeholder para conversas */}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Intent Engine */}
            <IntentEngine isPublic={false} />
          </div>
        </TabsContent>

        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle>Orçamentos do Site (IA)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orcamentosSite.map(orc => (
                  <Card key={orc.id} className="border-purple-200 bg-purple-50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{orc.cliente_nome}</p>
                          <p className="text-sm text-slate-600">{orc.cliente_email}</p>
                        </div>
                        <Badge className={
                          orc.status === 'Recebido' ? 'bg-yellow-100 text-yellow-700' :
                          orc.status === 'Processando IA' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }>
                          {orc.status}
                        </Badge>
                      </div>
                      
                      {orc.valor_estimado_total > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-bold text-green-600">
                            R$ {orc.valor_estimado_total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                          </span>
                          <Badge className="ml-auto text-xs">
                            IA: {orc.confianca_ia || 0}%
                          </Badge>
                        </div>
                      )}

                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1">
                          Ver Detalhes
                        </Button>
                        <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                          Converter em Pedido
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {orcamentosSite.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <Bot className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Nenhum orçamento recebido pelo site</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intents">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Intents</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="border-blue-200 bg-blue-50">
                <Settings className="w-4 h-4" />
                <AlertDescription>
                  🔧 Configure as intents em: <strong>Cadastros → Integrações → Chatbot Intents</strong>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}