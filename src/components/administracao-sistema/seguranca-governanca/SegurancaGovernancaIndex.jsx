import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import usePermissions from "@/components/lib/usePermissions";
import SegurancaDashboard from "@/components/administracao-sistema/seguranca-governanca/SegurancaDashboard";
import PainelGovernancaSection from "@/components/administracao-sistema/seguranca-governanca/PainelGovernancaSection";
import IAGovernancaComplianceSection from "@/components/administracao-sistema/seguranca-governanca/IAGovernancaComplianceSection";
import ConfiguracaoSeguranca from "@/components/sistema/ConfiguracaoSeguranca";
import ConfiguracaoBackup from "@/components/sistema/ConfiguracaoBackup";
import ConfiguracaoMonitoramento from "@/components/sistema/ConfiguracaoMonitoramento";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import ContextoConfigBanner from "@/components/administracao-sistema/common/ContextoConfigBanner";
import HerancaConfigNotice from "@/components/administracao-sistema/common/HerancaConfigNotice";

export default function SegurancaGovernancaIndex() {
  const { isAdmin } = usePermissions();
  const { empresaAtual, grupoAtual } = useContextoVisual();
  if (!isAdmin()) return <div className="p-4 text-sm text-slate-500">Acesso restrito.</div>;

  return (
    <div className="w-full h-full flex flex-col">
      <Tabs defaultValue="seguranca" className="w-full h-full">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="governanca">Governança</TabsTrigger>
          <TabsTrigger value="compliance">Compliance IA</TabsTrigger>
        </TabsList>

        <TabsContent value="seguranca" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <ContextoConfigBanner />
              <HerancaConfigNotice />
              <ConfiguracaoSeguranca empresaId={empresaAtual?.id} grupoId={grupoAtual?.id} />
              <SegurancaDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoramento" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <ContextoConfigBanner />
              <HerancaConfigNotice />
              <ConfiguracaoMonitoramento empresaId={empresaAtual?.id} grupoId={grupoAtual?.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <ContextoConfigBanner />
              <HerancaConfigNotice />
              <ConfiguracaoBackup empresaId={empresaAtual?.id} grupoId={grupoAtual?.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="governanca" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <PainelGovernancaSection />
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