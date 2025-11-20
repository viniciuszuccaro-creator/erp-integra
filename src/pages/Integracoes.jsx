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

export default function Integracoes() {
  const [activeTab, setActiveTab] = useState("status");
  const { empresaAtual } = useContextoVisual();

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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Integrações</h1>
          <p className="text-slate-600">Conecte o ERP com serviços externos</p>
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
            Status Integrações
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Bell className="w-4 h-4 mr-2" />
            Notificações Automáticas
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
          <TabsTrigger value="ia-projeto" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Zap className="w-4 h-4 mr-2" />
            IA e Automações
          </TabsTrigger>
          <TabsTrigger value="marketplaces" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Marketplaces
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <StatusIntegracoes empresaId={empresaAtual?.id} />
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