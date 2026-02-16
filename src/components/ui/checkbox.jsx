import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"
import usePermissions from "@/components/lib/usePermissions";

 const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
   <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}>
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

import { uiAuditWrap } from "@/components/lib/uiAudit";

// decorate onCheckedChange if present
const _orig = Checkbox; // keep ref
const WrappedCheckbox = React.forwardRef((props, ref) => {
  const { hasPermission } = usePermissions();
  const p = { ...props };
  if (typeof p.onCheckedChange === 'function' && !p.__wrapped_audit) {
    p.onCheckedChange = uiAuditWrap(p['data-action'] || 'Checkbox.onCheckedChange', p.onCheckedChange, { kind: 'checkbox', toastSuccess: true });
    p.__wrapped_audit = true;
  }
  const { __wrapped_audit, ...cleanProps } = p;
  const perm = cleanProps?.['data-permission'];
  if ('data-permission' in cleanProps) delete cleanProps['data-permission'];
  if (perm) {
    const [m,s,a] = String(perm).split('.');
    const allowed = hasPermission(m, s || null, a || null);
    if (!allowed) return null;
  }
  return (<_orig {...cleanProps} ref={ref} />);
});
WrappedCheckbox.displayName = "WrappedCheckbox";

export { WrappedCheckbox as Checkbox }