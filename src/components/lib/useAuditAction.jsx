import { base44 } from '@/api/base44Client';
import { useUser } from './UserContext';
import useContextoVisual from './useContextoVisual';

/**
 * AUDIT ACTION - Wrapper automático para auditoria em qualquer ação
 * ETAPA 1: Simplifica integração de auditoria em operações
 */

export function useAuditAction() {
  const { user } = useUser();
  const { empresaAtual } = useContextoVisual();

  const auditAction = async (action, module, entity, entityId = null, details = {}) => {
    try {
      await base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário',
        usuario_id: user?.id,
        empresa_id: empresaAtual?.id,
        acao: action,
        modulo: module,
        entidade: entity,
        registro_id: entityId,
        descricao: `${action} em ${entity}${entityId ? ` #${entityId}` : ''}`,
        dados_novos: details,
        data_hora: new Date().toISOString(),
        sucesso: true
      });
    } catch (err) {
      console.error('Erro ao registrar auditoria:', err);
    }
  };

  const wrapAction = (actionName, module, entity) => (fn) => async (...args) => {
    try {
      const result = await fn(...args);
      await auditAction(actionName, module, entity, null, { result: typeof result === 'object' ? JSON.stringify(result).substring(0, 200) : String(result) });
      return result;
    } catch (error) {
      await auditAction(`${actionName} (Erro)`, module, entity, null, { erro: error.message });
      throw error;
    }
  };

  return { auditAction, wrapAction };
}

export default useAuditAction;