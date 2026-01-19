import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef(({ className, ...props }, ref) => {
  return (<RadioGroupPrimitive.Root className={cn("grid gap-2", className)} {...props} ref={ref} />);
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef(({ className, ...props }, ref) => {
  return (
    (<RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}>
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-3.5 w-3.5 fill-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>)
  );
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

import { uiAuditWrap } from "@/components/lib/uiAudit";

const _RG = RadioGroup;
const AuditedRadioGroup = React.forwardRef(({ onValueChange, ...props }, ref) => {
  const audited = typeof onValueChange === 'function' ? uiAuditWrap('RadioGroup.onValueChange', onValueChange, { kind: 'radio' }) : undefined;
  return (<_RG ref={ref} onValueChange={audited} {...props} />);
});
AuditedRadioGroup.displayName = 'AuditedRadioGroup';

export { AuditedRadioGroup as RadioGroup, RadioGroupItem }