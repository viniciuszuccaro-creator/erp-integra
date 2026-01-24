import React from 'react';
import { useRBACBackend } from './useRBACBackend';
import { useUser } from './UserContext';
import { useContextoVisual } from './useContextoVisual';

/**
 * AUDIT WRAPPER - HOC PARA AUDITORIA AUTOMÁTICA
 * Envolve componentes e audita suas ações automaticamente
 */

export function withAudit(Component, config = {}) {
  return function AuditedComponent(props) {
    const { auditAction } = useRBACBackend();
    const { user } = useUser();
    const { empresaAtual } = useContextoVisual();

    const handleAuditedAction = async (actionName, actionFn, metadata = {}) => {
      const startTime = Date.now();
      
      try {
        const result = await actionFn();
        
        const duration = Date.now() - startTime;
        
        await auditAction({
          empresa_id: empresaAtual?.id,
          empresa_nome: empresaAtual?.nome_fantasia || empresaAtual?.razao_social,
          acao: actionName,
          modulo: config.module || 'Sistema',
          entidade: config.entity || 'Genérica',
          descricao: `${actionName} executado via ${Component.name || 'Componente'}`,
          dados_novos: metadata,
          origem: 'AuditWrapper',
          metadata: {
            component: Component.name,
            duration_ms: duration,
            ...metadata
          }
        });

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        await auditAction({
          empresa_id: empresaAtual?.id,
          acao: 'Erro',
          modulo: config.module || 'Sistema',
          entidade: config.entity || 'Genérica',
          descricao: `Erro em ${actionName}: ${error.message}`,
          dados_novos: { error: error.message, metadata },
          origem: 'AuditWrapper',
          metadata: {
            component: Component.name,
            duration_ms: duration,
            error: true
          }
        });

        throw error;
      }
    };

    return (
      <Component 
        {...props} 
        auditedAction={handleAuditedAction}
      />
    );
  };
}

export default withAudit;