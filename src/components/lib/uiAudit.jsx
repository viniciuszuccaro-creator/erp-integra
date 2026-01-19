import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

let _cachedUser = null;
async function getUserSafe() {
  try {
    if (_cachedUser) return _cachedUser;
    _cachedUser = await base44.auth.me();
    return _cachedUser;
  } catch (_) {
    return null;
  }
}

// Minimal, resilient audit logger (non-blocking) + visual feedback
export function logUIAction({ component, action, status, meta }) {
  try {
    const descricao = `[${component}] ${action} • ${status}`;
    getUserSafe().then((u) => {
      base44.entities?.AuditLog?.create?.({
        usuario: u?.full_name || u?.email || 'Usuário',
        usuario_id: u?.id,
        acao: "Interação",
        modulo: "Sistema",
        entidade: "UI",
        descricao,
        dados_novos: {
          status,
          action,
          component,
          meta: sanitizeMeta(meta),
          url: typeof window !== 'undefined' ? window.location.pathname : undefined,
        },
      });
    });
  } catch (_) {}
}

export function logUIIssue({ component, issue, severity = "warn", meta }) {
  try {
    const descricao = `[${component}] ISSUE: ${issue}`;
    getUserSafe().then((u) => {
      base44.entities?.AuditLog?.create?.({
        usuario: u?.full_name || u?.email || 'Usuário',
        usuario_id: u?.id,
        acao: "Auditoria",
        modulo: "Sistema",
        entidade: "UI",
        descricao,
        dados_novos: {
          severity,
          issue,
          component,
          meta: sanitizeMeta(meta),
          url: typeof window !== 'undefined' ? window.location.pathname : undefined,
        },
      });
    });
  } catch (_) {}
}

function sanitizeMeta(meta) {
  try {
    if (!meta) return null;
    const clone = JSON.parse(JSON.stringify(meta));
    return clone;
  } catch (_) {
    return null;
  }
}

// Wrap any handler (sync or async) and emit start/success/error
export function uiAuditWrap(actionName, handler, baseMeta = {}) {
  return async function wrapped(...args) {
    logUIAction({ component: inferComponent(actionName), action: actionName, status: "start", meta: baseMeta });
    try {
      const res = handler ? handler(...args) : undefined;
      if (res && typeof res.then === 'function') await res;
      logUIAction({ component: inferComponent(actionName), action: actionName, status: "success", meta: baseMeta });
      return res;
    } catch (error) {
      logUIAction({ component: inferComponent(actionName), action: actionName, status: "error", meta: { ...baseMeta, error: String(error?.message || error) } });
      throw error;
    }
  };
}

function inferComponent(actionName) {
  if (!actionName) return "UI";
  if (actionName.startsWith("Button")) return "Button";
  if (actionName.startsWith("Input")) return "Input";
  if (actionName.startsWith("Checkbox")) return "Checkbox";
  if (actionName.startsWith("Select")) return "Select";
  return "UI";
}