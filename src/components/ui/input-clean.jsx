import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Input LIMPO - SEM auditoria, SEM wrappers, SEM interferências
 * V22.0 - Criado especificamente para resolver problemas de interatividade em campos de busca
 * 
 * Este componente é 100% nativo, sem qualquer lógica de auditoria que possa
 * interferir com a digitação do usuário.
 */
const InputClean = React.forwardRef(({ className, type, onChange, ...props }, ref) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      onChange={handleChange}
      {...props}
    />
  );
})
InputClean.displayName = "InputClean"

export { InputClean }