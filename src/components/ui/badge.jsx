import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
        variant === "outline"
          ? "border-slate-200 text-slate-950"
          : "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80",
        className
      )}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }