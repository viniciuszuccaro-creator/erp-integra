import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import usePermissions from "@/components/lib/usePermissions";
import SegurancaDashboard from "@/components/administracao-sistema/seguranca-governanca/SegurancaDashboard";

import IAGovernancaComplianceSection from "@/components/administracao-sistema/seguranca-governanca/IAGovernancaComplianceSection";
import MonitoramentoManutencaoIndex from "@/components/administracao-sistema/MonitoramentoManutencaoIndex";
import ConfiguracaoSeguranca from "@/components/sistema/ConfiguracaoSeguranca";


import { useContextoVisual } from "@/components/lib/useContextoVisual";
import useConfiguracaoSistema from "@/components/lib/useConfiguracaoSistema";
import ContextoConfigBanner from "@/components/administracao-sistema/common/ContextoConfigBanner";
import HerancaConfigNotice from "@/components/administracao-sistema/common/HerancaConfigNotice";

export default function SegurancaGovernancaIndex() {
  const { isAdmin } = usePermissions();
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const mfaConfig = useConfiguracaoSistema({ chave: 'seg_login_duplo_fator', aliases: ['cc_exigir_mfa'], empresaId: empresaAtual?.id, grupoId: grupoAtual?.id, categoria: 'Seguranca' });
  const auditConfig = useConfiguracaoSistema({ chave: 'seg_auditoria_detalhada', aliases: ['cc_auditoria_automatica'], empresaId: empresaAtual?.id, grupoId: grupoAtual?.id, categoria: 'Seguranca' });
  const iaSecurityConfig = useConfiguracaoSistema({ chave: 'seg_ia_seguranca', aliases: ['cc_ia_seguranca_ativa'], empresaId: empresaAtual?.id, grupoId: grupoAtual?.id, categoria: 'Sistema' });
  const params = new URLSearchParams(window.location.search);
  const segTab = params.get('segTab') || 'politicas';
  if (!isAdmin()) return <div className="p-4 text-sm text-slate-500">Acesso restrito.</div>;

  return (
    <div className="w-full h-full flex flex-col">
      <Tabs defaultValue={segTab} className="w-full h-full">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="politicas">Políticas</TabsTrigger>
          <TabsTrigger value="manutencao">Monitoramento & Manutenção</TabsTrigger>
          <TabsTrigger value="compliance">Compliance IA</TabsTrigger>
        </TabsList>

        <TabsContent value="politicas" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <ContextoConfigBanner />
              <HerancaConfigNotice />
              <div className="grid gap-3 md:grid-cols-3 mb-4">
                <div className="rounded-lg border bg-slate-50 p-3 text-sm">
                  <div className="text-slate-500">MFA</div>
                  <div className="font-semibold text-slate-900">{mfaConfig.isEnabled(false) ? 'Ativo' : 'Inativo'}</div>
                </div>
                <div className="rounded-lg border bg-slate-50 p-3 text-sm">
                  <div className="text-slate-500">Auditoria detalhada</div>
                  <div className="font-semibold text-slate-900">{auditConfig.isEnabled(false) ? 'Ativa' : 'Inativa'}</div>
                </div>
                <div className="rounded-lg border bg-slate-50 p-3 text-sm">
                  <div className="text-slate-500">IA de segurança</div>
                  <div className="font-semibold text-slate-900">{iaSecurityConfig.isEnabled(false) ? 'Ativa' : 'Inativa'}</div>
                </div>
              </div>
              <ConfiguracaoSeguranca empresaId={empresaAtual?.id} grupoId={grupoAtual?.id} />
              <SegurancaDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manutencao" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <MonitoramentoManutencaoIndex />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <IAGovernancaComplianceSection />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}