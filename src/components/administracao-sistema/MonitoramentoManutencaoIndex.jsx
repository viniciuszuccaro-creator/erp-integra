import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import ProtectedSection from "@/components/security/ProtectedSection";
import ContextoConfigBanner from "@/components/administracao-sistema/common/ContextoConfigBanner";
import HerancaConfigNotice from "@/components/administracao-sistema/common/HerancaConfigNotice";
import ConfiguracaoBackup from "@/components/sistema/ConfiguracaoBackup";
import ConfiguracaoMonitoramento from "@/components/sistema/ConfiguracaoMonitoramento";
import MonitorAcessoRealtimeSection from "@/components/administracao-sistema/seguranca-governanca/MonitorAcessoRealtimeSection";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { base44 } from "@/api/base44Client";
import { useUser } from "@/components/lib/UserContext";
import { Activity, Database, Clock } from "lucide-react";

export default function MonitoramentoManutencaoIndex({ initialTab }) {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const { user } = useUser();
  const [tab, setTab] = React.useState(initialTab || 'monitoramento');

  const handleTabChange = (next) => {
    setTab(next);
    try {
      base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário',
        usuario_id: user?.id,
        empresa_id: empresaAtual?.id || null,
        acao: 'Visualização',
        modulo: 'Sistema',
        entidade: 'Monitoramento & Manutenção',
        descricao: `Aba visualizada: ${next}`,
        data_hora: new Date().toISOString(),
      });
    } catch {}
  };

  React.useEffect(() => { if (initialTab) setTab(initialTab); }, [initialTab]);

  return (
    <div className="w-full h-full flex flex-col">
      <Tabs value={tab} onValueChange={handleTabChange} className="w-full h-full">
        <TabsList className="flex flex-wrap gap-2 h-auto">
          <TabsTrigger value="monitoramento"><Activity className="w-4 h-4 mr-2" /> Monitoramento</TabsTrigger>
          <TabsTrigger value="backup"><Database className="w-4 h-4 mr-2" /> Backup</TabsTrigger>
          <TabsTrigger value="sessoes"><Clock className="w-4 h-4 mr-2" /> Atividade de Sessão</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoramento" className="mt-4">
          <Card className="w-full"><CardContent className="p-4">
            <ContextoConfigBanner />
            <HerancaConfigNotice />
            <ProtectedSection module="Sistema" section={["Configurações","Monitoramento"]} action="visualizar" fallback={<div className="p-3 text-sm text-slate-500">Sem permissão para Monitoramento.</div>}>
              <ConfiguracaoMonitoramento empresaId={empresaAtual?.id} grupoId={grupoAtual?.id} />
            </ProtectedSection>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="backup" className="mt-4">
          <Card className="w-full"><CardContent className="p-4">
            <ContextoConfigBanner />
            <HerancaConfigNotice />
            <ProtectedSection module="Sistema" section={["Configurações","Backup"]} action="visualizar" fallback={<div className="p-3 text-sm text-slate-500">Sem permissão para Backup.</div>}>
              <ConfiguracaoBackup empresaId={empresaAtual?.id} grupoId={grupoAtual?.id} />
            </ProtectedSection>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="sessoes" className="mt-4">
          <Card className="w-full"><CardContent className="p-4">
            <MonitorAcessoRealtimeSection />
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}