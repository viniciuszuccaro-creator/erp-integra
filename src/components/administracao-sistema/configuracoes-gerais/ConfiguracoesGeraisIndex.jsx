import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import ConfigGlobal from "@/components/sistema/ConfigGlobal";
import HerancaOverridesPanel from "@/components/administracao-sistema/configuracoes-gerais/HerancaOverridesPanel";
import VersionamentoConfigPanel from "@/components/administracao-sistema/configuracoes-gerais/VersionamentoConfigPanel";
import ConflitosRevisaoPanel from "@/components/administracao-sistema/configuracoes-gerais/ConflitosRevisaoPanel";

import ProtectedSection from "@/components/security/ProtectedSection";
import ContextoConfigBanner from "@/components/administracao-sistema/common/ContextoConfigBanner";



import HerancaConfigNotice from "@/components/administracao-sistema/common/HerancaConfigNotice";
import { base44 } from "@/api/base44Client";
import { useUser } from "@/components/lib/UserContext";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

export default function ConfiguracoesGeraisIndex({ initialTab }) {
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
          <TabsTrigger value="global">Parâmetros Gerais</TabsTrigger>
          <TabsTrigger value="heranca">Herança/Overrides</TabsTrigger>
          <TabsTrigger value="versionamento">Versionamento</TabsTrigger>
          <TabsTrigger value="conflitos">Conflitos</TabsTrigger>
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

        <TabsContent value="heranca" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <ProtectedSection module="Sistema" section={["Configurações","Herança"]} action="editar" fallback={<div className="p-3 text-sm text-slate-500">Sem permissão para Herança/Overrides.</div>}>
                <HerancaOverridesPanel />
              </ProtectedSection>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versionamento" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <ProtectedSection module="Sistema" section={["Configurações","Versionamento"]} action="visualizar" fallback={<div className="p-3 text-sm text-slate-500">Sem permissão para Versionamento.</div>}>
                <VersionamentoConfigPanel />
              </ProtectedSection>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflitos" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <ProtectedSection module="Sistema" section={["Configurações","ConflictPolicy"]} action="executar" fallback={<div className="p-3 text-sm text-slate-500">Sem permissão para Conflitos.</div>}>
                <ConflitosRevisaoPanel />
              </ProtectedSection>
            </CardContent>
          </Card>
        </TabsContent>

        </Tabs>
        </div>
  );
}