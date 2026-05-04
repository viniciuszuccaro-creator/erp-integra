import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Settings, Users, Shield, FileText, Wrench, Brain, Plug } from "lucide-react";
import usePermissions from "@/components/lib/usePermissions";
import ProtectedSection from "@/components/security/ProtectedSection";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { validateAdminControlExecution } from "@/components/administracao-sistema/fase1/adminActionGuards";

// Lazy sub-modules para não carregar tudo ao mesmo tempo
import AdminStatusBar from "@/components/administracao-sistema/AdminStatusBar";
import ConfiguracoesGeraisIndex from "@/components/administracao-sistema/configuracoes-gerais/ConfiguracoesGeraisIndex";
import IntegracoesIndex from "@/components/administracao-sistema/IntegracoesIndex";
import AuditoriaLogsIndex from "@/components/administracao-sistema/auditoria-logs/AuditoriaLogsIndex";
import SegurancaGovernancaIndex from "@/components/administracao-sistema/seguranca-governanca/SegurancaGovernancaIndex";
import IAOtimizacaoIndex from "@/components/administracao-sistema/IAOtimizacaoIndex";
import GestaoAcessosIndex from "@/components/administracao-sistema/gestao-acessos/GestaoAcessosIndex";

const TAB_DEFS = [
  { value: "gerais",      label: "Parâmetros Gerais",     icon: Settings,  perm: "Configurações",    color: "blue" },
  { value: "integracoes", label: "Integrações",            icon: Plug,      perm: "Integrações",      color: "blue" },
  { value: "acessos",     label: "Gestão de Acessos",     icon: Users,     perm: "Controle de Acesso",color: "blue" },
  { value: "seguranca",   label: "Segurança & Gov.",      icon: Shield,    perm: "Segurança",        color: "blue" },
  { value: "ia",          label: "IA & Otimização",        icon: Brain,     perm: "IA",               color: "purple" },
  { value: "auditoria",   label: "Auditoria e Logs",      icon: FileText,  perm: "Auditoria",        color: "blue" },
];

