import React from 'react';
import { Button } from '@/components/ui/button';
import usePermissions from './usePermissions';
import { Shield } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

/**
 * PROTECTED BUTTON - BOTÃO COM RBAC AUTOMÁTICO
 * Componente reutilizável que verifica permissões e oculta/desabilita automaticamente
 */

export default function ProtectedButton({ 
  module,
  section = null,
  action = 'criar',
  children,
  onClick,
  hideWhenDenied = false,
  showLockIcon = false,
  ...buttonProps 
}) {
  const { hasPermission, isAdmin } = usePermissions();
  const { toast } = useToast();

  const hasAccess = isAdmin() || hasPermission(module, section, action);

  const handleClick = (e) => {
    if (!hasAccess) {
      e.preventDefault();
      e.stopPropagation();
      toast({
        title: "🔒 Acesso Negado",
        description: `Você não tem permissão para ${action} neste módulo.`,
        variant: "destructive"
      });
      return;
    }

    if (onClick) {
      onClick(e);
    }
  };

  if (hideWhenDenied && !hasAccess) {
    return null;
  }

  return (
    <Button
      {...buttonProps}
      onClick={handleClick}
      disabled={!hasAccess || buttonProps.disabled}
      className={`${buttonProps.className || ''} ${!hasAccess ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {!hasAccess && showLockIcon && <Shield className="w-4 h-4 mr-2" />}
      {children}
    </Button>
  );
}