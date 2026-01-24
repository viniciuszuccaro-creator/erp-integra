import React from 'react';
import { Button } from '@/components/ui/button';
import { useValidatedAction } from '@/components/lib/useValidatedAction';
import { Lock } from 'lucide-react';
import usePermissions from '@/components/lib/usePermissions';

/**
 * SECURE ACTION BUTTON - BOTÃO COM VALIDAÇÃO AUTOMÁTICA
 * Versão simplificada do ProtectedButton focada em ações
 */

export default function SecureActionButton({ 
  module, 
  section, 
  action,
  entity,
  onClick,
  children,
  ...props 
}) {
  const { executeValidated } = useValidatedAction();
  const { hasPermission, isAdmin, isLoading } = usePermissions();

  const allowed = isAdmin() || hasPermission(module, section, action);

  const handleClick = async (e) => {
    e.preventDefault();
    
    const result = await executeValidated(
      module,
      section,
      action,
      async () => onClick(e),
      { entity }
    );

    return result;
  };

  if (isLoading) {
    return <Button {...props} disabled><Lock className="w-4 h-4 mr-2" />Carregando...</Button>;
  }

  if (!allowed) {
    return (
      <Button {...props} disabled variant="outline">
        <Lock className="w-4 h-4 mr-2" />
        {children}
      </Button>
    );
  }

  return (
    <Button {...props} onClick={handleClick}>
      {children}
    </Button>
  );
}