export default function AdminTabs({ initialTab, isAdmin, empresaAtual, grupoAtual }) {
  const { hasPermission } = usePermissions();
  const isAdminUser = typeof isAdmin === 'function' ? isAdmin() : !!isAdmin;
  const [activeTab, setActiveTab] = useState(initialTab || "gerais");

  // Sync com URL param ao navegar externamente
  useEffect(() => {
    if (initialTab && initialTab !== activeTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Atualiza URL sem recarregar a página
  const handleTabChange = async (val) => {
    setActiveTab(val);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", val);
      window.history.replaceState({}, "", url.toString());
    } catch (_) {}
    await logAdminAction(`Aba administrativa aberta: ${val}`, { tab: val, permitted: true });
  };

  const canAccess = (perm) => isAdminUser || hasPermission('Sistema', perm, 'visualizar') || hasPermission('Sistema', perm, 'ver');
  const visibleTabs = TAB_DEFS.filter(t => canAccess(t.perm));

  const logAdminAction = async (descricao, dados_novos = null) => {
    try {
      await base44.entities.AuditLog.create({
        usuario: 'Administrador',
        acao: 'Visualização',
        modulo: 'Sistema',
        tipo_auditoria: 'ui',
        entidade: 'Administração do Sistema',
        descricao,
        dados_novos,
        data_hora: new Date().toISOString(),
        empresa_id: empresaAtual?.id || null,
      });
    } catch {}
  };

  // Garante que o tab ativo seja válido
  const resolvedTab = visibleTabs.find(t => t.value === activeTab)
    ? activeTab
    : (visibleTabs[0]?.value || "gerais");

  const triggerClass = (color) =>
    color === "purple"
      ? "data-[state=active]:bg-purple-600 data-[state=active]:text-white"
      : "data-[state=active]:bg-blue-600 data-[state=active]:text-white";

  return (
    <Tabs value={resolvedTab} onValueChange={handleTabChange} className="w-full h-full min-w-0">
      <div className="w-full overflow-x-auto pb-1"><TabsList className="inline-flex min-w-max flex-nowrap gap-1 h-auto bg-slate-100 p-1 rounded-xl">
        {visibleTabs.map(({ value, label, icon: Icon, color }) => (
          <TabsTrigger
            key={value}
            value={value}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${triggerClass(color)}`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </TabsTrigger>
        ))}
        {isAdminUser && (
          <TabsTrigger
            value="ferramentas"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium data-[state=active]:bg-orange-600 data-[state=active]:text-white"
          >
            <Wrench className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Ferramentas</span>
          </TabsTrigger>
        )}
      </TabsList></div>

      {/* ── STATUS BAR GLOBAL ── */}
      <div className="mt-3">
        <AdminStatusBar />
      </div>

      {/* ── PARÂMETROS GERAIS ── */}
      <TabsContent value="gerais" className="mt-4">
        <ProtectedSection
          module="Sistema" section={["Configurações"]} action="visualizar"
          fallback={<p className="p-4 text-sm text-slate-500">Acesso restrito às Configurações.</p>}
        >
          <div className="w-full h-full overflow-auto">
            <ConfiguracoesGeraisIndex />
          </div>
        </ProtectedSection>
      </TabsContent>

      {/* ── INTEGRAÇÕES ── */}
      <TabsContent value="integracoes" className="mt-4">
        <ProtectedSection
          module="Sistema" section={["Integrações"]} action="visualizar"
          fallback={<p className="p-4 text-sm text-slate-500">Acesso restrito às Integrações.</p>}
        >
          <div className="w-full h-full">
            <IntegracoesIndex />
          </div>
        </ProtectedSection>
      </TabsContent>

      {/* ── GESTÃO DE ACESSOS ── */}
      <TabsContent value="acessos" className="mt-4">
        <ProtectedSection
          module="Sistema" section={["Controle de Acesso"]} action="visualizar"
          fallback={<p className="p-4 text-sm text-slate-500">Acesso restrito à Gestão de Acessos.</p>}
        >
          <div className="w-full overflow-hidden">
            <GestaoAcessosIndex />
          </div>
        </ProtectedSection>
      </TabsContent>

      {/* ── SEGURANÇA & GOVERNANÇA ── */}
      <TabsContent value="seguranca" className="mt-4">
        <ProtectedSection
          module="Sistema" section={["Segurança"]} action="visualizar"
          fallback={<p className="p-4 text-sm text-slate-500">Acesso restrito à Segurança.</p>}
        >
          <div className="w-full h-full">
            <SegurancaGovernancaIndex />
          </div>
        </ProtectedSection>
      </TabsContent>

      {/* ── IA & OTIMIZAÇÃO ── */}
      <TabsContent value="ia" className="mt-4">
        <ProtectedSection
          module="Sistema" section={["IA"]} action="visualizar"
          fallback={<p className="p-4 text-sm text-slate-500">Acesso restrito às configurações de IA.</p>}
        >
          <div className="w-full h-full">
            <IAOtimizacaoIndex />
          </div>
        </ProtectedSection>
      </TabsContent>

      {/* ── AUDITORIA E LOGS ── */}
      <TabsContent value="auditoria" className="mt-4">
        <ProtectedSection
          module="Sistema" section={["Auditoria"]} action="visualizar"
          fallback={<p className="p-4 text-sm text-slate-500">Acesso restrito à Auditoria.</p>}
        >
          <div className="w-full h-full">
            <AuditoriaLogsIndex />
          </div>
        </ProtectedSection>
      </TabsContent>

      {/* ── FERRAMENTAS (admin only) ── */}
      {isAdminUser && (
        <TabsContent value="ferramentas" className="mt-4">
          <AdminFerramentas empresaAtual={empresaAtual} grupoAtual={grupoAtual} />
        </TabsContent>
      )}
    </Tabs>
  );
}

function AdminFerramentas({ empresaAtual, grupoAtual }) {
  const [loadingSeed, setLoadingSeed] = useState(false);
  const [loadingBackfillDry, setLoadingBackfillDry] = useState(false);
  const [loadingBackfillApply, setLoadingBackfillApply] = useState(false);

  const runSeed = async () => {
    setLoadingSeed(true);
    try {
      const guard = await validateAdminControlExecution({ controlId: 'seedData', empresaId: empresaAtual?.id || null, grupoId: grupoAtual?.id || null });
      if (!guard.allowed) throw new Error(guard.reason);
      const res = await base44.functions.invoke('seedData', {
        counts: { clientes: 5, produtos: 10, colaboradores: 5 },
        group_id: grupoAtual?.id || null,
        empresa_id: empresaAtual?.id || null,
      });
      await base44.entities.AuditLog.create({ usuario: 'Administrador', acao: 'Execução', modulo: 'Sistema', tipo_auditoria: 'sistema', entidade: 'Ferramentas Admin', descricao: 'Seed administrativo executado', dados_novos: { empresa_id: empresaAtual?.id || null }, data_hora: new Date().toISOString() });
      toast.success('Seed concluído: ' + JSON.stringify(res?.data?.summary || {}, null, 2));
    } catch (err) {
      toast.error('Erro no seed: ' + err?.message);
    } finally {
      setLoadingSeed(false);
    }
  };

  const runBackfillDry = async () => {
    setLoadingBackfillDry(true);
    try {
      const guard = await validateAdminControlExecution({ controlId: 'backfillDry', empresaId: empresaAtual?.id || null, grupoId: grupoAtual?.id || null });
      if (!guard.allowed) throw new Error(guard.reason);
      const res = await base44.functions.invoke('backfillGroupEmpresa', { dryRun: true, apply: false, limitPerEntity: 1000 });
      await base44.entities.AuditLog.create({ usuario: 'Administrador', acao: 'Execução', modulo: 'Sistema', tipo_auditoria: 'sistema', entidade: 'Ferramentas Admin', descricao: 'Backfill dry-run executado', data_hora: new Date().toISOString() });
      toast.success('Dry-run: ' + JSON.stringify(res?.data?.summary || {}, null, 2));
    } catch (err) {
      toast.error('Erro: ' + err?.message);
    } finally {
      setLoadingBackfillDry(false);
    }
  };

  const runBackfillApply = async () => {
    if (!confirm('Aplicar correções de multiempresa? (apenas casos inequívocos)')) return;
    setLoadingBackfillApply(true);
    try {
      const guard = await validateAdminControlExecution({ controlId: 'backfillApply', empresaId: empresaAtual?.id || null, grupoId: grupoAtual?.id || null });
      if (!guard.allowed) throw new Error(guard.reason);
      const res = await base44.functions.invoke('backfillGroupEmpresa', { dryRun: false, apply: true, limitPerEntity: 1000 });
      await base44.entities.AuditLog.create({ usuario: 'Administrador', acao: 'Execução', modulo: 'Sistema', tipo_auditoria: 'sistema', entidade: 'Ferramentas Admin', descricao: 'Backfill apply executado', data_hora: new Date().toISOString() });
      toast.success('Aplicado: ' + JSON.stringify(res?.data?.summary || {}, null, 2));
    } catch (err) {
      toast.error('Erro: ' + err?.message);
    } finally {
      setLoadingBackfillApply(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
        ⚠️ <strong>Ferramentas administrativas</strong> — Use com cautela. Estas operações afetam dados reais do banco.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-slate-900">Seed de Dados (Teste)</h3>
            <p className="text-xs text-slate-500">Cria clientes, produtos e colaboradores de teste com contexto multiempresa atual.</p>
            <Button variant="outline" onClick={runSeed} disabled={loadingSeed || !empresaAtual?.id}>
              {loadingSeed ? 'Executando…' : 'Executar Seed Leve'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-slate-900">Backfill Multiempresa</h3>
            <p className="text-xs text-slate-500">Dry-run valida e lista correções de group_id/empresa_id; Aplicar executa somente casos inequívocos.</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={runBackfillDry} disabled={loadingBackfillDry}>
                {loadingBackfillDry ? 'Analisando…' : 'Dry-run (visualizar)'}
              </Button>
              <Button
                className="bg-orange-600 hover:bg-orange-700 text-white"
                onClick={runBackfillApply}
                disabled={loadingBackfillApply}
              >
                {loadingBackfillApply ? 'Aplicando…' : 'Aplicar Correções'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}