import React from 'react';
import { useValidatedAction } from './useValidatedAction';

/**
 * WITH SECURE ACTION - HOC PARA AÇÕES SEGURAS
 * Envolve funções com validação automática
 */

export function withSecureAction(actionFn, config) {
  return function SecureActionWrapper(props) {
    const { executeValidated } = useValidatedAction();

    const wrappedAction = async (...args) => {
      return await executeValidated(
        config.module,
        config.section,
        config.action,
        async () => actionFn(...args),
        config.options || {}
      );
    };

    return wrappedAction;
  };
}

export default withSecureAction;