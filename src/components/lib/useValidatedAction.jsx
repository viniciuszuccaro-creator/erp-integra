import { useCallback } from 'react';
import { useRBACBackend } from './useRBACBackend';
import { useToast } from '@/components/ui/use-toast';

/**
 * USE VALIDATED ACTION - HOOK PARA AÇÕES VALIDADAS
 * Executa qualquer ação após validação backend
 * ETAPA 1: Padrão universal
 */

export function useValidatedAction() {
  const { validatePermission, auditAction } = useRBACBackend();
  const { toast } = useToast();

  const executeValidated = useCallback(async (
    module,
    section,
    action,
    actionFn,
    options = {}
  ) => {
    const {
      entity = null,
      recordId = null,
      description = null,
      skipAudit = false
    } = options;

    try {
      // 1. Validar permissão no backend
      const result = await validatePermission(module, section, action);

      if (!result.valid) {
        toast({
          title: '🚫 Acesso Negado',
          description: result.reason,
          variant: 'destructive'
        });
        return { success: false, reason: result.reason };
      }

      // 2. Executar ação
      const actionResult = await actionFn();

      // 3. Auditar (opcional)
      if (!skipAudit) {
        await auditAction(
          action.charAt(0).toUpperCase() + action.slice(1),
          module,
          entity || module,
          description || `${action} em ${module}${section ? `.${section}` : ''}`,
          { recordId, result: actionResult }
        );
      }

      return { success: true, data: actionResult };

    } catch (error) {
      toast({
        title: '❌ Erro na operação',
        description: error.message,
        variant: 'destructive'
      });
      return { success: false, error: error.message };
    }
  }, [validatePermission, auditAction, toast]);

  return { executeValidated };
}

export default useValidatedAction;