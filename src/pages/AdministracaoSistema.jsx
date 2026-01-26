import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Settings, Users, Shield, FileText } from "lucide-react";
import usePermissions from "@/components/lib/usePermissions";
import ConfiguracoesGeraisIndex from "@/components/administracao-sistema/configuracoes-gerais/ConfiguracoesGeraisIndex";
import GestaoAcessosIndex from "@/components/administracao-sistema/gestao-acessos/GestaoAcessosIndex";
import AuditoriaLogsIndex from "@/components/administracao-sistema/auditoria-logs/AuditoriaLogsIndex";
import SegurancaGovernancaIndex from "@/components/administracao-sistema/seguranca-governanca/SegurancaGovernancaIndex";

export default function AdministracaoSistema() {
  const { isAdmin } = usePermissions();

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <header className="p-4 md:p-6 border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Administração do Sistema</h1>
          <div className="text-sm text-slate-500">Hub central • responsivo • w-full / h-full</div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <Tabs defaultValue="config" className="w-full">
          <TabsList className="flex flex-wrap gap-2">
            <TabsTrigger value="config" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <div className="flex items-center gap-2"><Settings className="w-4 h-4"/> Configurações</div>
            </TabsTrigger>
            <TabsTrigger value="acessos" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <div className="flex items-center gap-2"><Users className="w-4 h-4"/> Acessos</div>
            </TabsTrigger>
            <TabsTrigger value="auditoria" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <div className="flex items-center gap-2"><FileText className="w-4 h-4"/> Auditoria</div>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="seguranca" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <div className="flex items-center gap-2"><Shield className="w-4 h-4"/> Segurança</div>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="config" className="mt-4">
            <div className="w-full h-full">
              <ConfiguracoesGeraisIndex />
            </div>
          </TabsContent>

          <TabsContent value="acessos" className="mt-4">
            <div className="w-full h-full">
              <GestaoAcessosIndex />
            </div>
          </TabsContent>

          <TabsContent value="auditoria" className="mt-4">
            <div className="w-full h-full">
              <AuditoriaLogsIndex />
            </div>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="seguranca" className="mt-4">
              <div className="w-full h-full">
                <SegurancaGovernancaIndex />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}