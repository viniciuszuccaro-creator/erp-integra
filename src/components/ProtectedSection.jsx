import React from "react";
import usePermissions from "@/components/lib/usePermissions";

// ProtectedSection: esconde (por padrão) blocos inteiros quando não há permissão
export default function ProtectedSection({
  children,
  module,
  section = null,
  action = "ver",
  mode = "hide", // "hide" | "disable"
}) {
  const { hasPermission, isLoading } = usePermissions();
  if (isLoading) return null;

  const allowed = hasPermission(module, section, action);
  if (allowed) return <>{children}</>;

  if (mode === "disable") {
    return <div className="opacity-50 pointer-events-none select-none">{children}</div>;
  }
  return null;
}