import * as React from "react"
import { cn } from "@/lib/utils"

const SidebarContext = React.createContext({})

export function SidebarProvider({ children, ...props }) {
  return (
    <SidebarContext.Provider value={{}}>
      <div {...props}>{children}</div>
    </SidebarContext.Provider>
  )
}

export function Sidebar({ className, children, ...props }) {
  return (
    <aside
      className={cn(
        "flex h-screen w-64 flex-col border-r bg-white",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  )
}

export function SidebarHeader({ className, ...props }) {
  return <div className={cn("p-4", className)} {...props} />
}

export function SidebarContent({ className, ...props }) {
  return <div className={cn("flex-1 overflow-auto", className)} {...props} />
}

export function SidebarFooter({ className, ...props }) {
  return <div className={cn("p-4", className)} {...props} />
}

export function SidebarGroup({ className, ...props }) {
  return <div className={cn("mb-4", className)} {...props} />
}

export function SidebarGroupLabel({ className, ...props }) {
  return <div className={cn("px-3 py-2 text-xs font-semibold", className)} {...props} />
}

export function SidebarGroupContent({ className, ...props }) {
  return <div className={cn("", className)} {...props} />
}

export function SidebarMenu({ className, ...props }) {
  return <div className={cn("space-y-1", className)} {...props} />
}

export function SidebarMenuItem({ className, ...props }) {
  return <div className={cn("", className)} {...props} />
}

export function SidebarMenuButton({ className, asChild, ...props }) {
  const Comp = asChild ? React.Fragment : "button"
  
  if (asChild) {
    return <>{props.children}</>
  }
  
  return (
    <button
      className={cn(
        "w-full text-left px-3 py-2 rounded-md hover:bg-slate-100",
        className
      )}
      {...props}
    />
  )
}

export function SidebarTrigger({ className, children, ...props }) {
  return (
    <button className={cn("", className)} {...props}>
      {children}
    </button>
  )
}