import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWindow } from "@/components/lib/useWindow";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { MessageCircle, Truck, Users, Zap, Factory, Smartphone, ShoppingCart, ExternalLink } from "lucide-react";

// Apps e ferramentas já existentes no projeto
import ChatbotDashboard from "@/components/chatbot/ChatbotDashboard";
import AppEntregasMotorista from "@/components/mobile/AppEntregasMotorista";
import DashboardCliente from "@/components/portal/DashboardCliente";
import ApontamentoProducao from "@/components/producao/ApontamentoProducao";
import ChatCliente from "@/components/portal/ChatCliente";
import ProducaoMobile from "@/pages/ProducaoMobile";
import OrcamentoSite from "@/pages/OrcamentoSite";

export default function ExternalAppsHub() {
  const { openWindow } = useWindow();

  const launch = (Component, props, options) => () => openWindow(Component, { windowMode: true, ...(props || {}) }, { width: 1200, height: 720, ...(options || {}) });

  const items = [
    { title: "Portal do Cliente", icon: Users, color: "text-sky-600", bg: "from-sky-50 to-sky-100", action: launch(DashboardCliente, {}, { title: "Portal do Cliente" }), desc: "Acesso do cliente aos pedidos e financeiro" },
    { title: "Chatbot Dashboard", icon: MessageCircle, color: "text-purple-600", bg: "from-purple-50 to-purple-100", action: launch(ChatbotDashboard, {}, { title: "Chatbot Dashboard" }), desc: "Central de atendimento automatizado" },
    { title: "App Motorista", icon: Truck, color: "text-amber-600", bg: "from-amber-50 to-amber-100", action: launch(AppEntregasMotorista, {}, { title: "Apontamento de Entregas" }), desc: "App de entrega para motoristas" },
    { title: "Apontamento da Produção", icon: Factory, color: "text-emerald-600", bg: "from-emerald-50 to-emerald-100", action: launch(ApontamentoProducao, {}, { title: "Apontamento da Produção" }), desc: "Registro de produção no chão de fábrica" },
    { title: "Apontamento Mobile", icon: Smartphone, color: "text-teal-600", bg: "from-teal-50 to-teal-100", action: launch(ProducaoMobile, {}, { title: "Apontamento Mobile" }), desc: "Versão mobile para produção" },
    { title: "Chat do Cliente", icon: MessageCircle, color: "text-indigo-600", bg: "from-indigo-50 to-indigo-100", action: launch(ChatCliente, {}, { title: "Chat do Cliente" }), desc: "Chat em tempo real com o cliente" },
    { title: "Orçamento (Site Público)", icon: ShoppingCart, color: "text-rose-600", bg: "from-rose-50 to-rose-100", action: launch(OrcamentoSite, {}, { title: "Orçamento Site Público" }), desc: "Formulário público de orçamento" },
  ];

  return (
    <Card className="w-full h-full border-2 border-slate-200">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
        <CardTitle className="text-lg">📱 Apps, Portais & Ambientes Externos</CardTitle>
        <p className="text-sm text-slate-500 mt-1">Portal do Cliente, App Motorista, Chatbot, Produção Mobile e Orçamento Público — tudo em um só lugar</p>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((it) => (
            <button
              key={it.title}
              onClick={it.action}
              className={`text-left rounded-xl border hover:shadow-lg transition-all p-4 bg-gradient-to-br ${it.bg} w-full`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-white/70`}>
                  <it.icon className={`w-5 h-5 ${it.color}`} />
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-3">
                <p className="font-semibold text-slate-900 text-sm">{it.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{it.desc}</p>
                <p className="text-xs text-slate-400 mt-1">Abrir em janela flutuante</p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}