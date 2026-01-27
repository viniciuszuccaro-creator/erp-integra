import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProtectedSection from "@/components/security/ProtectedSection";
import ContextoConfigBanner from "@/components/administracao-sistema/common/ContextoConfigBanner";
import HerancaConfigNotice from "@/components/administracao-sistema/common/HerancaConfigNotice";
import IntegracoesPanel from "@/components/administracao-sistema/configuracoes-gerais/IntegracoesPanel";
import TesteNFe from "@/components/integracoes/TesteNFe";
import TesteBoletos from "@/components/integracoes/TesteBoletos";
import ConfigWhatsAppBusiness from "@/components/integracoes/ConfigWhatsAppBusiness";
import TesteTransportadoras from "@/components/integracoes/TesteTransportadoras";
import TesteGoogleMaps from "@/components/integracoes/TesteGoogleMaps";
import StatusIntegracoes from "@/components/integracoes/StatusIntegracoes";
import ConfiguracaoNFeForm from "@/components/cadastros/ConfiguracaoNFeForm";
import ConfiguracaoBoletosForm from "@/components/cadastros/ConfiguracaoBoletosForm";
import ConfiguracaoWhatsAppForm from "@/components/cadastros/ConfiguracaoWhatsAppForm";
import ConfiguracaoIntegracaoForm from "@/components/cadastros/ConfiguracaoIntegracaoForm";
import ApiExternaForm from "@/components/cadastros/ApiExternaForm";
import WebhookForm from "@/components/cadastros/WebhookForm";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { base44 } from "@/api/base44Client";
import { useUser } from "@/components/lib/UserContext";
import { FileText, DollarSign, MessageCircle, Truck, Globe, ShoppingCart, Link2, CheckCircle2 } from "lucide-react";
import VisualizadorUniversalEntidade from "@/components/cadastros/VisualizadorUniversalEntidade";
import { useWindow } from "@/components/lib/useWindow";
import { useQuery } from "@tanstack/react-query";
import SincronizacaoMarketplacesAtiva from "@/components/integracoes/SincronizacaoMarketplacesAtiva";

