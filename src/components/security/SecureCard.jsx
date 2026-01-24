import React from 'react';
import { Card } from '@/components/ui/card';
import usePermissions from '@/components/lib/usePermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';

/**
 * SECURE CARD - CARD COM CONTROLE DE ACESSO
 * Versão protegida do Card padrão
 */

export default function SecureCard({ 
  module, 
  section, 
  action = 'visualizar',
  children,
  showLock = false,
  ...props 
}) {
  const { hasPermission, isAdmin, isLoading } = usePermissions();

  if (isLoading) return null;

  const allowed = isAdmin() || hasPermission(module, section, action);

  if (!allowed) {
    if (showLock) {
      return (
        <Card {...props} className="opacity-50">
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>Conteúdo restrito</AlertDescription>
          </Alert>
        </Card>
      );
    }
    return null;
  }

  return <Card {...props}>{children}</Card>;
}