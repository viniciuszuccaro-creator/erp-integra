import { useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useUser } from './UserContext';
import { useContextoVisual } from './useContextoVisual';
import { useToast } from '@/components/ui/use-toast';

/**
 * USE RBAC BACKEND - HOOK PARA VALIDAÇÃO DE PERMISSÕES NO BACKEND
 * Integra validações server-side antes de operações críticas
 * ETAPA 1: Enforcement completo
 */

export function useRBACBackend() {
  const { user } = useUser();
  const { empresaAtual } = useContextoVisual();
  const { toast } = useToast();

  const validatePermission = useCallback(async (module, section, action) => {
    try {
      const response = await base44.functions.invoke('rbacValidator', {
        module,
        section,
        action,
        userId: user?.id
      });

      return response.data;
    } catch (error) {
      toast({
        title: '❌ Erro de validação',
        description: error.message,
        variant: 'destructive'
      });
      return { valid: false, reason: error.message };
    }
  }, [user, toast]);

  const guardEntityOperation = useCallback(async (operation, entityName, data = {}, entityId = null, module = null) => {
    try {
      const response = await base44.functions.invoke('entityOperationGuard', {
        operation,
        entityName,
        data,
        entityId,
        module: module || entityName,
        action: operation
      });

      if (!response.data.valid) {
        toast({
          title: '🚫 Acesso Negado',
          description: response.data.reason,
          variant: 'destructive'
        });
        return false;
      }

      return true;
    } catch (error) {
      toast({
        title: '❌ Erro de validação',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    }
  }, [toast]);

  const auditAction = useCallback(async (acao, modulo, entidade, descricao, dados = {}) => {
    try {
      await base44.functions.invoke('auditHelper', {
        usuario: user?.full_name || user?.email,
        usuario_id: user?.id,
        empresa_id: empresaAtual?.id,
        empresa_nome: empresaAtual?.nome_fantasia || empresaAtual?.razao_social,
        acao,
        modulo,
        entidade,
        descricao,
        dados_novos: dados
      });
    } catch (error) {
      console.warn('Erro ao auditar:', error);
    }
  }, [user, empresaAtual]);

  return {
    validatePermission,
    guardEntityOperation,
    auditAction
  };
}

export default useRBACBackend;