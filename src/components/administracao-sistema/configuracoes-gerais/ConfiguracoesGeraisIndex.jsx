import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import ConfigGlobal from "@/components/sistema/ConfigGlobal";
import ConfiguracaoBackup from "@/components/sistema/ConfiguracaoBackup";
import ConfiguracaoMonitoramento from "@/components/sistema/ConfiguracaoMonitoramento";
import ConfiguracaoSeguranca from "@/components/sistema/ConfiguracaoSeguranca";
import usePermissions from "@/components/lib/usePermissions";
import ProtectedSection from "@/components/security/ProtectedSection";
import ContextoConfigBanner from "@/components/administracao-sistema/common/ContextoConfigBanner";
import IntegracoesPanel from "@/components/administracao-sistema/configuracoes-gerais/IntegracoesPanel";
import FiscalPanel from "@/components/administracao-sistema/configuracoes-gerais/FiscalPanel";
import IAPanel from "@/components/administracao-sistema/configuracoes-gerais/IAPanel";
import HerancaConfigNotice from "@/components/administracao-sistema/common/HerancaConfigNotice";
import { base44 } from "@/api/base44Client";
import { useUser } from "@/components/lib/UserContext";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

export default function ConfiguracoesGeraisIndex({ initialTab }) {
  const { hasPermission } = usePermissions();
  const { user } = useUser();
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const [tab, setTab] = React.useState(initialTab || 'global');
  const handleTabChange = (next) => {
    setTab(next);
    try {
      base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário',
        usuario_id: user?.id,
        empresa_id: empresaAtual?.id || null,
        empresa_nome: empresaAtual?.nome_fantasia || empresaAtual?.razao_social || null,
        acao: 'Visualização',
        modulo: 'Sistema',
        entidade: 'Configurações',
        descricao: `Aba visualizada: ${next}`,
        data_hora: new Date().toISOString(),
      });
    } catch {}
  };
  React.useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);
  return (
    <div className="w-full h-full flex flex-col">
      <Tabs value={tab} onValueChange={handleTabChange} className="w-full h-full">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="global">Gerais</TabsTrigger>
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
          <TabsTrigger value="fiscal">Fiscal</TabsTrigger>
          <TabsTrigger value="ia">IA</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="monitoramento">Monitoramento</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <ContextoConfigBanner />
              <HerancaConfigNotice />
              <ProtectedSection module="Sistema" section={["Configurações","Gerais"]} action="visualizar" fallback={<div className="p-3 text-sm text-slate-500">Sem permissão para Gerais.</div>}>
                <ConfigGlobal />
              </ProtectedSection>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integracoes" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <ContextoConfigBanner />
              <HerancaConfigNotice />
              <IntegracoesPanel />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fiscal" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <ContextoConfigBanner />
              <HerancaConfigNotice />
              <FiscalPanel />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ia" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <ContextoConfigBanner />
              <HerancaConfigNotice />
              <IAPanel />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <ProtectedSection module="Sistema" section={["Configurações","Backup"]} action="visualizar" fallback={<div className="p-3 text-sm text-slate-500">Sem permissão para Backup.</div>}>
                <ConfiguracaoBackup empresaId={empresaAtual?.id} grupoId={grupoAtual?.id} />
              </ProtectedSection>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoramento" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <ProtectedSection module="Sistema" section={["Configurações","Monitoramento"]} action="visualizar" fallback={<div className="p-3 text-sm text-slate-500">Sem permissão para Monitoramento.</div>}>
                <ConfiguracaoMonitoramento empresaId={empresaAtual?.id} grupoId={grupoAtual?.id} />
              </ProtectedSection>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <ProtectedSection module="Sistema" section={["Configurações","Segurança"]} action="visualizar" fallback={<div className="p-3 text-sm text-slate-500">Sem permissão para Segurança.</div>}>
                <ConfiguracaoSeguranca empresaId={empresaAtual?.id} grupoId={grupoAtual?.id} />
              </ProtectedSection>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}