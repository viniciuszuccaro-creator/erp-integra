import React, { useEffect, useRef, useState } from "react";
import usePermissions from "@/components/lib/usePermissions";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useUser } from "@/components/lib/UserContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
export default function ProtectedSection({
  module: modulo,
  section,
  action = "visualizar",
  fallback = null,
  children,
  hideInstead = false,
  disableInstead = false
}) {
  const { isLoading, hasPermission } = usePermissions();
  const { user } = useUser();
  const { empresaAtual } = useContextoVisual();
  const loggedRef = useRef(false);
  const [openDenied, setOpenDenied] = useState(false);

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

  useEffect(() => {
    if (!isLoading && !allowed) setOpenDenied(true);
  }, [isLoading, allowed]);

  if (isLoading) return null;
  if (!allowed) {
    if (hideInstead) return fallback;
    if (disableInstead) {
      return (
        <div className="opacity-50 pointer-events-none w-full h-full">
          {fallback || children}
        </div>
      );
    }
    return (
      <>
        {fallback}
        <Dialog open={openDenied} onOpenChange={setOpenDenied}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Permissão negada</DialogTitle>
              <DialogDescription>
                Você não possui permissão para visualizar esta seção.
              </DialogDescription>
            </DialogHeader>
            <div className="text-sm text-slate-600 space-y-1">
              <p><strong>Módulo:</strong> {modulo || 'Sistema'}</p>
              {section && <p><strong>Seção:</strong> {section}</p>}
              <p><strong>Ação:</strong> {action}</p>
            </div>
            <DialogFooter>
              <Button onClick={() => setOpenDenied(false)}>Entendi</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }
  return <>{children}</>;
}