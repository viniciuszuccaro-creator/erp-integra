import React from 'react';
import usePermissions from '@/components/lib/usePermissions';

/**
 * PROTECTED FIELD - Proteção granular por campo dentro de uma seção
 * ETAPA 1: Controle a nível de campo
 */

export default function ProtectedField({
  module,
  section = null,
  field = null,
  action = 'editar',
  children,
  readOnly = false,
  show = true
}) {
  const { hasPermission, isLoading } = usePermissions();

  if (isLoading) {
    return children;
  }

  const path = [section, field].filter(Boolean);
  const allowed = show && hasPermission(module, path.length > 0 ? path : section, action);

  if (!allowed) {
    // Se não tem permissão para editar, renderizar como read-only
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          disabled: true,
          readOnly: true,
          className: `${child.props.className || ''} opacity-60 cursor-not-allowed`
        });
      }
      return child;
    });
  }

  return children;
}