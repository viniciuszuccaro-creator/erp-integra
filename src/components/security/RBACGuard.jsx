import React from 'react';
import usePermissions from '@/components/lib/usePermissions';
import { Shield, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * RBAC GUARD - BLOQUEIO VISUAL DE CONTEÚDO
 * Componente que oculta ou bloqueia conteúdo baseado em permissões
 */

export default function RBACGuard({ 
  module,
  section = null,
  action = 'visualizar',
  children,
  fallback = null,
  showDeniedMessage = false,
  denyMessage = 'Você não tem permissão para acessar este conteúdo.'
}) {
  const { hasPermission, isAdmin, isLoading } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const hasAccess = isAdmin() || hasPermission(module, section, action);

  if (!hasAccess) {
    if (showDeniedMessage) {
      return (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <Shield className="h-4 w-4" />
          <AlertDescription className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            {denyMessage}
          </AlertDescription>
        </Alert>
      );
    }

    return fallback;
  }

  return <>{children}</>;
}