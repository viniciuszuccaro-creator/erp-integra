import * as React from "react"
import { cn } from "@/lib/utils"
import { uiAuditWrap, logUIIssue } from "@/components/lib/uiAudit"

const Textarea = React.forwardRef(({ className, onChange, onBlur, ...props }, ref) => {
  React.useEffect(() => {
    if (!onChange) {
      logUIIssue({ component: 'Textarea', issue: 'Sem onChange associado', severity: 'warn', meta: { name: props?.name } });
    }
  }, []);

  const auditedOnChange = typeof onChange === 'function' ? uiAuditWrap('Textarea.onChange', onChange, { kind: 'textarea' }) : undefined;
  const auditedOnBlur = typeof onBlur === 'function' ? uiAuditWrap('Textarea.onBlur', onBlur, { kind: 'textarea' }) : undefined;

  // CORREÇÃO CRÍTICA: Remover __wrapped_audit antes de passar para elemento nativo
  const { __wrapped_audit, ...cleanProps } = props;

  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      onChange={auditedOnChange}
      onBlur={auditedOnBlur}
      {...cleanProps}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }