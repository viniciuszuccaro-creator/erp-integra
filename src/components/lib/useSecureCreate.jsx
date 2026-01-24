import { useCallback } from 'react';
import { useContextoVisual } from './useContextoVisual';
import { useRBACBackend } from './useRBACBackend';
import { useToast } from '@/components/ui/use-toast';

/**
 * USE SECURE CREATE - CRIAÇÃO SEGURA COM VALIDAÇÃO TOTAL
 * Hook modular para criar entidades com RBAC + Multiempresa
 */

export function useSecureCreate() {
  const { createInContext } = useContextoVisual();
  const { guardEntityOperation } = useRBACBackend();
  const { toast } = useToast();

  const secureCreate = useCallback(async (entityName, dados, options = {}) => {
    const { module = null, showSuccess = true } = options;

    try {
      const ok = await guardEntityOperation('create', entityName, dados, null, module);
      if (!ok) return null;

      const result = await createInContext(entityName, dados);
      
      if (showSuccess) {
        toast({ title: '✅ Criado com sucesso' });
      }

      return result;
    } catch (error) {
      toast({
        title: '❌ Erro ao criar',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    }
  }, [createInContext, guardEntityOperation, toast]);

  return { secureCreate };
}

export default useSecureCreate;