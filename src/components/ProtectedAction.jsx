import React from "react";
import usePermissions from "@/components/lib/usePermissions";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useUser } from "@/components/lib/UserContext";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

// ProtectedAction v2 - suporta modos: "disable" (padrão) e "hide" + auditoria opcional
export function ProtectedAction({
  children,
  module,
  section = null,
  action = "editar",
  fallback = null,
  mode = "disable", // "disable" | "hide"
  auditDenied = true,
  auditMetadata = null,
}) {
  const { hasPermission, isLoading } = usePermissions();
  const { user } = useUser();
  const { empresaAtual, grupoAtual, contexto } = useContextoVisual();

  if (isLoading) return null;

  const allowed = hasPermission(module, section, action);

  if (!allowed) {
    // Auditoria opcional de tentativa bloqueada (não bloqueia UI se falhar)
    if (auditDenied) {
      try {
        base44.entities.AuditLog.create({
          usuario: user?.full_name || user?.email || "Usuário",
          usuario_id: user?.id,
          empresa_id: empresaAtual?.id || null,
          empresa_nome: empresaAtual?.nome_fantasia || empresaAtual?.razao_social || null,
          acao: "Bloqueio",
          modulo: module,
          entidade: section || "-",
          descricao: `Ação negada: ${module}/${section || "-"}/${action}`,
          dados_novos: {
            ...(auditMetadata || {}),
            contexto: contexto || 'empresa',
            group_id: grupoAtual?.id || null,
          },
        });
      } catch {}
    }

    if (mode === "hide") {
      return null;
    }

    if (fallback) return fallback;

    // Modo disable: mantém layout estável, desativa interação
    return (
      <div className="opacity-50 pointer-events-none select-none">
        {children ? (
          children
        ) : (
          <Button variant="ghost" size="sm" disabled>
            <Lock className="w-4 h-4 mr-2" />
            Sem permissão
          </Button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}

export default ProtectedAction;