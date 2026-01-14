import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// Autenticação nativa Base44 (sem JWT). Mantemos o nome do hook para compatibilidade.
export function useAuthJWT() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const ok = await base44.auth.isAuthenticated();
        setIsAuthenticated(!!ok);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return {
    isAuthenticated,
    loading,
    login: base44.auth.redirectToLogin,
    logout: base44.auth.logout,
    // Gestão de sessões usando entidades nativas (compatível com multiempresa)
    revogarTodasSessoes: async (usuarioId) => {
      const sessoes = await base44.entities.SessaoUsuario.filter({ usuario_id: usuarioId, ativa: true });
      for (const s of sessoes) {
        await base44.entities.SessaoUsuario.update(s.id, {
          status: 'Revogada', ativa: false, data_hora_encerramento: new Date().toISOString(), motivo_encerramento: 'Logout Todas Sessões'
        });
      }
    },
    listarSessoesAtivas: async (usuarioId) =>
      base44.entities.SessaoUsuario.filter({ usuario_id: usuarioId, ativa: true }, '-data_hora_inicio'),
    encerrarSessao: async (sessaoId, motivo = 'Logout Remoto') =>
      base44.entities.SessaoUsuario.update(sessaoId, {
        status: 'Revogada', ativa: false, data_hora_encerramento: new Date().toISOString(), motivo_encerramento: motivo
      }),
  };
}

// Auditoria mínima unificada
export async function registrarAcaoAuditoria(acao, dados = {}) {
  try {
    const usuario = await base44.auth.me();
    await base44.entities.AuditoriaGlobal.create({
      usuario_id: usuario.id,
      usuario_nome: usuario.full_name,
      usuario_email: usuario.email,
      empresa_id: dados.empresa_id || usuario.empresa_atual_id || null,
      grupo_id: dados.grupo_id || null,
      data_hora: new Date().toISOString(),
      acao,
      modulo: dados.modulo || 'Sistema',
      entidade_afetada: dados.entidade,
      registro_id: dados.registro_id,
      dados_antes: dados.dados_antes,
      dados_depois: dados.dados_depois,
      ip_address: 'auto',
      user_agent: globalThis?.navigator?.userAgent || 'n/a',
      sucesso: dados.sucesso !== false,
      mensagem_erro: dados.erro,
      duracao_ms: dados.duracao_ms
    });
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
  }
}

export default { useAuthJWT, registrarAcaoAuditoria };