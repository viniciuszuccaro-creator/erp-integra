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

  // Sempre manter a mesma ordem de hooks entre renders
  const allowed = !isLoading && hasPermission(modulo, section, action);

  useEffect(() => {
    if (isLoading) return; // não audita durante carregamento
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
  }, [isLoading, allowed, action, modulo, section, user?.id, empresaAtual?.id]);

  if (isLoading) return null;
  if (!allowed) return fallback;
  return <>{children}</>;
}