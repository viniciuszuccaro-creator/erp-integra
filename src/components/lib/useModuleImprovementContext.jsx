import usePermissions from "@/components/lib/usePermissions";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { getModuleImprovementStatus, MODULE_IMPROVEMENT_PILLARS } from "@/components/lib/moduleImprovementPlan";

export default function useModuleImprovementContext(moduleName = "Sistema") {
  const { hasPermission } = usePermissions();
  const { empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const status = getModuleImprovementStatus(moduleName);

  return {
    moduleName,
    status,
    pillars: MODULE_IMPROVEMENT_PILLARS,
    canView: hasPermission(moduleName, null, "ver"),
    empresaNome: empresaAtual?.nome_fantasia || empresaAtual?.razao_social || null,
    grupoNome: grupoAtual?.nome || grupoAtual?.razao_social || null,
    contexto,
  };
}