import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { uiAuditWrap } from "@/components/lib/uiAudit";
import usePermissions from "@/components/lib/usePermissions";

const BaseRadioGroup = React.forwardRef(({ className, ...props }, ref) => {
  return <RadioGroupPrimitive.Root className={cn("grid gap-2", className)} {...props} ref={ref} />;
})
BaseRadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-3.5 w-3.5 fill-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

const AuditedRadioGroup = React.forwardRef(({ onValueChange, ...props }, ref) => {
  const { hasPermission } = usePermissions();
  const perm = props?.['data-permission'];
  const actionName = props?.['data-action'] || 'RadioGroup.onValueChange';
  const audited = React.useMemo(() => (
    typeof onValueChange === 'function' ? uiAuditWrap(actionName, onValueChange, { kind: 'radio' }) : undefined
  ), [actionName, onValueChange]);
  const { ...cleanProps } = props;
  if ('data-permission' in cleanProps) delete cleanProps['data-permission'];
  if ('data-action' in cleanProps) delete cleanProps['data-action'];
  if (perm) {
    const [m,s,a] = String(perm).split('.');
    const allowed = hasPermission(m, s || null, a || null);
    if (!allowed) return <span className="inline-flex items-center rounded border border-dashed px-2 py-1 text-[10px] text-slate-400 select-none">Acesso negado</span>;
  }
  return <BaseRadioGroup ref={ref} onValueChange={audited} {...cleanProps} />;
});
AuditedRadioGroup.displayName = 'AuditedRadioGroup';

export { AuditedRadioGroup as RadioGroup, RadioGroupItem }