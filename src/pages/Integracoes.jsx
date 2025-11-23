import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link2, MessageCircle, FileText, CreditCard, TrendingUp } from "lucide-react";
import CentralIntegracoes from "@/components/integracoes/CentralIntegracoes";
import ConfigWhatsAppBusiness from "@/components/integracoes/ConfigWhatsAppBusiness";
import TesteNFe from "@/components/integracoes/TesteNFe";
import TesteBoletos from "@/components/integracoes/TesteBoletos";

export default function IntegracoesPage() {
  const [activeTab, setActiveTab] = useState("central");

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Link2 className="w-8 h-8 text-blue-600" />
          Integrações & Automação
        </h1>
        <p className="text-slate-600 mt-1">Central de integrações com APIs e serviços externos</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="central" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Link2 className="w-4 h-4 mr-2" />
            Central
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="fiscal" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" />
            Fiscal
          </TabsTrigger>
          <TabsTrigger value="pagamentos" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <CreditCard className="w-4 h-4 mr-2" />
            Pagamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="central">
          <CentralIntegracoes />
        </TabsContent>

        <TabsContent value="whatsapp">
          <ConfigWhatsAppBusiness />
        </TabsContent>

        <TabsContent value="fiscal">
          <TesteNFe />
        </TabsContent>

        <TabsContent value="pagamentos">
          <TesteBoletos />
        </TabsContent>
      </Tabs>
    </div>
  );
}