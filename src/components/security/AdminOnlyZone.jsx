import React from 'react';
import usePermissions from '@/components/lib/usePermissions';
import { ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * ADMIN ONLY ZONE - ÁREA EXCLUSIVA DE ADMINISTRADORES
 * Componente para proteger seções críticas do sistema
 */

export default function AdminOnlyZone({ 
  children,
  message = 'Esta área é restrita a administradores do sistema.',
  showWarning = true
}) {
  const { isAdmin, isLoading, user } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin()) {
    if (showWarning) {
      return (
        <div className="max-w-2xl mx-auto p-8">
          <Alert variant="destructive" className="border-red-300 bg-red-50">
            <ShieldAlert className="h-5 w-5" />
            <AlertTitle className="text-lg font-bold">Acesso Restrito</AlertTitle>
            <AlertDescription className="mt-2">
              {message}
              <div className="mt-4 p-3 bg-white rounded border border-red-200">
                <p className="text-sm text-slate-600">
                  <strong>Usuário atual:</strong> {user?.full_name || user?.email}
                </p>
                <p className="text-sm text-slate-600">
                  <strong>Nível:</strong> {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
}