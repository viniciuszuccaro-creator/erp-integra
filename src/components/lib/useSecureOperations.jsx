import { useSecureCreate } from './useSecureCreate';
import { useSecureUpdate } from './useSecureUpdate';
import { useSecureDelete } from './useSecureDelete';

/**
 * USE SECURE OPERATIONS - ALL-IN-ONE HOOK
 * Agrupa todas as operações seguras em um único hook
 * ETAPA 1: Facilita integração em componentes
 */

export function useSecureOperations() {
  const { secureCreate } = useSecureCreate();
  const { secureUpdate } = useSecureUpdate();
  const { secureDelete } = useSecureDelete();

  return {
    secureCreate,
    secureUpdate,
    secureDelete
  };
}

export default useSecureOperations;