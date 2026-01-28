import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWindow } from "@/components/lib/useWindow";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { MessageCircle, Truck, Users, Sparkles, FileText, ShoppingCart, Globe, Cog, MapPinned, Link2, Zap } from "lucide-react";

// Apps e ferramentas já existentes no projeto
import ChatbotDashboard from "@/components/chatbot/ChatbotDashboard";
import AppEntregasMotorista from "@/components/mobile/AppEntregasMotorista";
import DashboardCliente from "@/components/portal/DashboardCliente";
import StatusIntegracoes from "@/components/integracoes/StatusIntegracoes";
import TesteNFe from "@/components/integracoes/TesteNFe";
import TesteBoletos from "@/components/integracoes/TesteBoletos";
import ConfigWhatsAppBusiness from "@/components/integracoes/ConfigWhatsAppBusiness";
import TesteTransportadoras from "@/components/integracoes/TesteTransportadoras";
import TesteGoogleMaps from "@/components/integracoes/TesteGoogleMaps";
import SincronizacaoMarketplacesAtiva from "@/components/integracoes/SincronizacaoMarketplacesAtiva";

export default function ExternalAppsHub() {
  const { openWindow } = useWindow();

  const launch = (Component, props, options) => () => openWindow(Component, { windowMode: true, ...(props || {}) }, { width: 1200, height: 720, ...(options || {}) });

  const items = [
    { title: "Portal do Cliente", icon: Users, color: "text-sky-600", bg: "from-sky-50 to-sky-100", action: launch(DashboardCliente, {}, { title: "Portal do Cliente" }) },
    { title: "Chatbot Dashboard", icon: MessageCircle, color: "text-purple-600", bg: "from-purple-50 to-purple-100", action: launch(ChatbotDashboard, {}, { title: "Chatbot Dashboard" }) },
    { title: "App Motorista", icon: Truck, color: "text-amber-600", bg: "from-amber-50 to-amber-100", action: launch(AppEntregasMotorista, {}, { title: "Apontamento de Entregas" }) },
    { title: "Status Integrações", icon: Sparkles, color: "text-emerald-600", bg: "from-emerald-50 to-emerald-100", action: launch(StatusIntegracoes, {}, { title: "Status de Integrações" }) },
    { title: "Teste NF-e", icon: FileText, color: "text-indigo-600", bg: "from-indigo-50 to-indigo-100", action: launch(TesteNFe, {}, { title: "Teste NF-e" }) },
    { title: "Teste Boletos/PIX", icon: ShoppingCart, color: "text-green-600", bg: "from-green-50 to-green-100", action: launch(TesteBoletos, {}, { title: "Teste Boletos & PIX" }) },
    { title: "Config WhatsApp Business", icon: MessageCircle, color: "text-teal-600", bg: "from-teal-50 to-teal-100", action: launch(ConfigWhatsAppBusiness, {}, { title: "Configurar WhatsApp Business" }) },
    { title: "Teste Transportadoras", icon: Truck, color: "text-orange-600", bg: "from-orange-50 to-orange-100", action: launch(TesteTransportadoras, {}, { title: "Teste de Transportadoras" }) },
    { title: "Teste Google Maps", icon: MapPinned, color: "text-rose-600", bg: "from-rose-50 to-rose-100", action: launch(TesteGoogleMaps, {}, { title: "Teste Google Maps" }) },
    { title: "Sincronização Marketplaces", icon: ShoppingCart, color: "text-fuchsia-600", bg: "from-fuchsia-50 to-fuchsia-100", action: launch(SincronizacaoMarketplacesAtiva, {}, { title: "Sincronização de Marketplaces" }) },
  ];

  return (
    <Card className="w-full h-full border-2 border-slate-200">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
        <CardTitle className="text-lg">Apps Externos e Ferramentas</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((it) => (
            <button
              key={it.title}
              onClick={it.action}
              className={`text-left rounded-xl border hover:shadow-lg transition-all p-4 bg-gradient-to-br ${it.bg}`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-white/70 ${it.color}`}>
                  <it.icon className={`w-5 h-5 ${it.color}`} />
                </div>
                <Zap className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-3">
                <p className="font-semibold text-slate-900 text-sm">{it.title}</p>
                <p className="text-xs text-slate-600">Abrir em janela redimensionável</p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}