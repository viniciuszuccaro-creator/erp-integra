import { base44 } from '@/api/base44Client';
import { useCallback } from 'react';
import { useUser } from './UserContext';

/**
 * RBAC BACKEND HOOK
 * Valida permissões no backend antes de ações críticas
 * Complementa usePermissions com enforcement server-side
 */

export function useRBACBackend() {
  const { user } = useUser();

  const validatePermission = useCallback(async (module, section, action) => {
    try {
      const response = await base44.functions.invoke('rbacValidator', {
        module,
        section,
        action
      });

      return {
        authorized: response.data?.authorized || false,
        reason: response.data?.reason
      };
    } catch (error) {
      return {
        authorized: false,
        reason: error.message
      };
    }
  }, []);

  const guardEntityOperation = useCallback(async (operation, entityName, data, recordId, module, action) => {
    try {
      const response = await base44.functions.invoke('entityOperationGuard', {
        operation,
        entityName,
        data,
        recordId,
        module: module || 'Sistema',
        action: action || operation
      });

      return {
        allowed: response.data?.allowed || false,
        reason: response.data?.reason,
        message: response.data?.message
      };
    } catch (error) {
      return {
        allowed: false,
        reason: error.message
      };
    }
  }, []);

  const auditAction = useCallback(async (params) => {
    try {
      await base44.functions.invoke('auditHelper', {
        usuario: user?.full_name || user?.email,
        usuario_id: user?.id,
        ...params
      });
    } catch (error) {
      console.warn('Erro ao auditar:', error);
    }
  }, [user]);

  return {
    validatePermission,
    guardEntityOperation,
    auditAction
  };
}

export default useRBACBackend;