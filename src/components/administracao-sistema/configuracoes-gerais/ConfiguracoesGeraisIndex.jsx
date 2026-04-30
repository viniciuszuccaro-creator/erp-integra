import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import ConfigGlobal from "@/components/sistema/ConfigGlobal";
import ProtectedSection from "@/components/security/ProtectedSection";
import ContextoConfigBanner from "@/components/administracao-sistema/common/ContextoConfigBanner";
import HerancaConfigNotice from "@/components/administracao-sistema/common/HerancaConfigNotice";
import Fase1AdminStatus from "@/components/administracao-sistema/fase1/Fase1AdminStatus";
import InventarioControlesCard from "@/components/administracao-sistema/fase1/InventarioControlesCard";
import MapaTogglesCard from "@/components/administracao-sistema/fase1/MapaTogglesCard";
import Plano100StatusCard from "@/components/administracao-sistema/fase1/Plano100StatusCard";
import ToggleMapCard from "@/components/administracao-sistema/fase1/ToggleMapCard";
import CoberturaFluxosCard from "@/components/administracao-sistema/fase1/CoberturaFluxosCard";
import InventarioControlesCompletudeCard from "@/components/administracao-sistema/fase1/InventarioControlesCompletudeCard";
import AdminControlsStatusCard from "@/components/administracao-sistema/fase1/AdminControlsStatusCard";
import AdminControlAuditChecklist from "@/components/administracao-sistema/fase1/AdminControlAuditChecklist";
import AdminControlCoverageCard from "@/components/administracao-sistema/fase1/AdminControlCoverageCard";
import AdminExecutionConnectionCard from "@/components/administracao-sistema/fase1/AdminExecutionConnectionCard";
import AdminFlowTestMatrixCard from "@/components/administracao-sistema/fase1/AdminFlowTestMatrixCard";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * ConfiguracoesGeraisIndex — Consolidado.
 * Abas redundantes (Herança/Versionamento/Conflitos) removidas.
 * Cada funcionalidade em seu único lugar: ConfigGlobal cuida de tudo.
 */
export default function ConfiguracoesGeraisIndex() {
  const { empresaAtual, grupoAtual } = useContextoVisual();

  return (
    <div className="w-full h-full flex flex-col">
      <Card className="w-full">
        <CardContent className="p-4 space-y-3">
          <ContextoConfigBanner />
          <HerancaConfigNotice />
          <Fase1AdminStatus />
          <Plano100StatusCard />
          <AdminControlsStatusCard />
          <div className="grid gap-4 xl:grid-cols-2">
            <InventarioControlesCard />
            <MapaTogglesCard />
          </div>
          <ToggleMapCard />
          <AdminExecutionConnectionCard />
          <AdminFlowTestMatrixCard />
          <AdminControlCoverageCard />
          <InventarioControlesCompletudeCard />
          <div className="grid gap-4 xl:grid-cols-2">
            <CoberturaFluxosCard />
            <AdminControlAuditChecklist />
          </div>
          <ProtectedSection
            module="Sistema"
            section={["Configurações", "Gerais"]}
            action="visualizar"
            fallback={<div className="p-3 text-sm text-slate-500">Sem permissão para Configurações Gerais.</div>}
          >
            <ConfigGlobal empresaId={empresaAtual?.id} grupoId={grupoAtual?.id} />
          </ProtectedSection>
        </CardContent>
      </Card>
    </div>
  );
}