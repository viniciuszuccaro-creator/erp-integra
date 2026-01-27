import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Settings, Users, Shield, FileText, Activity, Sparkles } from "lucide-react";
import usePermissions from "@/components/lib/usePermissions";
import ConfiguracoesGeraisIndex from "@/components/administracao-sistema/configuracoes-gerais/ConfiguracoesGeraisIndex";
import GestaoAcessosIndex from "@/components/administracao-sistema/gestao-acessos/GestaoAcessosIndex";
import AuditoriaLogsIndex from "@/components/administracao-sistema/auditoria-logs/AuditoriaLogsIndex";
import SegurancaGovernancaIndex from "@/components/administracao-sistema/seguranca-governanca/SegurancaGovernancaIndex";
import AdminMonitManut from "@/components/administracao-sistema/AdminMonitManut.jsx";
import ProtectedSection from "@/components/security/ProtectedSection";

export default function AdministracaoSistema() {
  const { isAdmin } = usePermissions();
  const params = new URLSearchParams(window.location.search);
  const initialTab = params.get('tab') || 'gerais';

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <header className="p-4 md:p-6 border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Administração do Sistema</h1>
          <div className="text-sm text-slate-500">Hub central • responsivo • w-full / h-full</div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <Tabs defaultValue={initialTab} className="w-full h-full">
          <TabsList className="flex flex-wrap gap-2">
            <TabsTrigger value="gerais" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <div className="flex items-center gap-2"><Settings className="w-4 h-4"/> Gerais</div>
            </TabsTrigger>
            <TabsTrigger value="integracoes" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <div className="flex items-center gap-2"><Settings className="w-4 h-4"/> Integrações</div>
            </TabsTrigger>
            <TabsTrigger value="acessos" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <div className="flex items-center gap-2"><Users className="w-4 h-4"/> Gestão de Acessos</div>
            </TabsTrigger>
            {isAdmin() && (
              <TabsTrigger value="seguranca" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <div className="flex items-center gap-2"><Shield className="w-4 h-4"/> Segurança & Governança</div>
              </TabsTrigger>
            )}
            <TabsTrigger value="ia" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <div className="flex items-center gap-2"><Sparkles className="w-4 h-4"/> IA & Otimização</div>
            </TabsTrigger>
            <TabsTrigger value="monitor" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <div className="flex items-center gap-2"><Activity className="w-4 h-4"/> Monitoramento & Manutenção</div>
            </TabsTrigger>
            <TabsTrigger value="auditoria" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <div className="flex items-center gap-2"><FileText className="w-4 h-4"/> Auditoria</div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gerais" className="mt-4">
            <ProtectedSection module="Sistema" section={["Configurações"]} action="visualizar" fallback={<div className="p-4 text-sm text-slate-500">Acesso restrito às Configurações.</div>}>
              <div className="w-full h-full">
                <ConfiguracoesGeraisIndex initialTab="global" />
              </div>
            </ProtectedSection>
          </TabsContent>

          <TabsContent value="integracoes" className="mt-4">
            <ProtectedSection module="Sistema" section={["Configurações","Integrações"]} action="visualizar" fallback={<div className="p-4 text-sm text-slate-500">Acesso restrito às Integrações.</div>}>
              <div className="w-full h-full">
                <ConfiguracoesGeraisIndex initialTab="integracoes" />
              </div>
            </ProtectedSection>
          </TabsContent>

          <TabsContent value="acessos" className="mt-4">
            <ProtectedSection module="Sistema" section={["Controle de Acesso"]} action="visualizar" fallback={<div className="p-4 text-sm text-slate-500">Acesso restrito à Gestão de Acessos.</div>}>
              <div className="w-full h-full">
                <GestaoAcessosIndex />
              </div>
            </ProtectedSection>
          </TabsContent>

          <TabsContent value="auditoria" className="mt-4">
            <ProtectedSection module="Sistema" section={["Auditoria"]} action="visualizar" fallback={<div className="p-4 text-sm text-slate-500">Acesso restrito à Auditoria.</div>}>
              <div className="w-full h-full">
                <AuditoriaLogsIndex />
              </div>
            </ProtectedSection>
          </TabsContent>

          {isAdmin() && (
            <TabsContent value="seguranca" className="mt-4">
              <ProtectedSection module="Sistema" section={["Segurança"]} action="visualizar" fallback={<div className="p-4 text-sm text-slate-500">Acesso restrito à Segurança.</div>}>
                <div className="w-full h-full">
                  <SegurancaGovernancaIndex />
                </div>
              </ProtectedSection>
            </TabsContent>
          )}
          <TabsContent value="ia" className="mt-4">
            <ProtectedSection module="Sistema" section={["Configurações","IA"]} action="visualizar" fallback={<div className="p-4 text-sm text-slate-500">Acesso restrito à IA.</div>}>
              <div className="w-full h-full">
                <ConfiguracoesGeraisIndex initialTab="ia" />
              </div>
            </ProtectedSection>
          </TabsContent>

          <TabsContent value="monitor" className="mt-4">
            <ProtectedSection module="Sistema" section={["Configurações","Monitoramento"]} action="visualizar" fallback={<div className="p-4 text-sm text-slate-500">Acesso restrito.</div>}>
              <div className="w-full h-full">
                <AdminMonitManut />
              </div>
            </ProtectedSection>
          </TabsContent>
          <TabsContent value="ia" className="mt-4">
            <ProtectedSection module="Sistema" section={["Configurações","IA"]} action="visualizar" fallback={<div className="p-4 text-sm text-slate-500">Acesso restrito à IA.</div>}>
              <div className="w-full h-full">
                <ConfiguracoesGeraisIndex initialTab="ia" />
              </div>
            </ProtectedSection>
          </TabsContent>

          <TabsContent value="monitor" className="mt-4">
            <ProtectedSection module="Sistema" section={["Configurações","Monitoramento"]} action="visualizar" fallback={<div className="p-4 text-sm text-slate-500">Acesso restrito.</div>}>
              <div className="w-full h-full">
                <AdminMonitManut />
              </div>
            </ProtectedSection>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}