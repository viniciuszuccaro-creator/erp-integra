import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = ({ value, onValueChange, children }) => {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="relative">
      {React.Children.map(children, child => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, { onClick: () => setOpen(!open) })
        }
        if (child.type === SelectContent) {
          return React.cloneElement(child, { open, onValueChange, setOpen, currentValue: value })
        }
        return child
      })}
    </div>
  )
}

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm",
      className
    )}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </button>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder }) => {
  return <span>{placeholder}</span>
}

const SelectContent = ({ className, children, open, onValueChange, setOpen, currentValue }) => {
  if (!open) return null
  
  return (
    <div className={cn(
      "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white shadow-md mt-1",
      className
    )}>
      {React.Children.map(children, child => {
        if (child.type === SelectItem) {
          return React.cloneElement(child, { onValueChange, setOpen, currentValue })
        }
        return child
      })}
    </div>
  )
}

const SelectItem = ({ className, children, value, onValueChange, setOpen, currentValue, ...props }) => (
  <div
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-slate-100",
      currentValue === value && "bg-slate-100",
      className
    )}
    onClick={() => {
      onValueChange?.(value)
      setOpen?.(false)
    }}
    {...props}
  >
    {children}
  </div>
)

const SelectGroup = ({ children }) => <div className="p-1">{children}</div>
const SelectLabel = ({ className, ...props }) => (
  <div className={cn("px-2 py-1.5 text-sm font-semibold", className)} {...props} />
)

export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue }