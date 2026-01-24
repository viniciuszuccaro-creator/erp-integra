import { useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useUser } from './UserContext';
import { useContextoVisual } from './useContextoVisual';

/**
 * USE AUDIT ACTION - HOOK SIMPLES PARA AUDITORIA
 * Auditoria manual de ações específicas
 */

export function useAuditAction() {
  const { user } = useUser();
  const { empresaAtual } = useContextoVisual();

  const audit = useCallback(async (acao, modulo, entidade, descricao, dados = {}) => {
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

  return { audit };
}

export default useAuditAction;