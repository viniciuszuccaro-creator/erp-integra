import React, { Suspense, lazy } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Settings, Users, Shield, FileText, Sparkles, Link2 } from "lucide-react";
import ModuleLayout from "@/components/layout/ModuleLayout";
import ModuleContent from "@/components/layout/ModuleContent";
import usePermissions from "@/components/lib/usePermissions";
import { useUser } from "@/components/lib/UserContext";
import ConfiguracoesGeraisIndex from "@/components/administracao-sistema/configuracoes-gerais/ConfiguracoesGeraisIndex";
import GestaoAcessosIndex from "@/components/administracao-sistema/gestao-acessos/GestaoAcessosIndex";
import AuditoriaLogsIndex from "@/components/administracao-sistema/auditoria-logs/AuditoriaLogsIndex";
import SegurancaGovernancaIndex from "@/components/administracao-sistema/seguranca-governanca/SegurancaGovernancaIndex";
import IntegracoesIndex from "@/components/administracao-sistema/IntegracoesIndex";
import IAOtimizacaoIndex from "@/components/administracao-sistema/IAOtimizacaoIndex";
import ExternalAppsHub from "@/components/administracao-sistema/ExternalAppsHub";
import GestaoUsuariosAvancada from "@/components/sistema/GestaoUsuariosAvancada";
import CentralPerfisAcesso from "@/components/sistema/CentralPerfisAcesso";
import SoDChecker from "@/components/administracao-sistema/gestao-acessos/SoDChecker";
import MonitorAcessoRealtimeSection from "@/components/administracao-sistema/seguranca-governanca/MonitorAcessoRealtimeSection";
import GerenciadorSessoes from "@/components/sistema/GerenciadorSessoes";

 import ProtectedSection from "@/components/security/ProtectedSection";

 const PortalCliente = lazy(() => import("./PortalCliente"));

 export default function AdministracaoSistema() {
  const { isAdmin } = usePermissions();
  const { user } = useUser();
  const params = new URLSearchParams(window.location.search);
  const initialTab = params.get('tab') || 'gerais';
  const { empresaAtual, grupoAtual } = useContextoVisual();

  // RBAC cliente-only: se não for admin, renderiza Portal do Cliente reutilizando a página existente
  if (!isAdmin()) {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-600">Carregando Portal…</div>}>
        <PortalCliente />
      </Suspense>
    );
  }

  return (
    <ProtectedSection module="Sistema" action="visualizar">
    <ModuleLayout title="Administração do Sistema">
      <header className="p-4 md:p-6 border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Administração do Sistema</h1>
          <div className="text-sm text-slate-500">Hub central • responsivo • w-full / h-full</div>
        </div>
      </header>

      <ModuleContent>
        <div className="p-4 md:p-6">
        <Tabs defaultValue={initialTab} className="w-full h-full">
          <TabsList className="flex flex-wrap gap-2">
            <TabsTrigger value="gerais" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <div className="flex items-center gap-2"><Settings className="w-4 h-4"/> Gerais</div>
            </TabsTrigger>
            <TabsTrigger value="integracoes" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <div className="flex items-center gap-2"><Sparkles className="w-4 h-4"/> Integrações</div>
            </TabsTrigger>
            <TabsTrigger value="apps" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <div className="flex items-center gap-2"><Link2 className="w-4 h-4"/> Apps Externos</div>
            </TabsTrigger>
            <TabsTrigger value="acessos" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <div className="flex items-center gap-2"><Users className="w-4 h-4"/> Gestão de Acessos</div>
            </TabsTrigger>
            <TabsTrigger value="seguranca" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <div className="flex items-center gap-2"><Shield className="w-4 h-4"/> Segurança & Governança</div>
            </TabsTrigger>
            <TabsTrigger value="ia" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <div className="flex items-center gap-2"><Sparkles className="w-4 h-4"/> IA & Otimização</div>
            </TabsTrigger>

            <TabsTrigger value="auditoria" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <div className="flex items-center gap-2"><FileText className="w-4 h-4"/> Auditoria e Logs</div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gerais" className="mt-4">
            <ProtectedSection module="Sistema" section={["Configurações"]} action="visualizar" fallback={<div className="p-4 text-sm text-slate-500">Acesso restrito às Configurações.</div>}>
              <div className="w-full h-full">
                <ConfiguracoesGeraisIndex initialTab="global" />
                <div className="mt-4">
                  <div className="flex items-center justify-between bg-white/80 border rounded-lg p-4">
                    <div>
                      <div className="font-medium text-slate-900">Seed leve de dados (smoke test)</div>
                      <div className="text-xs text-slate-500">Cria alguns clientes, produtos e colaboradores com multiempresa atual.</div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        const payload = {
                          counts: { clientes: 5, produtos: 10, colaboradores: 5 },
                          group_id: grupoAtual?.id || null,
                          empresa_id: empresaAtual?.id || null,
                        };
                        const res = await base44.functions.invoke('seedData', payload);
                        console.log('seedData:', res?.data);
                      }}
                    >
                      Executar seed leve
                    </Button>
                  </div>
                </div>
              </div>
            </ProtectedSection>
          </TabsContent>

          <TabsContent value="integracoes" className="mt-4">
            <ProtectedSection module="Sistema" section={["Configurações","Integrações"]} action="visualizar" fallback={<div className="p-4 text-sm text-slate-500">Acesso restrito às Integrações.</div>}>
              <div className="w-full h-full">
                <IntegracoesIndex initialTab="gerenciamento" />
              </div>
            </ProtectedSection>
          </TabsContent>

          <TabsContent value="apps" className="mt-4">
            <ProtectedSection module="Sistema" section={["Configurações","Integrações"]} action="visualizar" fallback={<div className="p-4 text-sm text-slate-500">Acesso restrito aos Apps Externos.</div>}>
              <div className="w-full h-full">
                <ExternalAppsHub />
              </div>
            </ProtectedSection>
          </TabsContent>

          <TabsContent value="acessos" className="mt-4">
            <ProtectedSection module="Sistema" section={["Controle de Acesso"]} action="visualizar" fallback={<div className="p-4 text-sm text-slate-500">Acesso restrito à Gestão de Acessos.</div>}>
              <div className="w-full h-full space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  <Card className="col-span-1 xl:col-span-2">
                    <CardContent className="p-4">
                      <h2 className="font-semibold mb-3">Gestão de Usuários</h2>
                      <GestaoUsuariosAvancada />
                    </CardContent>
                  </Card>

                  <Card className="col-span-1 xl:col-span-2">
                    <CardContent className="p-4">
                      <h2 className="font-semibold mb-3">Perfis de Acesso</h2>
                      <CentralPerfisAcesso />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h2 className="font-semibold mb-3">Verificação SoD (Segregação de Funções)</h2>
                      <SoDChecker />
                    </CardContent>
                  </Card>

                  <Card className="col-span-1 xl:col-span-2">
                    <CardContent className="p-4">
                      <h2 className="font-semibold mb-3">Monitoramento de Acesso em Tempo Real</h2>
                      <MonitorAcessoRealtimeSection />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h2 className="font-semibold mb-3">Gestão de Sessões</h2>
                      <GerenciadorSessoes />
                    </CardContent>
                  </Card>
                </div>

                <div className="hidden">
                  {/* Conteúdo legado agregado em um painel secundário, mantendo regras de não remoção */}
                  <GestaoAcessosIndex />
                </div>
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
                <IAOtimizacaoIndex initialTab="ia" />
              </div>
            </ProtectedSection>
          </TabsContent>





        </Tabs>
        </div>
      </ModuleContent>
    </ModuleLayout>
    </ProtectedSection>
  );
}