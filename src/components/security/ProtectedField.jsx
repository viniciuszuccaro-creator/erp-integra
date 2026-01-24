import React from 'react';
import usePermissions from '@/components/lib/usePermissions';
import { Lock } from 'lucide-react';

/**
 * PROTECTED FIELD - CAMPO COM CONTROLE GRANULAR
 * Componente modular para campos sensíveis
 * ETAPA 1: Granularidade por campo
 */

export default function ProtectedField({ 
  module, 
  section, 
  field,
  action = 'visualizar',
  value,
  children,
  hideWhenDenied = false
}) {
  const { hasFieldPermission, isAdmin } = usePermissions();

  const canView = isAdmin() || hasFieldPermission(module, section, null, field, 'visualizar');
  const canEdit = isAdmin() || hasFieldPermission(module, section, null, field, action);

  if (!canView) {
    if (hideWhenDenied) return null;
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <Lock className="w-4 h-4" />
        <span className="text-sm">Campo restrito</span>
      </div>
    );
  }

  if (!canEdit && value !== undefined) {
    return (
      <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border">
        <Lock className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-700">{value || '-'}</span>
      </div>
    );
  }

  return <>{children}</>;
}