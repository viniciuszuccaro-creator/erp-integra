import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"
import usePermissions from "@/components/lib/usePermissions";

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Toggle = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  const { hasPermissionKey } = usePermissions();
  const cleanProps = { ...props };
  const perm = cleanProps?.['data-permission'];

  if ('data-permission' in cleanProps) delete cleanProps['data-permission'];

  if (perm) {
    const allowed = hasPermissionKey(perm);
    if (!allowed) {
      return (
        <span
          className={cn(toggleVariants({ variant: "outline", size }), "border-dashed text-slate-400 select-none")}
          aria-disabled="true"
        >
          Acesso negado
        </span>
      );
    }
  }

  return (
    <TogglePrimitive.Root
      ref={ref}
      className={cn(toggleVariants({ variant, size, className }))}
      {...cleanProps}
    />
  );
})

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
