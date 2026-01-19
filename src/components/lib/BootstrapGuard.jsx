import React from "react";
import { useUser } from "@/components/lib/UserContext";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { logUIIssue } from "@/components/lib/uiAudit";

export default function BootstrapGuard({ children }) {
  const { user, isLoading: loadingUser } = useUser();
  const { empresaAtual, isLoading: loadingCtx } = useContextoVisual();

  const { data: iaConfigs, isLoading: loadingIA } = useQuery({
    queryKey: ["ia-config"],
    queryFn: async () => {
      try {
        return await base44.entities.IAConfig.list();
      } catch (e) {
        logUIIssue({ component: "BootstrapGuard", issue: "Falha ao carregar IAConfig", severity: "error", meta: { error: String(e?.message || e) } });
        return [];
      }
    },
    initialData: [],
  });

  React.useEffect(() => {
    if (!loadingIA && iaConfigs?.length === 0) {
      logUIIssue({ component: "BootstrapGuard", issue: "IAConfig ausente (usando padrões)", severity: "info" });
    }
  }, [loadingIA, iaConfigs?.length]);

  const booting = loadingUser || loadingIA || loadingCtx;

  if (booting) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6 text-slate-600">
        Inicializando o sistema…
      </div>
    );
  }

  if (!user) return children; // GuardRails tratará auth
  if (!empresaAtual) return children; // GuardRails tratará empresa

  return children;
}