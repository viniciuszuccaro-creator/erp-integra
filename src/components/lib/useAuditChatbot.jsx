import { useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from './useContextoVisual';

/**
 * USE AUDIT CHATBOT - HOOK PARA AUDITAR INTERAÇÕES DO CHATBOT
 * Wrapper para ações do chatbot com auditoria automática
 */

export function useAuditChatbot() {
  const { empresaAtual } = useContextoVisual();

  const auditarInteracao = useCallback(async ({
    conversaId,
    mensagem,
    tipo = 'mensagem',
    intent = null,
    entidadeAfetada = null,
    registroId = null,
    acaoExecutada = null,
    resultado = null,
    erro = null,
    canal = 'Sistema',
    clienteId = null
  }) => {
    try {
      await base44.functions.invoke('chatbotAuditWrapper', {
        conversaId,
        mensagem,
        tipo,
        intent,
        entidadeAfetada,
        registroId,
        acaoExecutada,
        resultado,
        erro,
        canal,
        clienteId,
        empresaId: empresaAtual?.id
      });
    } catch (err) {
      console.warn('Erro ao auditar chatbot:', err);
    }
  }, [empresaAtual]);

  const executarAcaoChatbot = useCallback(async (intent, acaoFn, metadata = {}) => {
    const startTime = Date.now();
    
    try {
      const resultado = await acaoFn();
      const duracao = Date.now() - startTime;

      await auditarInteracao({
        ...metadata,
        intent,
        resultado: JSON.stringify(resultado).substring(0, 500),
        acaoExecutada: metadata.acaoExecutada || intent
      });

      return resultado;

    } catch (error) {
      const duracao = Date.now() - startTime;

      await auditarInteracao({
        ...metadata,
        intent,
        erro: error.message,
        acaoExecutada: metadata.acaoExecutada || intent
      });

      throw error;
    }
  }, [auditarInteracao]);

  return {
    auditarInteracao,
    executarAcaoChatbot
  };
}

export default useAuditChatbot;