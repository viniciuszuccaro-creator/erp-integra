import { useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useUser } from './UserContext';
import { useContextoVisual } from './useContextoVisual';

/**
 * USE AUDIT IA - HOOK PARA AUDITAR CHAMADAS DE IA
 * Wrapper para InvokeLLM com auditoria automática
 */

export function useAuditIA() {
  const { user } = useUser();
  const { empresaAtual } = useContextoVisual();

  const invokeLLMAuditado = useCallback(async (config) => {
    const startTime = Date.now();
    
    try {
      const response = await base44.integrations.Core.InvokeLLM(config);
      const duracao = Date.now() - startTime;

      // Auditar chamada
      await base44.functions.invoke('iaAuditWrapper', {
        prompt: config.prompt,
        response: JSON.stringify(response),
        model: config.response_json_schema ? 'InvokeLLM-JSON' : 'InvokeLLM-Text',
        modulo: config.module || 'Sistema',
        entidade: config.entity || 'IA',
        registro_id: config.recordId || null,
        usuario_id: user?.id,
        empresa_id: empresaAtual?.id,
        tokens_usados: 0, // Base44 não retorna tokens
        custo_estimado: 0,
        duracao_ms: duracao
      }).catch(() => {}); // Auditoria não deve quebrar a chamada

      return response;

    } catch (error) {
      const duracao = Date.now() - startTime;
      
      // Auditar erro
      await base44.functions.invoke('iaAuditWrapper', {
        prompt: config.prompt,
        response: `Erro: ${error.message}`,
        model: 'InvokeLLM-Error',
        modulo: config.module || 'Sistema',
        entidade: config.entity || 'IA',
        usuario_id: user?.id,
        empresa_id: empresaAtual?.id,
        duracao_ms: duracao
      }).catch(() => {});

      throw error;
    }
  }, [user, empresaAtual]);

  return {
    invokeLLMAuditado
  };
}

export default useAuditIA;