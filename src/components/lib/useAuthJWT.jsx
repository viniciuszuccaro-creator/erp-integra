/**
 * Hook de Autenticação com JWT
 * Gerencia tokens, refresh, sessões e segurança
 */

import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Simula geração de JWT (frontend)
 * Em produção real, isso seria feito no backend
 */
function gerarTokenSimulado(usuario, tipo = 'access') {
  const now = new Date();
  const payload = {
    user_id: usuario.id,
    email: usuario.email,
    role: usuario.role,
    empresa_id: usuario.empresa_atual_id || usuario.empresa_padrao_id,
    grupo_id: usuario.grupo_atual_id,
    tipo: tipo,
    iat: now.getTime(),
    exp: tipo === 'access' 
      ? now.getTime() + (15 * 60 * 1000) // 15 minutos
      : now.getTime() + (30 * 24 * 60 * 60 * 1000) // 30 dias
  };

  // Simula JWT (base64)
  const token = btoa(JSON.stringify(payload)) + '.' + Math.random().toString(36);
  return token;
}

/**
 * Decodifica token JWT simulado
 */
function decodificarToken(token) {
  try {
    const [payloadBase64] = token.split('.');
    const payload = JSON.parse(atob(payloadBase64));
    return payload;
  } catch {
    return null;
  }
}

/**
 * Verifica se token está expirado
 */
function tokenExpirado(token) {
  const payload = decodificarToken(token);
  if (!payload) return true;
  
  const now = new Date().getTime();
  return now >= payload.exp;
}

/**
 * Hook principal de autenticação JWT
 */
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

  const login = async (nextUrl) => {
    await base44.auth.redirectToLogin(nextUrl);
  };

  const logout = async (redirectUrl) => {
    await base44.auth.logout(redirectUrl);
  };

  const revogarTodasSessoes = async (usuarioId) => {
    const sessoes = await base44.entities.SessaoUsuario.filter({ usuario_id: usuarioId, ativa: true });
    for (const s of sessoes) {
      await base44.entities.SessaoUsuario.update(s.id, {
        status: 'Revogada', ativa: false, data_hora_encerramento: new Date().toISOString(), motivo_encerramento: 'Logout Todas Sessões'
      });
    }
  };

  const listarSessoesAtivas = async (usuarioId) => {
    return await base44.entities.SessaoUsuario.filter({ usuario_id: usuarioId, ativa: true }, '-data_hora_inicio');
  };

  const encerrarSessao = async (sessaoId, motivo = 'Logout Remoto') => {
    await base44.entities.SessaoUsuario.update(sessaoId, {
      status: 'Revogada', ativa: false, data_hora_encerramento: new Date().toISOString(), motivo_encerramento: motivo
    });
  };

  return {
    accessToken: null,
    refreshToken: null,
    sessao: null,
    isAuthenticated,
    loading,
    login,
    logout,
    renovarToken: async () => null,
    revogarTodasSessoes,
    listarSessoesAtivas,
    encerrarSessao,
    tokenExpirado: true
  };
}

/**
 * Registrar ação em auditoria
 */
export async function registrarAcaoAuditoria(acao, dados = {}) {
  try {
    const usuario = await base44.auth.me();
    await base44.entities.AuditoriaGlobal.create({
      usuario_id: usuario.id,
      usuario_nome: usuario.full_name,
      usuario_email: usuario.email,
      empresa_id: dados.empresa_id || usuario.empresa_atual_id,
      grupo_id: dados.grupo_id,
      data_hora: new Date().toISOString(),
      acao,
      modulo: dados.modulo || 'Sistema',
      entidade_afetada: dados.entidade,
      registro_id: dados.registro_id,
      dados_antes: dados.dados_antes,
      dados_depois: dados.dados_depois,
      ip_address: 'auto',
      user_agent: navigator.userAgent,
      sucesso: dados.sucesso !== false,
      mensagem_erro: dados.erro,
      duracao_ms: dados.duracao_ms
    });
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
  }
}

export default {
  useAuthJWT,
  registrarAcaoAuditoria
};