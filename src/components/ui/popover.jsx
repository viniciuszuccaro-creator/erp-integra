import * as React from "react"
import { cn } from "@/lib/utils"

const Popover = ({ open, onOpenChange, children }) => {
  return (
    <div className="relative inline-block">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { open, onOpenChange })
        }
        return child
      })}
    </div>
  )
}

const PopoverTrigger = React.forwardRef(({ className, children, asChild, open, onOpenChange, ...props }, ref) => {
  const Comp = asChild ? React.Fragment : "button"
  
  if (asChild) {
    return React.cloneElement(children, {
      onClick: () => onOpenChange?.(!open)
    })
  }
  
  return (
    <button
      ref={ref}
      onClick={() => onOpenChange?.(!open)}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
})
PopoverTrigger.displayName = "PopoverTrigger"

const PopoverContent = React.forwardRef(({ className, align = "center", children, open, onOpenChange, ...props }, ref) => {
  if (!open) return null

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-2 w-72 rounded-md border bg-white p-4 shadow-md",
        align === "end" && "right-0",
        align === "start" && "left-0",
        align === "center" && "left-1/2 -translate-x-1/2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverContent, PopoverTrigger }