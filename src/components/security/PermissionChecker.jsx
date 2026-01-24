import React from 'react';
import usePermissions from '@/components/lib/usePermissions';

/**
 * PERMISSION CHECKER - VERIFICADOR UNIVERSAL
 * Componente minimalista apenas para checar permissões
 */

export default function PermissionChecker({ 
  module, 
  section, 
  action,
  children,
  fallback = null
}) {
  const { hasPermission, isAdmin } = usePermissions();

  const allowed = isAdmin() || hasPermission(module, section, action);

  return allowed ? <>{children}</> : fallback;
}