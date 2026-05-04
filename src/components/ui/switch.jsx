import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"
import { uiAuditWrap } from "@/components/lib/uiAudit";
import usePermissions from "@/components/lib/usePermissions";

const BaseSwitch = React.forwardRef(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-200",
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
    />
  </SwitchPrimitive.Root>
));

BaseSwitch.displayName = "Switch"

const AuditedSwitch = React.forwardRef(({ onCheckedChange, ...props }, ref) => {
  const { hasPermission } = usePermissions();
  const perm = props?.['data-permission'];
  const actionName = props?.['data-action'] || 'Switch.onCheckedChange';
  const audited = React.useMemo(() => (
    typeof onCheckedChange === 'function'
      ? uiAuditWrap(actionName, onCheckedChange, { kind: 'switch' })
      : undefined
  ), [actionName, onCheckedChange]);
  const { ...cleanProps } = props;
  if ('data-permission' in cleanProps) delete cleanProps['data-permission'];
  if ('data-action' in cleanProps) delete cleanProps['data-action'];
  if (perm) {
    const [m,s,a] = String(perm).split('.');
    const allowed = hasPermission(m, s || null, a || null);
    if (!allowed) return <span className="inline-flex h-6 items-center rounded border border-dashed px-2 text-[10px] text-slate-400 select-none">Acesso negado</span>;
  }
  return <BaseSwitch ref={ref} onCheckedChange={audited} {...cleanProps} />;
});
AuditedSwitch.displayName = 'AuditedSwitch';

export { AuditedSwitch as Switch }