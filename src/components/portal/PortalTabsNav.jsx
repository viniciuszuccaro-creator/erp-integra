import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Package, Truck, FileText, Send, Target, CheckCircle2, Upload, MessageCircle, MessageSquare, TrendingUp, Calendar, Settings, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PortalTabsNav({ orcamentosCount = 0, chamadosCount = 0 }) {
  return (
    <TabsList className="inline-flex w-auto min-w-full bg-white shadow-sm p-1">
      <TabsTrigger value="dashboard" className="flex items-center gap-2 whitespace-nowrap">
        <LayoutDashboard className="w-4 h-4" />
        <span className="hidden sm:inline">Dashboard</span>
      </TabsTrigger>
      <TabsTrigger value="meus-pedidos" className="flex items-center gap-2 whitespace-nowrap">
        <Package className="w-4 h-4" />
        <span className="hidden sm:inline">Meus Pedidos</span>
      </TabsTrigger>
      <TabsTrigger value="rastreamento" className="flex items-center gap-2 whitespace-nowrap">
        <Truck className="w-4 h-4" />
        <span className="hidden sm:inline">Rastreamento</span>
      </TabsTrigger>
      <TabsTrigger value="documentos-novos" className="flex items-center gap-2 whitespace-nowrap">
        <FileText className="w-4 h-4" />
        <span className="hidden sm:inline">Docs & Boletos</span>
      </TabsTrigger>
      <TabsTrigger value="solicitar-orcamento" className="flex items-center gap-2 whitespace-nowrap">
        <Send className="w-4 h-4" />
        <span className="hidden sm:inline">Solicitar Orçamento</span>
      </TabsTrigger>
      <TabsTrigger value="minhas-oportunidades" className="flex items-center gap-2 whitespace-nowrap">
        <Target className="w-4 h-4" />
        <span className="hidden sm:inline">Oportunidades</span>
      </TabsTrigger>
      <TabsTrigger value="orcamentos" className="flex items-center gap-2 whitespace-nowrap">
        <CheckCircle2 className="w-4 h-4" />
        <span className="hidden sm:inline">Aprovar Orçamentos</span>
        {orcamentosCount > 0 && (
          <Badge className="ml-1 sm:ml-2 bg-orange-600 text-white text-xs animate-pulse">{orcamentosCount}</Badge>
        )}
      </TabsTrigger>
      <TabsTrigger value="projetos" className="flex items-center gap-2 whitespace-nowrap">
        <Upload className="w-4 h-4" />
        <span className="hidden sm:inline">Enviar Projeto</span>
      </TabsTrigger>
      <TabsTrigger value="chat" className="flex items-center gap-2 whitespace-nowrap">
        <MessageCircle className="w-4 h-4" />
        <span className="hidden sm:inline">Chat Vendedor</span>
        <div className="ml-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      </TabsTrigger>
      <TabsTrigger value="chamados" className="flex items-center gap-2 whitespace-nowrap">
        <MessageSquare className="w-4 h-4" />
        <span className="hidden sm:inline">Suporte</span>
        {chamadosCount > 0 && (
          <Badge className="ml-1 sm:ml-2 bg-blue-600 text-white text-xs">{chamadosCount}</Badge>
        )}
      </TabsTrigger>
      <TabsTrigger value="analytics" className="flex items-center gap-2 whitespace-nowrap">
        <TrendingUp className="w-4 h-4" />
        <span className="hidden sm:inline">Analytics</span>
      </TabsTrigger>
      <TabsTrigger value="historico" className="flex items-center gap-2 whitespace-nowrap">
        <Calendar className="w-4 h-4" />
        <span className="hidden sm:inline">Histórico</span>
      </TabsTrigger>
      <TabsTrigger value="configuracoes" className="flex items-center gap-2 whitespace-nowrap">
        <Settings className="w-4 h-4" />
        <span className="hidden sm:inline">Configurações</span>
      </TabsTrigger>
      <TabsTrigger value="ajuda" className="flex items-center gap-2 whitespace-nowrap">
        <HelpCircle className="w-4 h-4" />
        <span className="hidden sm:inline">Ajuda</span>
      </TabsTrigger>
    </TabsList>
  );
}