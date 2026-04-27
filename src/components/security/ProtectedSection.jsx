import React, { useEffect, useRef, useState } from "react";
import usePermissions from "@/components/lib/usePermissions";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useUser } from "@/components/lib/UserContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Cache / dedupe global para entityGuard (TTL 120s)
const __guardCache = (typeof window !== 'undefined' ? (window.__entityGuardCache || (window.__entityGuardCache = new Map())) : new Map());
const __guardInflight = (typeof window !== 'undefined' ? (window.__entityGuardInflight || (window.__entityGuardInflight = new Map())) : new Map());
const __guardCooldown = (typeof window !== 'undefined' ? (window.__entityGuardCooldown || (window.__entityGuardCooldown = new Map())) : new Map());
const GUARD_TTL_MS = 120_000;
const GUARD_COOLDOWN_MS = 30_000;
const getGuardKey = (module, section, action, empresaId, groupId) => `${module || '-'}|${section || '-'}|${action || '-'}|${empresaId || '-'}|${groupId || '-'}`;

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
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const loggedRef = useRef(false);
  const [openDenied, setOpenDenied] = useState(false);
  const [requestingAccess, setRequestingAccess] = useState(false);
  const [requestedAccess, setRequestedAccess] = useState(false);
  const [requestError, setRequestError] = useState("");

  // Sempre manter a mesma ordem de hooks entre renders
  const allowed = !isLoading && hasPermission(modulo, section, action);
  const [allowedFinal, setAllowedFinal] = useState(null);

  useEffect(() => {
    if (isLoading) return;
    if (!modulo) { setAllowedFinal(allowed); return; }

    const key = getGuardKey(modulo, section, action, empresaAtual?.id, grupoAtual?.id);
    const now = Date.now();
    const cached = __guardCache.get(key);
    if (cached && (now - cached.ts < GUARD_TTL_MS)) {
      setAllowedFinal(Boolean(cached.allowed) && allowed);
      return;
    }

    // Valor otimista para não bloquear UI
    setAllowedFinal(allowed);

    const cooldownUntil = __guardCooldown.get(key);
    if (cooldownUntil && cooldownUntil > Date.now()) {
      return;
    }

    if (__guardInflight.has(key)) {
      __guardInflight.get(key)
        .then(({ data }) => {
          const backendAllowed = data?.allowed === true;
          __guardCache.set(key, { allowed: backendAllowed, ts: Date.now() });
          setAllowedFinal(backendAllowed && allowed);
        })
        .catch(() => {/* mantém otimista */});
      return;
    }

    const p = base44.functions.invoke('entityGuard', {
      module: modulo,
      section,
      action,
      empresa_id: empresaAtual?.id || null,
      group_id: grupoAtual?.id || null,
    });
    __guardInflight.set(key, p);

    p.then(({ data }) => {
      const backendAllowed = data?.allowed === true;
      __guardCache.set(key, { allowed: backendAllowed, ts: Date.now() });
      __guardCooldown.delete(key);
      setAllowedFinal(backendAllowed && allowed);
    }).catch((err) => {
      const status = err?.response?.status || err?.status;
      if (status === 429 || status >= 500) {
        __guardCooldown.set(key, Date.now() + GUARD_COOLDOWN_MS);
      }
      setAllowedFinal(allowed);
    }).finally(() => {
      __guardInflight.delete(key);
    });
  }, [isLoading, allowed, modulo, section, action, empresaAtual?.id, grupoAtual?.id]);

  useEffect(() => {
    if (isLoading) return;
    if (allowedFinal === false && !loggedRef.current) {
      loggedRef.current = true;
      try {
        base44.entities.AuditLog.create({
          usuario: user?.full_name || user?.email || 'Usuário',
          usuario_id: user?.id,
          empresa_id: empresaAtual?.id || null,
          empresa_nome: empresaAtual?.nome_fantasia || empresaAtual?.razao_social || null,
          acao: 'Bloqueio',
          modulo: modulo || 'Sistema',
          tipo_auditoria: 'seguranca',
          entidade: section || 'Seção',
          descricao: `Acesso negado: ${modulo}.${section}.${action}`,
          data_hora: new Date().toISOString(),
        });
      } catch (_) {}
    }
  }, [isLoading, allowedFinal, action, modulo, section, user?.id, empresaAtual?.id]);

  useEffect(() => {
    if (!isLoading && allowedFinal === false) setOpenDenied(true);
  }, [isLoading, allowedFinal]);

  if (isLoading || allowedFinal === null) return <div className="contents" data-ps-loading />;
  if (!allowedFinal) {
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
            {requestedAccess && (
              <div className="text-xs text-emerald-600 mt-2">
                Pedido de acesso enviado para aprovação.
              </div>
            )}
            {requestError && (
              <div className="text-xs text-amber-600 mt-2">
                {requestError}
              </div>
            )}
            <DialogFooter>
              <Button
                variant="default"
                disabled={requestingAccess || requestedAccess}
                onClick={async () => {
                  try {
                    setRequestingAccess(true);
                    setRequestError("");
                    await base44.functions.invoke('solicitacoesAprovacao', {
                      module: modulo || 'Sistema',
                      section,
                      action,
                      empresa_id: empresaAtual?.id || null,
                      group_id: grupoAtual?.id || null,
                    });
                    setRequestedAccess(true);
                  } catch (err) {
                    const status = err?.response?.status || err?.status;
                    setRequestError(status === 429 ? 'Muitas tentativas agora. Tente novamente em instantes.' : 'Não foi possível enviar a solicitação agora.');
                  } finally {
                    setRequestingAccess(false);
                  }
                }}
              >
                {requestedAccess ? 'Solicitado' : (requestingAccess ? 'Solicitando…' : 'Solicitar acesso')}
              </Button>
              <Button variant="outline" onClick={() => setOpenDenied(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }
  return <>{children}</>;
}