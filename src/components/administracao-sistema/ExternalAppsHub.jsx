import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWindow } from "@/components/lib/useWindow";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { MessageCircle, Truck, Users, Zap, Factory } from "lucide-react";

// Apps e ferramentas já existentes no projeto
import ChatbotDashboard from "@/components/chatbot/ChatbotDashboard";
import AppEntregasMotorista from "@/components/mobile/AppEntregasMotorista";
import DashboardCliente from "@/components/portal/DashboardCliente";
import ApontamentoProducao from "@/components/producao/ApontamentoProducao";
import ChatCliente from "@/components/portal/ChatCliente";

export default function ExternalAppsHub() {
  const { openWindow } = useWindow();

  const launch = (Component, props, options) => () => openWindow(Component, { windowMode: true, ...(props || {}) }, { width: 1200, height: 720, ...(options || {}) });

  const items = [
    { title: "Portal do Cliente", icon: Users, color: "text-sky-600", bg: "from-sky-50 to-sky-100", action: launch(DashboardCliente, {}, { title: "Portal do Cliente" }) },
    { title: "Chatbot Dashboard", icon: MessageCircle, color: "text-purple-600", bg: "from-purple-50 to-purple-100", action: launch(ChatbotDashboard, {}, { title: "Chatbot Dashboard" }) },
    { title: "App Motorista", icon: Truck, color: "text-amber-600", bg: "from-amber-50 to-amber-100", action: launch(AppEntregasMotorista, {}, { title: "Apontamento de Entregas" }) },
    { title: "Apontamento da Produção", icon: Factory, color: "text-emerald-600", bg: "from-emerald-50 to-emerald-100", action: launch(ApontamentoProducao, {}, { title: "Apontamento da Produção" }) },
    { title: "Chat do Cliente", icon: MessageCircle, color: "text-indigo-600", bg: "from-indigo-50 to-indigo-100", action: launch(ChatCliente, {}, { title: "Chat do Cliente" }) },
    // Itens de integração foram centralizados em Administração > Integrações

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