export default function IntegracoesIndex({ initialTab }) {
  const { empresaAtual } = useContextoVisual();
  const { user } = useUser();
  const { openWindow } = useWindow();
  const [tab, setTab] = React.useState(initialTab || "gerenciamento");

  const handleTabChange = (next) => {
    setTab(next);
    try {
      base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || "Usuário",
        usuario_id: user?.id,
        empresa_id: empresaAtual?.id || null,
        acao: "Visualização",
        modulo: "Sistema",
        entidade: "Integrações",
        descricao: `Aba visualizada: ${next}`,
        data_hora: new Date().toISOString(),
      });
    } catch {}
  };

  const { data: configuracao } = useQuery({
    queryKey: ["configuracaoSistema"],
    queryFn: async () => {
      const configs = await base44.entities.ConfiguracaoSistema.list();
      return configs[0] || null;
    },
  });

  return (
    <div className="w-full h-full flex flex-col">
      <Tabs value={tab} onValueChange={handleTabChange} className="w-full h-full">
        <TabsList className="flex flex-wrap gap-2 h-auto">
          <TabsTrigger value="gerenciamento"><CheckCircle2 className="w-4 h-4 mr-2" />Gerenciamento</TabsTrigger>
          <TabsTrigger value="status"><CheckCircle2 className="w-4 h-4 mr-2" />Status</TabsTrigger>
          <TabsTrigger value="nfe"><FileText className="w-4 h-4 mr-2" />NF-e</TabsTrigger>
          <TabsTrigger value="boletos"><DollarSign className="w-4 h-4 mr-2" />Boletos/PIX</TabsTrigger>
          <TabsTrigger value="whatsapp"><MessageCircle className="w-4 h-4 mr-2" />WhatsApp</TabsTrigger>
          <TabsTrigger value="transportadoras"><Truck className="w-4 h-4 mr-2" />Transportadoras</TabsTrigger>
          <TabsTrigger value="maps"><Globe className="w-4 h-4 mr-2" />Maps</TabsTrigger>
          <TabsTrigger value="marketplaces"><ShoppingCart className="w-4 h-4 mr-2" />Marketplaces</TabsTrigger>
        </TabsList>

        <TabsContent value="gerenciamento" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <div className="w-full mb-3 space-y-2">
                <ContextoConfigBanner />
                <HerancaConfigNotice />
              </div>
              <div className="w-full mb-4">
                <IntegracoesPanel />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              <ProtectedSection module="Sistema" section={["Configurações","Integrações","NFe"]} action="visualizar">
                <Button onClick={() => openWindow(VisualizadorUniversalEntidade, { nomeEntidade: 'ConfiguracaoNFe', tituloDisplay: 'Configurações NF-e', icone: FileText, componenteEdicao: ConfiguracaoNFeForm, windowMode: true }, { title: 'Configurações NF-e', width: 1000, height: 700 })} className="w-full">
                  <FileText className="w-4 h-4 mr-2" /> Configurações NF-e
                </Button>
              </ProtectedSection>

              <ProtectedSection module="Sistema" section={["Configurações","Integrações","Boletos"]} action="visualizar">
                <Button onClick={() => openWindow(VisualizadorUniversalEntidade, { nomeEntidade: 'ConfiguracaoBoletos', tituloDisplay: 'Configurações Boletos/PIX', icone: DollarSign, componenteEdicao: ConfiguracaoBoletosForm, windowMode: true }, { title: 'Configurações Boletos/PIX', width: 1000, height: 700 })} className="w-full">
                  <DollarSign className="w-4 h-4 mr-2" /> Configurações Boletos/PIX
                </Button>
              </ProtectedSection>

              <ProtectedSection module="Sistema" section={["Configurações","Integrações","WhatsApp"]} action="visualizar">
                <Button onClick={() => openWindow(VisualizadorUniversalEntidade, { nomeEntidade: 'ConfiguracaoWhatsApp', tituloDisplay: 'Configurações WhatsApp', icone: MessageCircle, componenteEdicao: ConfiguracaoWhatsAppForm, windowMode: true }, { title: 'Configurações WhatsApp', width: 1000, height: 700 })} className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" /> Configurações WhatsApp
                </Button>
              </ProtectedSection>

              <ProtectedSection module="Sistema" section={["Configurações","Integrações","Marketplace"]} action="visualizar">
                <Button onClick={() => openWindow(VisualizadorUniversalEntidade, { nomeEntidade: 'ConfiguracaoIntegracaoMarketplace', tituloDisplay: 'Integrações Marketplace', icone: ShoppingCart, componenteEdicao: ConfiguracaoIntegracaoForm, windowMode: true }, { title: 'Integrações Marketplace', width: 1100, height: 750 })} className="w-full">
                  <ShoppingCart className="w-4 h-4 mr-2" /> Integrações Marketplace
                </Button>
              </ProtectedSection>

              <ProtectedSection module="Sistema" section={["Configurações","Integrações","APIs"]} action="visualizar">
                <Button onClick={() => openWindow(VisualizadorUniversalEntidade, { nomeEntidade: 'ApiExterna', tituloDisplay: 'APIs Externas', icone: Link2, componenteEdicao: ApiExternaForm, windowMode: true }, { title: 'APIs Externas', width: 1000, height: 700 })} className="w-full">
                  <Link2 className="w-4 h-4 mr-2" /> APIs Externas
                </Button>
              </ProtectedSection>

              <ProtectedSection module="Sistema" section={["Configurações","Integrações","Webhooks"]} action="visualizar">
                <Button onClick={() => openWindow(VisualizadorUniversalEntidade, { nomeEntidade: 'Webhook', tituloDisplay: 'Webhooks', icone: Link2, componenteEdicao: WebhookForm, windowMode: true }, { title: 'Webhooks', width: 1000, height: 700 })} className="w-full">
                  <Link2 className="w-4 h-4 mr-2" /> Webhooks
                </Button>
              </ProtectedSection>

              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="mt-4">
          <Card className="w-full"><CardContent className="p-4"><StatusIntegracoes empresaId={empresaAtual?.id} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="nfe" className="mt-4">
          <Card className="w-full"><CardContent className="p-4"><TesteNFe configuracao={configuracao} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="boletos" className="mt-4">
          <Card className="w-full"><CardContent className="p-4"><TesteBoletos configuracao={configuracao} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="whatsapp" className="mt-4">
          <Card className="w-full"><CardContent className="p-4"><ConfigWhatsAppBusiness empresaId={empresaAtual?.id} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="transportadoras" className="mt-4">
          <Card className="w-full"><CardContent className="p-4"><TesteTransportadoras configuracao={configuracao} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="maps" className="mt-4">
          <Card className="w-full"><CardContent className="p-4"><TesteGoogleMaps configuracao={configuracao} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="marketplaces" className="mt-4">
          <Card className="w-full"><CardContent className="p-4"><SincronizacaoMarketplacesAtiva /></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}