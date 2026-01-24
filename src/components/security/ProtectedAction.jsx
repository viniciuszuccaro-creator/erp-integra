import React from 'react';
import { useRBACBackend } from '@/components/lib/useRBACBackend';
import { useToast } from '@/components/ui/use-toast';

/**
 * PROTECTED ACTION - HOC PARA AÇÕES PROTEGIDAS
 * Valida permissão no backend antes de executar ação
 * ETAPA 1: Enforcement automático
 */

export function ProtectedAction({ 
  module, 
  section = null, 
  action,
  onExecute,
  children,
  showDenied = false 
}) {
  const { validatePermission } = useRBACBackend();
  const { toast } = useToast();

  const handleClick = async (e) => {
    e.preventDefault();
    
    // Validar no backend
    const result = await validatePermission(module, section, action);

    if (!result.valid) {
      toast({
        title: '🚫 Acesso Negado',
        description: result.reason,
        variant: 'destructive'
      });
      return;
    }

    // Executar ação
    if (onExecute) {
      await onExecute(e);
    }
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      {children}
    </div>
  );
}

export default ProtectedAction;