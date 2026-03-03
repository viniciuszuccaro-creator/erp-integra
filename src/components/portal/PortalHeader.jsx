import React, { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, LogOut } from "lucide-react";
import NotificacoesPortal from "@/components/portal/NotificacoesPortal";
import GamificacaoWidget from "@/components/portal/GamificacaoWidget";

export default function PortalHeader({ user, cliente, hasAprovado, hasFeedback, chatOpen, setChatOpen, handleLogout }) {
  return (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Portal do Cliente</h1>
            <p className="text-sm text-slate-600">{cliente?.nome_fantasia || cliente?.razao_social || user?.full_name}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Suspense fallback={<div className="w-6 h-6 rounded-full bg-slate-200 animate-pulse" />}> 
              <NotificacoesPortal />
            </Suspense>
            <GamificacaoWidget cliente={cliente} hasAprovado={hasAprovado} hasFeedback={hasFeedback} />
            <Button
              onClick={() => setChatOpen(!chatOpen)}
              className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="sm"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Assistente IA</span>
              <span className="sm:hidden">IA</span>
            </Button>
            <Button variant="outline" onClick={handleLogout} size="sm">
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}