import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import usePermissions from "@/components/lib/usePermissions";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  const { hasPermission } = usePermissions();
  const perm = props?.['data-permission'];
  let isAllowed = true;
  if (perm) {
    const [mod, sec, act] = String(perm).split('.');
    try { isAllowed = hasPermission(mod, sec || null, act || null); } catch { isAllowed = true; }
  }
  const passProps = { ...props };
  if ('data-permission' in passProps) delete passProps['data-permission'];

  if (perm && !isAllowed) {
          // Placeholder visual quando sem permissão
          return (
            <button
              className={cn(buttonVariants({ variant: "outline", size })) + " pointer-events-none opacity-50 cursor-not-allowed"}
              aria-disabled="true"
              type="button"
              title="Acesso negado"
            >
              Acesso negado
            </button>
          );
        }

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...withUIAudit(passProps)}
    />
  );
})
Button.displayName = "Button"

import { uiAuditWrap } from "@/components/lib/uiAudit";

// HOC to wrap onClick with audit (non-invasive)
function withUIAudit(props) {
  // Modo transição: mostrar e bloquear no clique (Big Bang imediato)
  const wrapIfDenied = (onClick) => async (e) => {
    try {
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      const page = (path.split('/').pop() || '').replace(/^\//,'');
      // Heurística simples: deriva módulo pela rota atual
      const pageToModule = {
        CRM: 'CRM', Comercial: 'Comercial', Estoque: 'Estoque', Compras: 'Compras', Financeiro: 'Financeiro', Fiscal: 'Fiscal', RH: 'RH', Expedicao: 'Expedição', Producao: 'Produção'
      };
      const moduleName = pageToModule[page] || 'Sistema';
      const res = await base44.functions.invoke('entityGuard', { module: moduleName, action: 'executar' });
      if (res?.data && res.data.allowed === false) {
        e?.preventDefault?.(); e?.stopPropagation?.();
        try { await base44.entities.AuditLog.create({ acao: 'Bloqueio', modulo: moduleName, entidade: 'UI', descricao: 'Clique bloqueado (sem permissão)', data_hora: new Date().toISOString() }); } catch {}
        try { toast.error('Permissão negada'); } catch {}
        return;
      }
    } catch (_) {}
    return onClick?.(e);
  };

  const p = { ...props };
  if (typeof p.onClick === 'function' && !p.__wrapped_audit) {
  p.onClick = wrapIfDenied(p.onClick);

    const meta = { kind: 'button', toastSuccess: true };
    p.onClick = uiAuditWrap(p['data-action'] || 'Button.onClick', p.onClick, meta);
    p.__wrapped_audit = true;
  }
  // CORREÇÃO CRÍTICA: Remove __wrapped_audit from props to avoid React warning
  delete p.__wrapped_audit;
  return p;
}

export { Button, buttonVariants }