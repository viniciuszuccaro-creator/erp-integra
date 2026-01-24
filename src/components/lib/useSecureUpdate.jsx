import { useCallback } from 'react';
import { useUpdateInContext } from './useUpdateInContext';
import { useToast } from '@/components/ui/use-toast';

/**
 * USE SECURE UPDATE - ATUALIZAÇÃO SEGURA
 * Hook modular para update com validação
 */

export function useSecureUpdate() {
  const { updateInContext } = useUpdateInContext();
  const { toast } = useToast();

  const secureUpdate = useCallback(async (entityName, entityId, dados, options = {}) => {
    const { module = null, showSuccess = true } = options;

    try {
      const result = await updateInContext(entityName, entityId, dados, module);
      
      if (result && showSuccess) {
        toast({ title: '✅ Atualizado com sucesso' });
      }

      return result;
    } catch (error) {
      toast({
        title: '❌ Erro ao atualizar',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    }
  }, [updateInContext, toast]);

  return { secureUpdate };
}

export default useSecureUpdate;