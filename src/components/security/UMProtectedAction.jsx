import React from 'react';
import { useValidatedAction } from '@/components/lib/useValidatedAction';

/**
 * UM PROTECTED ACTION - AÇÃO PROTEGIDA UNIVERSAL
 * Wrapper minimalista para ações com validação
 * UM = Universal Modular
 */

export default function UMProtectedAction({ 
  module, 
  section, 
  action,
  entity,
  onExecute,
  children 
}) {
  const { executeValidated } = useValidatedAction();

  const handleAction = async (e) => {
    e?.preventDefault?.();
    
    await executeValidated(
      module,
      section,
      action,
      async () => onExecute(e),
      { entity }
    );
  };

  return (
    <div onClick={handleAction} className="cursor-pointer">
      {children}
    </div>
  );
}