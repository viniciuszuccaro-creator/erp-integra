import { useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

/**
 * USE UPDATE IN CONTEXT - HOOK PARA ATUALIZAR COM VALIDAÇÃO
 * ETAPA 1: Valida RBAC + Multiempresa antes de update
 */

export function useUpdateInContext() {
  const { toast } = useToast();

  const updateInContext = useCallback(async (entityName, entityId, dados, module = null) => {
    try {
      // Validação completa no backend
      const validation = await base44.functions.invoke('entityOperationGuard', {
        operation: 'update',
        entityName,
        data: dados,
        entityId,
        module: module || entityName,
        action: 'editar'
      });

      if (!validation.data?.valid) {
        toast({
          title: '🚫 Acesso Negado',
          description: validation.data.reason,
          variant: 'destructive'
        });
        return null;
      }

      // Update aprovado
      return await base44.entities[entityName].update(entityId, dados);

    } catch (error) {
      toast({
        title: '❌ Erro ao atualizar',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  }, [toast]);

  return { updateInContext };
}

export default useUpdateInContext;