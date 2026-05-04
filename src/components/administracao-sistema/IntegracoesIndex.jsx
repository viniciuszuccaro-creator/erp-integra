import React, { useState } from "react";
import { toast } from "sonner";
import { validateAdminControlExecution } from "@/components/administracao-sistema/fase1/adminActionGuards";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ContextoConfigBanner from "@/components/administracao-sistema/common/ContextoConfigBanner";
import HerancaConfigNotice from "@/components/administracao-sistema/common/HerancaConfigNotice";
import TesteNFe from "@/components/integracoes/TesteNFe";
import TesteBoletos from "@/components/integracoes/TesteBoletos";
import ConfigWhatsAppBusiness from "@/components/integracoes/ConfigWhatsAppBusiness";
import TesteTransportadoras from "@/components/integracoes/TesteTransportadoras";
import TesteGoogleMaps from "@/components/integracoes/TesteGoogleMaps";
import StatusIntegracoes from "@/components/integracoes/StatusIntegracoes";

import { useContextoVisual } from "@/components/lib/useContextoVisual";
import useConfiguracaoSistema from "@/components/lib/useConfiguracaoSistema";
import { base44 } from "@/api/base44Client";
import { useUser } from "@/components/lib/UserContext";
import { FileText, DollarSign, MessageCircle, Truck, Globe, ShoppingCart, CheckCircle2, AlertCircle } from "lucide-react";

import SincronizacaoMarketplacesAtiva from "@/components/integracoes/SincronizacaoMarketplacesAtiva";

