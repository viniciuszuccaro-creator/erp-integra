import React, { useState } from "react";
import usePermissions from "@/components/lib/usePermissions";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useUser } from "@/components/lib/UserContext";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// ProtectedAction v2 - suporta modos: "modal" (padrão), "disable" e "hide" + auditoria opcional
export function ProtectedAction({
  children,
  module,
  section = null,
  action = "editar",
  fallback = null,
  mode = "modal", // "modal" | "disable" | "hide"
  auditDenied = true,
  auditMetadata = null,
}) {
  const { hasPermission, isLoading } = usePermissions();
  const { user } = useUser();
  const { empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const [open, setOpen] = useState(false);

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
            page: typeof window !== 'undefined' ? window?.location?.pathname : undefined,
            url: typeof window !== 'undefined' ? window?.location?.href : undefined,
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
            headers_snapshot: {
              'x-company-id': empresaAtual?.id || null,
              'x-tenant-id': (contexto === 'grupo' ? grupoAtual?.id : empresaAtual?.id) || null,
              'x-scope': contexto || 'empresa',
            },
          },
        });
      } catch {}
    }

    if (mode === "hide") {
      return null;
    }

    if (fallback) return fallback;

    if (mode === "disable") {
      return (
        <div className="w-full h-full opacity-50 pointer-events-none select-none" aria-disabled="true">
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

    const handleOpen = (e) => {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      e?.stopPropagation?.();
      setOpen(true);
    };

    return (
      <>
        <div
          className="w-full h-full opacity-60 cursor-not-allowed select-none"
          onClick={handleOpen}
          role="button"
          aria-disabled="true"
          title="Sem permissão"
        >
          {children ? (
            children
          ) : (
            <Button variant="ghost" size="sm" onClick={handleOpen}>
              <Lock className="w-4 h-4 mr-2" />
              Sem permissão
            </Button>
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Permissão negada</DialogTitle>
              <DialogDescription>
                Você não possui permissão para executar esta ação.
              </DialogDescription>
            </DialogHeader>
            <div className="text-sm text-slate-600 space-y-1">
              <p><strong>Módulo:</strong> {module}</p>
              {section && <p><strong>Seção:</strong> {section}</p>}
              <p><strong>Ação:</strong> {action}</p>
            </div>
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>Entendi</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return <>{children}</>;
}

export default ProtectedAction;