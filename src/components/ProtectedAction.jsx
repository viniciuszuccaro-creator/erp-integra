import React from "react";
import usePermissions from "@/components/lib/usePermissions";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export function ProtectedAction({ children, module, section = null, action = "editar", fallback = null }) { 
  children, 
  module, 
  action = "editar",
  fallback = null 
}) {
  const { hasPermission, isLoading } = usePermissions();

  if (isLoading) {
    return null;
  }

  if (!hasPermission(module, section, action)) {
    if (fallback) return fallback;
    
    return (
      <Button variant="ghost" size="sm" disabled className="opacity-50">
        <Lock className="w-4 h-4 mr-2" />
        Sem permissão
      </Button>
    );
  }

  return <>{children}</>;
}

export default ProtectedAction;