export default function IntegracoesIndex({ initialTab }) {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const { user } = useUser();
  const [tab, setTab] = useState(initialTab || "gerenciamento");
  const integracoesBase = useConfiguracaoSistema({ chave: empresaAtual?.id ? `integracoes_${empresaAtual.id}` : null, categoria: 'Integracoes', empresaId: empresaAtual?.id, grupoId: grupoAtual?.id });
  const auditoriaDetalhada = useConfiguracaoSistema({ chave: 'seg_auditoria_detalhada', aliases: ['cc_auditoria_automatica'], categoria: 'Seguranca', empresaId: empresaAtual?.id, grupoId: grupoAtual?.id });
  const auditoriaAtiva = auditoriaDetalhada.isEnabled(false);

  const handleTabChange = (next) => {
    setTab(next);
    try {
      base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || "Usuário",
        usuario_id: user?.id,
        empresa_id: empresaAtual?.id || null,
        acao: "Visualização",
        modulo: "Sistema",
        entidade: "Integrações",
        descricao: `Aba visualizada: ${next}`,
        data_hora: new Date().toISOString(),
      });
    } catch {}
  };

  const configuracao = integracoesBase.config || null;

  const nfeOk = !!configuracao?.integracao_nfe?.api_key;
  const boletosOk = !!configuracao?.integracao_boletos?.api_key;
  const webhookUrl = `${window?.location?.origin || ''}/functions/legacyIntegrationsMirror`;

  const handleCriarBase = async () => {
    if (!empresaAtual?.id) return;
    try {
      const guard = await validateAdminControlExecution({ controlId: 'integracoes_empresa_base', empresaId: empresaAtual.id, grupoId: grupoAtual?.id || null });
      if (!guard.allowed) throw new Error(guard.reason);
      const chave = `integracoes_${empresaAtual.id}`;
      await base44.functions.invoke('upsertConfig', {
        chave,
        data: {
          chave,
          categoria: 'Integracoes',
          integracao_nfe: { provedor: null, api_url: null, api_key: null, cnpj_emitente: null, ambiente: 'homologacao' },
          integracao_boletos: { provedor: null, api_url: null, api_key: null, customer_id_default: null, customers_map: {} }
        },
        scope: { empresa_id: empresaAtual.id }
      });
      toast.success('Estrutura base criada com sucesso.');
    } catch (error) {
      toast.error(error?.message || 'Não foi possível criar a estrutura base.');
    }
  };

  const handleTestWebhookAsaasPago = async () => {
    if (!empresaAtual?.id) return;
    try {
      const guard = await validateAdminControlExecution({ controlId: 'integracoes_webhook_asaas', empresaId: empresaAtual.id, grupoId: grupoAtual?.id || null });
      if (!guard.allowed) throw new Error(guard.reason);
      await base44.functions.invoke('legacyIntegrationsMirror', {
        provider: 'asaas',
        empresa_id: empresaAtual.id,
        payment: { id: 'test_payment', status: 'RECEIVED', value: 10 }
      });
      toast.success('Webhook Asaas simulado com sucesso.');
    } catch (error) {
      toast.error(error?.message || 'Falha ao simular webhook Asaas.');
    }
  };

  const handleTestWebhookNFeAutorizada = async () => {
    if (!empresaAtual?.id) return;
    try {
      const guard = await validateAdminControlExecution({ controlId: 'integracoes_webhook_nfe', empresaId: empresaAtual.id, grupoId: grupoAtual?.id || null });
      if (!guard.allowed) throw new Error(guard.reason);
      await base44.functions.invoke('legacyIntegrationsMirror', {
        provider: 'enotas',
        empresa_id: empresaAtual.id,
        nfeId: 'test_nf',
        status: 'autorizada'
      });
      toast.success('NF-e autorizada simulada com sucesso.');
    } catch (error) {
      toast.error(error?.message || 'Falha ao simular NF-e autorizada.');
    }
  };

  const handleCopy = async (text) => {
    try { await navigator.clipboard.writeText(text); } catch (_) {}
  };

   return (
    <div className="w-full h-full min-w-0 flex flex-col overflow-hidden">
      <Tabs value={tab} onValueChange={handleTabChange} className="w-full h-full min-w-0">
        <div className="w-full overflow-x-auto pb-1"><TabsList className="inline-flex min-w-max flex-nowrap gap-2 h-auto">
          <TabsTrigger value="gerenciamento"><CheckCircle2 className="w-4 h-4 mr-2" />Gerenciamento</TabsTrigger>
          <TabsTrigger value="status"><CheckCircle2 className="w-4 h-4 mr-2" />Status</TabsTrigger>
          <TabsTrigger value="nfe"><FileText className="w-4 h-4 mr-2" />NF-e</TabsTrigger>
          <TabsTrigger value="boletos"><DollarSign className="w-4 h-4 mr-2" />Boletos/PIX</TabsTrigger>
          <TabsTrigger value="whatsapp"><MessageCircle className="w-4 h-4 mr-2" />WhatsApp</TabsTrigger>
          <TabsTrigger value="transportadoras"><Truck className="w-4 h-4 mr-2" />Transportadoras</TabsTrigger>
          <TabsTrigger value="maps"><Globe className="w-4 h-4 mr-2" />Maps</TabsTrigger>
          <TabsTrigger value="marketplaces"><ShoppingCart className="w-4 h-4 mr-2" />Marketplaces</TabsTrigger>
        </TabsList></div>

        <TabsContent value="gerenciamento" className="mt-4 min-w-0">
          <Card className="w-full">
            <CardContent className="p-4">
              <div className="w-full mb-3 space-y-2">
                <ContextoConfigBanner />
                <HerancaConfigNotice />
              </div>
              <div className="w-full mb-4 space-y-3">
                <div className="rounded-lg border bg-slate-50 p-3 text-sm text-slate-700">
                  Auditoria detalhada para integrações: <strong>{auditoriaAtiva ? 'ativa antes das execuções' : 'inativa para execuções detalhadas'}</strong>
                </div>
              </div>

              {/* Checklist de Implantação Global */}
              <Card className="w-full mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold mb-2">Checklist de Implantação (empresa atual)</h3>
                    {!configuracao && (
                      <Button variant="outline" onClick={handleCriarBase} disabled={!empresaAtual?.id || !auditoriaAtiva}>
                        Criar estrutura base
                      </Button>
                    )}
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      {nfeOk ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                      )}
                      <span>NF-e: provedor e API key {nfeOk ? 'configurados' : 'pendentes'} em ConfiguracaoSistema → chave integracoes_{'{empresaId}'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      {boletosOk ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                      )}
                      <span>Boletos/PIX: provedor e API key {boletosOk ? 'configurados' : 'pendentes'} (Asaas/Juno)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                      <span>Webhooks: aponte para <code className="px-1 py-0.5 bg-slate-100 rounded">functions/legacyIntegrationsMirror</code> com header <code className="px-1 py-0.5 bg-slate-100 rounded">x-internal-token: DEPLOY_AUDIT_TOKEN</code> (definido no ambiente).</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                      <span>RBAC/Testes: valide permissões de emissão e execute testes E2E (NF-e/Boletos/PIX) — Auditoria registra tudo.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Webhooks & Testes Rápidos */}
              <Card className="w-full mb-4">
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold">Webhooks & Testes Rápidos</h3>
                  <div className="flex items-center gap-2 text-xs">
                    <code className="px-2 py-1 bg-slate-100 rounded flex-1 overflow-x-auto">{webhookUrl}</code>
                    <Button size="sm" variant="outline" onClick={() => handleCopy(webhookUrl)}>Copiar URL</Button>
                  </div>
                  <div className="text-xs text-slate-600">Header: x-internal-token: <span className="font-mono">DEPLOY_AUDIT_TOKEN</span></div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={handleTestWebhookAsaasPago} disabled={!empresaAtual?.id || !auditoriaAtiva}>Testar webhook Asaas (pago)</Button>
                    <Button size="sm" onClick={handleTestWebhookNFeAutorizada} disabled={!empresaAtual?.id || !auditoriaAtiva}>Simular NF-e autorizada</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Atalho para Cadastros Gerais — evita duplicação */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                💡 <strong>Configurações de NF-e, Boletos, WhatsApp, APIs Externas e Webhooks</strong> estão centralizadas em <strong>Cadastros Gerais → Tecnologia, IA & Parâmetros</strong>. Este módulo fica focado em status, checklist, webhooks e testes técnicos.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="mt-4 min-w-0">
          <Card className="w-full min-w-0"><CardContent className="p-4 min-w-0 overflow-x-auto"><StatusIntegracoes empresaId={empresaAtual?.id} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="nfe" className="mt-4 min-w-0">
          <Card className="w-full min-w-0"><CardContent className="p-4 min-w-0 overflow-x-auto"><TesteNFe configuracao={configuracao} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="boletos" className="mt-4 min-w-0">
          <Card className="w-full min-w-0"><CardContent className="p-4 min-w-0 overflow-x-auto"><TesteBoletos configuracao={configuracao} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="whatsapp" className="mt-4 min-w-0">
          <Card className="w-full min-w-0"><CardContent className="p-4 min-w-0 overflow-x-auto"><ConfigWhatsAppBusiness empresaId={empresaAtual?.id} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="transportadoras" className="mt-4 min-w-0">
          <Card className="w-full min-w-0"><CardContent className="p-4 min-w-0 overflow-x-auto"><TesteTransportadoras configuracao={configuracao} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="maps" className="mt-4 min-w-0">
          <Card className="w-full min-w-0"><CardContent className="p-4 min-w-0 overflow-x-auto"><TesteGoogleMaps configuracao={configuracao} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="marketplaces" className="mt-4 min-w-0">
          <Card className="w-full min-w-0"><CardContent className="p-4 min-w-0 overflow-x-auto"><SincronizacaoMarketplacesAtiva /></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}