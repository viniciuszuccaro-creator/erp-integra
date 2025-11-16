import { base44 } from '@/api/base44Client';

/**
 * V21.0 - MÓDULO 0 - SISTEMA DE AUDITORIA PARA JANELAS MULTITAREFA
 * ✅ Log automático de todas as ações de UI
 * ✅ Rastreamento de permissões negadas
 * ✅ Análise de uso e padrões
 */

export const AuditLogger = {
  /**
   * Registra abertura de janela
   */
  async logWindowOpen(windowConfig, userId, empresaId) {
    try {
      await base44.entities.AuditLog.create({
        usuario: userId,
        empresa_id: empresaId,
        acao: 'Visualização',
        modulo: 'Sistema',
        entidade: 'Window',
        descricao: `Abriu janela: ${windowConfig.title}`,
        dados_novos: {
          windowId: windowConfig.id,
          tipo: windowConfig.type,
          modulo: windowConfig.module
        },
        data_hora: new Date().toISOString(),
        sucesso: true
      });
    } catch (error) {
      console.error('Erro ao registrar log de abertura:', error);
    }
  },

  /**
   * Registra fechamento de janela
   */
  async logWindowClose(window, userId, empresaId, tempoAberto) {
    try {
      await base44.entities.AuditLog.create({
        usuario: userId,
        empresa_id: empresaId,
        acao: 'Visualização',
        modulo: 'Sistema',
        entidade: 'Window',
        descricao: `Fechou janela: ${window.title}`,
        dados_novos: {
          windowId: window.id,
          tempoAbertoSegundos: tempoAberto
        },
        data_hora: new Date().toISOString(),
        sucesso: true
      });
    } catch (error) {
      console.error('Erro ao registrar log de fechamento:', error);
    }
  },

  /**
   * Registra tentativa de acesso negado
   */
  async logAccessDenied(modulo, usuario, empresaId, permissaoNecessaria) {
    try {
      await base44.entities.AuditLog.create({
        usuario: usuario,
        empresa_id: empresaId,
        acao: 'Visualização',
        modulo: modulo,
        entidade: 'PermissaoNegada',
        descricao: `Tentativa de acesso sem permissão: ${permissaoNecessaria}`,
        dados_novos: {
          permissao_necessaria: permissaoNecessaria,
          modulo: modulo
        },
        data_hora: new Date().toISOString(),
        sucesso: false,
        mensagem_erro: 'Permissão negada'
      });
    } catch (error) {
      console.error('Erro ao registrar acesso negado:', error);
    }
  },

  /**
   * Registra ações da janela (minimizar, maximizar, etc)
   */
  async logWindowAction(action, window, userId, empresaId) {
    try {
      await base44.entities.AuditLog.create({
        usuario: userId,
        empresa_id: empresaId,
        acao: 'Edição',
        modulo: 'Sistema',
        entidade: 'Window',
        descricao: `${action} janela: ${window.title}`,
        dados_novos: {
          acao: action,
          windowId: window.id
        },
        data_hora: new Date().toISOString(),
        sucesso: true
      });
    } catch (error) {
      console.error('Erro ao registrar ação da janela:', error);
    }
  }
};