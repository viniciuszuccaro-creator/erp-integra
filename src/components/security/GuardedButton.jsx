import React from "react";
import { Button } from "@/components/ui/button";
import usePermissions from "@/components/lib/usePermissions";

export default function GuardedButton({ module, section = null, action = "visualizar", children, ...props }) {
  const { hasPermission } = usePermissions();
  const allowed = hasPermission(module, section, action);
  return (
    <Button {...props} disabled={!allowed || props.disabled} title={!allowed ? "Acesso restrito" : props.title}>
      {children}
    </Button>
  );
}