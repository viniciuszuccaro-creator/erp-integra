import React, { useEffect, useRef } from "react";
import usePermissions from "@/components/lib/usePermissions";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useUser } from "@/components/lib/UserContext";

export default function ProtectedSection({
  module: modulo,
  section,
  action = "visualizar",
  fallback = null,
  children
}) {
  const { isLoading, hasPermission } = usePermissions();
  const { user } = useUser();
  const { empresaAtual } = useContextoVisual();
  const loggedRef = useRef(false);

  if (isLoading) return null;
  const allowed = hasPermission(modulo, section, action);

  useEffect(() => {
    if (!allowed && !loggedRef.current) {
      loggedRef.current = true;
      try {
        base44.entities.AuditLog.create({
          usuario: user?.full_name || user?.email || 'Usuário',
          usuario_id: user?.id,
          empresa_id: empresaAtual?.id || null,
          empresa_nome: empresaAtual?.nome_fantasia || empresaAtual?.razao_social || null,
          acao: 'Bloqueio',
          modulo: modulo || 'Sistema',
          entidade: section || 'Seção',
          descricao: `Acesso negado (${action})`,
        });
      } catch {}
    }
  }, [allowed, action, modulo, section, user?.id, empresaAtual?.id]);

  if (!allowed) return fallback;
  return <>{children}</>;
}