import { useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

/**
 * USE DELETE IN CONTEXT - HOOK PARA EXCLUIR COM VALIDAÇÃO
 * ETAPA 1: Valida RBAC + Multiempresa antes de delete
 */

export function useDeleteInContext() {
  const { toast } = useToast();

  const deleteInContext = useCallback(async (entityName, entityId, module = null) => {
    try {
      // Validação completa no backend
      const validation = await base44.functions.invoke('entityOperationGuard', {
        operation: 'delete',
        entityName,
        entityId,
        module: module || entityName,
        action: 'excluir'
      });

      if (!validation.data?.valid) {
        toast({
          title: '🚫 Acesso Negado',
          description: validation.data.reason,
          variant: 'destructive'
        });
        return false;
      }

      // Delete aprovado
      await base44.entities[entityName].delete(entityId);
      
      toast({
        title: '✅ Excluído com sucesso'
      });

      return true;

    } catch (error) {
      toast({
        title: '❌ Erro ao excluir',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    }
  }, [toast]);

  return { deleteInContext };
}

export default useDeleteInContext;