import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Settings, Users, Shield, FileText } from "lucide-react";
import usePermissions from "@/components/lib/usePermissions";

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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <Card className="h-full">
                <CardContent className="p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold">
                    <Settings className="w-4 h-4"/> Configurações Gerais
                  </div>
                  <p className="text-sm text-slate-600">Acessar a página atual de configurações enquanto migramos por fases.</p>
                  <div className="mt-auto">
                    <Link to={createPageUrl("ConfiguracoesSistema")}>
                      <Button variant="outline">Abrir página atual de Configurações</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="acessos" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold">
                    <Users className="w-4 h-4"/> Gestão de Acessos
                  </div>
                  <p className="text-sm text-slate-600">Abra os módulos existentes enquanto consolidamos nesta seção.</p>
                  <div className="mt-auto flex gap-2 flex-wrap">
                    <Link to={createPageUrl("GerenciamentoAcessosCompleto")}>
                      <Button variant="outline">Gerenciamento Completo</Button>
                    </Link>
                    <Link to={createPageUrl("Acessos")}>
                      <Button variant="outline">Acessos</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="auditoria" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold">
                    <FileText className="w-4 h-4"/> Auditoria e Logs
                  </div>
                  <p className="text-sm text-slate-600">Visualize a UI atual de auditoria.</p>
                  <div className="mt-auto">
                    <Link to={createPageUrl("AuditoriaUI")}>
                      <Button variant="outline">Abrir Auditoria</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="seguranca" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-5 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                      <Shield className="w-4 h-4"/> Segurança e Governança
                    </div>
                    <p className="text-sm text-slate-600">Acesse o módulo existente de Segurança.</p>
                    <div className="mt-auto">
                      <Link to={createPageUrl("Seguranca")}>
                        <Button variant="outline">Abrir Segurança</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}