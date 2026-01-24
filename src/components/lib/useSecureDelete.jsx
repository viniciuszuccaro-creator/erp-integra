import { useCallback } from 'react';
import { useDeleteInContext } from './useDeleteInContext';

/**
 * USE SECURE DELETE - EXCLUSÃO SEGURA
 * Hook modular para delete com validação
 */

export function useSecureDelete() {
  const { deleteInContext } = useDeleteInContext();

  const secureDelete = useCallback(async (entityName, entityId, module = null) => {
    return await deleteInContext(entityName, entityId, module);
  }, [deleteInContext]);

  return { secureDelete };
}

export default useSecureDelete;