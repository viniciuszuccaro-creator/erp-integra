import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import usePermissions from './usePermissions';
import { Lock } from 'lucide-react';

/**
 * PROTECTED FIELD INPUT - CAMPO COM RBAC GRANULAR
 * Campo que só permite edição se houver permissão específica
 */

export default function ProtectedFieldInput({ 
  module,
  section = null,
  field = null,
  action = 'editar',
  type = 'input',
  hideWhenDenied = false,
  readOnlyWhenDenied = true,
  ...inputProps 
}) {
  const { hasPermission, hasFieldPermission, isAdmin } = usePermissions();

  // Verificar permissão hierárquica: campo específico > seção > módulo
  const hasAccess = isAdmin() || (
    field 
      ? hasFieldPermission(module, section, null, field, action)
      : hasPermission(module, section, action)
  );

  if (hideWhenDenied && !hasAccess) {
    return null;
  }

  const Component = type === 'textarea' ? Textarea : Input;

  return (
    <div className="relative w-full">
      <Component
        {...inputProps}
        readOnly={!hasAccess || (readOnlyWhenDenied && !hasAccess) || inputProps.readOnly}
        disabled={!hasAccess || inputProps.disabled}
        className={`${inputProps.className || ''} ${!hasAccess ? 'bg-slate-100 cursor-not-allowed' : ''}`}
      />
      {!hasAccess && (
        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      )}
    </div>
  );
}