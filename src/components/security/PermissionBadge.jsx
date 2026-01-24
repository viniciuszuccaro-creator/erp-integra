import React from 'react';
import { Badge } from '@/components/ui/badge';
import usePermissions from '@/components/lib/usePermissions';
import { Shield, Check, X } from 'lucide-react';

/**
 * PERMISSION BADGE - INDICADOR VISUAL DE PERMISSÃO
 * Mostra status de permissão do usuário para determinada ação
 */

export default function PermissionBadge({ 
  module,
  section = null,
  action = 'visualizar',
  showIcon = true,
  compact = false
}) {
  const { hasPermission, isAdmin } = usePermissions();

  const hasAccess = isAdmin() || hasPermission(module, section, action);

  if (compact) {
    return hasAccess ? (
      <Check className="w-4 h-4 text-green-600" />
    ) : (
      <X className="w-4 h-4 text-red-600" />
    );
  }

  return (
    <Badge 
      variant={hasAccess ? "default" : "destructive"}
      className={hasAccess ? "bg-green-100 text-green-800 border-green-300" : ""}
    >
      {showIcon && (
        hasAccess 
          ? <Check className="w-3 h-3 mr-1" />
          : <Shield className="w-3 h-3 mr-1" />
      )}
      {hasAccess ? 'Permitido' : 'Negado'}
    </Badge>
  );
}