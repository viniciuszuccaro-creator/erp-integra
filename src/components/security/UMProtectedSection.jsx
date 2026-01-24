import React from 'react';
import usePermissions from '@/components/lib/usePermissions';

/**
 * UM PROTECTED SECTION - SEÇÃO PROTEGIDA UNIVERSAL
 * Wrapper minimalista para seções com controle de acesso
 * UM = Universal Modular
 */

export default function UMProtectedSection({ 
  module, 
  section, 
  action = 'visualizar',
  children 
}) {
  const { hasPermission, isAdmin, isLoading } = usePermissions();

  if (isLoading) return null;
  
  const allowed = isAdmin() || hasPermission(module, section, action);
  
  return allowed ? <>{children}</> : null;
}