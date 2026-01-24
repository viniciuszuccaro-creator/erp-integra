import React from 'react';
import { useRBACBackend } from './useRBACBackend';

/**
 * AUDIT WRAPPER - HOC PARA AUDITORIA AUTOMÁTICA
 * Envolve componentes e audita suas ações automaticamente
 * ETAPA 1: Componentização modular
 */

export function withAudit(Component, config = {}) {
  const {
    modulo = 'Sistema',
    entidade = 'Genérico',
    acaoDefault = 'Visualização'
  } = config;

  return function AuditedComponent(props) {
    const { auditAction } = useRBACBackend();

    React.useEffect(() => {
      // Auditar montagem do componente
      auditAction(
        acaoDefault,
        modulo,
        entidade,
        `${entidade} renderizado`,
        { component: Component.name }
      );
    }, []);

    return <Component {...props} />;
  };
}

export default withAudit;