import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Settings, Users, Shield, FileText, Sparkles, Wrench } from "lucide-react";
import usePermissions from "@/components/lib/usePermissions";
import ProtectedSection from "@/components/security/ProtectedSection";
import ConfiguracoesGeraisIndex from "@/components/administracao-sistema/configuracoes-gerais/ConfiguracoesGeraisIndex";
import IntegracoesIndex from "@/components/administracao-sistema/IntegracoesIndex";
import AuditoriaLogsIndex from "@/components/administracao-sistema/auditoria-logs/AuditoriaLogsIndex";
import SegurancaGovernancaIndex from "@/components/administracao-sistema/seguranca-governanca/SegurancaGovernancaIndex";
import IAOtimizacaoIndex from "@/components/administracao-sistema/IAOtimizacaoIndex";
import GestaoAcessosIndex from "@/components/administracao-sistema/gestao-acessos/GestaoAcessosIndex";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminTabs({ initialTab, isAdmin, empresaAtual, grupoAtual }) {
  const { hasPermission } = usePermissions();
  const isAdminUser = typeof isAdmin === 'function' ? isAdmin() : !!isAdmin;
  const canGerais = hasPermission('Sistema', 'Configurações', 'visualizar');
  const canIntegracoes = hasPermission('Sistema', 'Integrações', 'visualizar');
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
            <div className="flex items-center gap-2"><Sparkles className="w-4 h-4"/> IA & Otimização</div>
          </TabsTrigger>
        )}
        {canAuditoria && (
          <TabsTrigger value="auditoria" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <div className="flex items-center gap-2"><FileText className="w-4 h-4"/> Auditoria e Logs</div>
          </TabsTrigger>
        )}
        {isAdminUser && (
          <TabsTrigger value="ferramentas" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            <div className="flex items-center gap-2"><Wrench className="w-4 h-4"/> Ferramentas</div>
          </TabsTrigger>
        )}
      </TabsList>

      {/* PARÂMETROS GERAIS — Consolidado */}
      <TabsContent value="gerais" className="mt-4">
        <ProtectedSection module="Sistema" section={["Configurações"]} action="visualizar" fallback={<div className="p-4 text-sm text-slate-500">Acesso restrito às Configurações.</div>}>
          <div className="w-full h-full overflow-auto">
            <ConfiguracoesGeraisIndex initialTab="global" />
          </div>
        </ProtectedSection>
      </TabsContent>

      {/* INTEGRAÇÕES — sem card redundante, direto no componente */}
      <TabsContent value="integracoes" className="mt-4">
        <ProtectedSection module="Sistema" section={["Configurações","Integrações"]} action="visualizar" fallback={<div className="p-4 text-sm text-slate-500">Acesso restrito às Integrações.</div>}>
          <div className="w-full h-full">
            <IntegracoesIndex initialTab="gerenciamento" />
          </div>
        </ProtectedSection>
      </TabsContent>

      {/* GESTÃO DE ACESSOS */}
      <TabsContent value="acessos" className="mt-4">
        <ProtectedSection module="Sistema" section={["Controle de Acesso"]} action="visualizar" fallback={<div className="p-4 text-sm text-slate-500">Acesso restrito à Gestão de Acessos.</div>}>
          <div className="w-full overflow-hidden">
            <GestaoAcessosIndex />
          </div>
        </ProtectedSection>
      </TabsContent>

      {/* AUDITORIA */}
      <TabsContent value="auditoria" className="mt-4">
        <ProtectedSection module="Sistema" section={["Auditoria"]} action="visualizar" fallback={<div className="p-4 text-sm text-slate-500">Acesso restrito à Auditoria.</div>}>
          <div className="w-full h-full">
            <AuditoriaLogsIndex />
          </div>
        </ProtectedSection>
      </TabsContent>

      {/* SEGURANÇA — apenas admins */}
      {isAdminUser && (
        <TabsContent value="seguranca" className="mt-4">
          <ProtectedSection module="Sistema" section={["Segurança"]} action="visualizar" fallback={<div className="p-4 text-sm text-slate-500">Acesso restrito à Segurança.</div>}>
            <div className="w-full h-full">
              <SegurancaGovernancaIndex />
            </div>
          </ProtectedSection>
        </TabsContent>
      )}

      {/* FERRAMENTAS — apenas admins, consolidadas aqui */}
      {isAdminUser && (
        <TabsContent value="ferramentas" className="mt-4">
          <div className="w-full space-y-4">
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
              ⚠️ <strong>Ferramentas administrativas</strong> — Use com cautela. Estas operações afetam dados reais do banco.
            </div>
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-slate-900">Seed de Dados (Teste)</h3>
                <p className="text-xs text-slate-500">Cria clientes, produtos e colaboradores de teste com contexto multiempresa atual.</p>
                <Button
                  variant="outline"
                  onClick={async () => {
                    const res = await base44.functions.invoke('seedData', {
                      counts: { clientes: 5, produtos: 10, colaboradores: 5 },
                      group_id: grupoAtual?.id || null,
                      empresa_id: empresaAtual?.id || null,
                    });
                    alert('Seed concluído: ' + JSON.stringify(res?.data?.summary || res?.data, null, 2));
                  }}
                >
                  Executar Seed Leve
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-slate-900">Backfill Multiempresa</h3>
                <p className="text-xs text-slate-500">Dry-run valida e lista correções de group_id/empresa_id; Aplicar executa somente casos inequívocos.</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const res = await base44.functions.invoke('backfillGroupEmpresa', { dryRun: true, apply: false, limitPerEntity: 1000 });
                      alert('Dry-run: ' + JSON.stringify(res?.data?.summary || res?.data, null, 2));
                    }}
                  >
                    Dry-run (visualizar)
                  </Button>
                  <Button
                    className="bg-orange-600 hover:bg-orange-700"
                    onClick={async () => {
                      if (!confirm('Aplicar correções de multiempresa? (apenas casos inequívocos)')) return;
                      const res = await base44.functions.invoke('backfillGroupEmpresa', { dryRun: false, apply: true, limitPerEntity: 1000 });
                      alert('Aplicado: ' + JSON.stringify(res?.data?.summary || res?.data, null, 2));
                    }}
                  >
                    Aplicar Correções
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      )}

      {/* IA & OTIMIZAÇÃO */}
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