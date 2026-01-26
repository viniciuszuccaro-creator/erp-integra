import React from "react";
import usePermissions from "@/components/lib/usePermissions";

export default function ProtectedSection({
  module: modulo,
  section,
  action = "visualizar",
  fallback = null,
  children
}) {
  const { isLoading, hasPermission } = usePermissions();

  if (isLoading) return null;
  const allowed = hasPermission(modulo, section, action);
  if (!allowed) return fallback;
  return <>{children}</>;
}