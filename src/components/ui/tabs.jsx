import * as React from "react"
import { cn } from "@/lib/utils"

const Tabs = ({ value, onValueChange, className, children, ...props }) => {
  const [activeTab, setActiveTab] = React.useState(value)

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value)
    }
  }, [value])

  const handleChange = (newValue) => {
    setActiveTab(newValue)
    onValueChange?.(newValue)
  }

  return (
    <div className={cn("", className)} {...props}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeTab, onTabChange: handleChange })
        }
        return child
      })}
    </div>
  )
}

const TabsList = React.forwardRef(({ className, children, activeTab, onTabChange, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500",
      className
    )}
    {...props}
  >
    {React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, { activeTab, onTabChange })
      }
      return child
    })}
  </div>
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ className, children, value, activeTab, onTabChange, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      activeTab === value && "bg-white text-slate-950 shadow-sm",
      className
    )}
    onClick={() => onTabChange?.(value)}
    {...props}
  >
    {children}
  </button>
))
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ className, children, value, activeTab, ...props }, ref) => {
  if (activeTab !== value) return null
  
  return (
    <div
      ref={ref}
      className={cn("mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2", className)}
      {...props}
    >
      {children}
    </div>
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsContent, TabsList, TabsTrigger }