import React from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Settings, Users, Shield, FileText, Sparkles, Link2 } from "lucide-react";
import usePermissions from "@/components/lib/usePermissions";
import ProtectedSection from "@/components/security/ProtectedSection";
import ConfiguracoesGeraisIndex from "@/components/administracao-sistema/configuracoes-gerais/ConfiguracoesGeraisIndex";
import IntegracoesIndex from "@/components/administracao-sistema/IntegracoesIndex";

import CentralPerfisAcesso from "@/components/sistema/CentralPerfisAcesso";
import GestaoUsuariosAvancada from "@/components/sistema/GestaoUsuariosAvancada";
import SoDChecker from "@/components/administracao-sistema/gestao-acessos/SoDChecker";
import MonitorAcessoRealtimeSection from "@/components/administracao-sistema/seguranca-governanca/MonitorAcessoRealtimeSection";
import GerenciadorSessoes from "@/components/sistema/GerenciadorSessoes";
import AuditoriaLogsIndex from "@/components/administracao-sistema/auditoria-logs/AuditoriaLogsIndex";
import SegurancaGovernancaIndex from "@/components/administracao-sistema/seguranca-governanca/SegurancaGovernancaIndex";
import IAOtimizacaoIndex from "@/components/administracao-sistema/IAOtimizacaoIndex";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import ExternalAppsHub from "@/components/administracao-sistema/ExternalAppsHub";

export default function AdminTabs({ initialTab, isAdmin, empresaAtual, grupoAtual }) {
  const { hasPermission } = usePermissions();
  const canGerais = hasPermission('Sistema', 'Configurações', 'visualizar');
  const canIntegracoes = hasPermission('Sistema', 'Integrações', 'visualizar');
  const canApps = (typeof isAdmin === 'function' && isAdmin()) || hasPermission('Sistema', 'Integrações', 'gerenciar');
  const canAcessos = hasPermission('Sistema', 'Controle de Acesso', 'visualizar');
  const canSeguranca = hasPermission('Sistema', 'Segurança', 'visualizar');
  const canIA = hasPermission('Sistema', 'IA', 'visualizar');
  const canAuditoria = hasPermission('Sistema', 'Auditoria', 'visualizar');
  return (
    <Tabs defaultValue={initialTab} className="w-full h-full">
      <TabsList className="flex flex-wrap gap-2">
        {canGerais && (
          <TabsTrigger value="gerais" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <div className="flex items-center gap-2"><Settings className="w-4 h-4"/> Parâmetros Gerais</div>
          </TabsTrigger>
        )}
        {canIntegracoes && (
          <TabsTrigger value="integracoes" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <div className="flex items-center gap-2"><Sparkles className="w-4 h-4"/> Integrações</div>
          </TabsTrigger>
        )}
        {canApps && (
          <TabsTrigger value="apps" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <div className="flex items-center gap-2"><Link2 className="w-4 h-4"/> Apps Externos</div>
          </TabsTrigger>
        )}
        {canAcessos && (
          <TabsTrigger value="acessos" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <div className="flex items-center gap-2"><Users className="w-4 h-4"/> Gestão de Acessos</div>
          </TabsTrigger>
        )}
        {canSeguranca && (
          <TabsTrigger value="seguranca" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <div className="flex items-center gap-2"><Shield className="w-4 h-4"/> Segurança & Governança</div>
          </TabsTrigger>
        )}
        {canIA && (
          <TabsTrigger value="ia" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <div className="flex items-center gap-2"><Sparkles className="w-4 h-4"/> Tecnologia, IA & Parâmetros</div>
          </TabsTrigger>
        )}
        {canAuditoria && (
          <TabsTrigger value="auditoria" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <div className="flex items-center gap-2"><FileText className="w-4 h-4"/> Auditoria e Logs</div>
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="gerais" className="mt-4">
        <ProtectedSection module="Sistema" section={["Configurações"]} action="visualizar" fallback={<div className="p-4 text-sm text-slate-500">Acesso restrito às Configurações.</div>}>
          <div className="w-full h-full">
            <ConfiguracoesGeraisIndex initialTab="global" />
            <div className="mt-4 space-y-3">
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

              <div className="flex items-center justify-between bg-white/80 border rounded-lg p-4">
                <div>
                  <div className="font-medium text-slate-900">Backfill Multiempresa (seguro)</div>
                  <div className="text-xs text-slate-500">Dry‑run valida e lista correções de group_id/empresa_id; aplicar executa somente casos inequívocos.</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const res = await base44.functions.invoke('backfillGroupEmpresa', { dryRun: true, apply: false, limitPerEntity: 1000 });
                      console.log('backfill dry-run:', res?.data);
                    }}
                  >
                    Dry‑run
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={async () => {
                      const ok = confirm('Aplicar correções de multiempresa (apenas quando inequívocas)?');
                      if (!ok) return;
                      const res = await base44.functions.invoke('backfillGroupEmpresa', { dryRun: false, apply: true, limitPerEntity: 1000 });
                      console.log('backfill apply:', res?.data);
                    }}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ProtectedSection>
      </TabsContent>

      <TabsContent value="integracoes" className="mt-4">
        <ProtectedSection module="Sistema" section={["Configurações","Integrações"]} action="visualizar" fallback={<div className="p-4 text-sm text-slate-500">Acesso restrito às Integrações.</div>}>
          <div className="w-full h-full space-y-4">
            <Card>
              <CardContent className="p-4">
                <h2 className="font-semibold mb-1">Consolidação aplicada</h2>
                <p className="text-sm text-slate-600 mb-3">APIs Externas, Webhooks e Chatbot Intents agora residem em “Tecnologia, IA & Parâmetros”.</p>
                <div className="flex gap-2">
                  <Link to="/AdministracaoSistema?tab=ia" className="inline-flex">
                    <Button variant="default">Abrir Tecnologia, IA & Parâmetros</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            {/* Integrações: conectores, gateways e status central */}
            <IntegracoesIndex initialTab="gerenciamento" />
          </div>
        </ProtectedSection>
      </TabsContent>

      <TabsContent value="apps" className="mt-4">
        <ProtectedSection module="Sistema" section={["Configurações","Integrações"]} action="visualizar" fallback={<div className="p-4 text-sm text-slate-500">Acesso restrito aos Apps Externos.</div>}>
          <div className="w-full h-full space-y-4">
            {/* Hub principal de Apps Externos (Portal Cliente, App Motorista, Chatbot, Produção Mobile) */}
            <ExternalAppsHub />
            {/* Atalhos para cadastros de apps externos em Cadastros Gerais */}
            <Card>
              <CardContent className="p-4 flex flex-wrap gap-2 items-center">
                <span className="text-sm text-slate-600 mr-2">Cadastros relacionados em:</span>
                <Link to="/Cadastros?tab=cadastros" className="inline-flex">
                  <Button variant="outline" size="sm">Cadastros Gerais → Bloco 6 Tecnologia</Button>
                </Link>
                <Link to="/AdministracaoSistema?tab=integracoes" className="inline-flex">
                  <Button variant="outline" size="sm">Integrações</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </ProtectedSection>
      </TabsContent>

      <TabsContent value="acessos" className="mt-4">
        <ProtectedSection module="Sistema" section={["Controle de Acesso"]} action="visualizar" fallback={<div className="p-4 text-sm text-slate-500">Acesso restrito à Gestão de Acessos.</div>}>
          <div className="w-full h-full flex flex-col gap-4">
            {/* Linha 1: Usuários + Perfis — ocupam 100% e quebram para coluna em mobile */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <Card className="w-full min-w-0">
                <CardContent className="p-4">
                  <h2 className="font-semibold mb-3">Gestão de Usuários</h2>
                  <div className="w-full overflow-x-auto">
                    <GestaoUsuariosAvancada />
                  </div>
                </CardContent>
              </Card>
              <Card className="w-full min-w-0">
                <CardContent className="p-4">
                  <h2 className="font-semibold mb-3">Perfis de Acesso (RBAC)</h2>
                  <div className="w-full overflow-x-auto">
                    <CentralPerfisAcesso />
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Linha 2: Monitor Realtime + Sessões + SoD */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <Card className="w-full min-w-0 md:col-span-2 xl:col-span-2">
                <CardContent className="p-4">
                  <h2 className="font-semibold mb-3">Monitoramento de Acesso em Tempo Real</h2>
                  <MonitorAcessoRealtimeSection />
                </CardContent>
              </Card>
              <Card className="w-full min-w-0">
                <CardContent className="p-4">
                  <h2 className="font-semibold mb-3">Gestão de Sessões</h2>
                  <GerenciadorSessoes />
                </CardContent>
              </Card>
            </div>
            {/* Linha 3: SoD */}
            <Card className="w-full min-w-0">
              <CardContent className="p-4">
                <h2 className="font-semibold mb-3">Verificação SoD — Segregação de Funções</h2>
                <SoDChecker />
              </CardContent>
            </Card>
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
  );
}