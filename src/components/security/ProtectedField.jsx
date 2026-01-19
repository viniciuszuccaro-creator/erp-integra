import React from "react";
import usePermissions from "@/components/lib/usePermissions";

export default function ProtectedField({
  module: modulo,
  submodule,
  tab,
  field,
  action = "visualizar",
  mask = "••••",
  asText = false,
  children
}) {
  const { isLoading, hasFieldPermission } = usePermissions();
  if (isLoading) return null;
  const allowed = hasFieldPermission ? hasFieldPermission(modulo, submodule, tab, field, action) : false;
  if (allowed) return <>{children}</>;
  return asText ? <span>{mask}</span> : null;
}