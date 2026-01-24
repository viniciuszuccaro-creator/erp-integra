import React from 'react';
import usePermissions from '@/components/lib/usePermissions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

/**
 * PROTECTED SECTION - PROTEÇÃO VISUAL DE SEÇÕES
 * Componente modular para controlar visibilidade
 * ETAPA 1: Componentização
 */

export default function ProtectedSection({ 
  module, 
  section = null, 
  action = 'visualizar',
  children,
  fallback = null,
  showDenied = false
}) {
  const { hasPermission, isAdmin, isLoading } = usePermissions();

  if (isLoading) {
    return <div className="animate-pulse bg-slate-100 rounded h-20 w-full" />;
  }

  const allowed = isAdmin() || hasPermission(module, section, action);

  if (!allowed) {
    if (showDenied) {
      return (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Acesso Restrito</AlertTitle>
          <AlertDescription>
            Você não tem permissão para visualizar esta seção.
          </AlertDescription>
        </Alert>
      );
    }
    return fallback;
  }

  return <>{children}</>;
}