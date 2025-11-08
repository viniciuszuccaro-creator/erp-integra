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
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [sessao, setSessao] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verificarSessaoExistente();
    
    // Verificar expiração a cada minuto
    const interval = setInterval(verificarExpiracao, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const verificarSessaoExistente = async () => {
    try {
      const tokenStorage = localStorage.getItem('access_token');
      const refreshStorage = localStorage.getItem('refresh_token');
      const sessaoStorage = localStorage.getItem('sessao_id');

      if (tokenStorage && sessaoStorage) {
        // Verificar se token ainda é válido
        if (!tokenExpirado(tokenStorage)) {
          setAccessToken(tokenStorage);
          setRefreshToken(refreshStorage);
          
          // Buscar sessão
          const sessoes = await base44.entities.SessaoUsuario.filter({ id: sessaoStorage });
          if (sessoes[0] && sessoes[0].ativa) {
            setSessao(sessoes[0]);
            setIsAuthenticated(true);
            
            // Atualizar último acesso
            await atualizarUltimoAcesso(sessoes[0].id);
          }
        } else if (refreshStorage && !tokenExpirado(refreshStorage)) {
          // Tentar renovar com refresh token
          await renovarToken(refreshStorage);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
    } finally {
      setLoading(false);
    }
  };

  const verificarExpiracao = async () => {
    if (!accessToken) return;

    if (tokenExpirado(accessToken)) {
      // Tentar renovar
      if (refreshToken && !tokenExpirado(refreshToken)) {
        await renovarToken(refreshToken);
      } else {
        // Logout
        await logout('Expiração Token');
      }
    }
  };

  const atualizarUltimoAcesso = async (sessaoId) => {
    try {
      const now = new Date().toISOString();
      await base44.entities.SessaoUsuario.update(sessaoId, {
        data_hora_ultimo_acesso: now,
        tempo_inatividade_segundos: 0
      });
    } catch (error) {
      console.error('Erro ao atualizar último acesso:', error);
    }
  };

  const renovarToken = async (refreshTokenAtual) => {
    try {
      const payload = decodificarToken(refreshTokenAtual);
      if (!payload) throw new Error('Token inválido');

      // Buscar usuário
      const usuario = await base44.auth.me();

      // Gerar novos tokens
      const novoAccessToken = gerarTokenSimulado(usuario, 'access');
      const novoRefreshToken = gerarTokenSimulado(usuario, 'refresh');

      // Salvar
      localStorage.setItem('access_token', novoAccessToken);
      localStorage.setItem('refresh_token', novoRefreshToken);
      
      setAccessToken(novoAccessToken);
      setRefreshToken(novoRefreshToken);
      setIsAuthenticated(true);

      // Registrar rotação
      await base44.entities.TokenRefresh.create({
        usuario_id: usuario.id,
        sessao_id: sessao?.id,
        token_hash: btoa(novoRefreshToken),
        token_familia: payload.familia || 'default',
        data_criacao: new Date().toISOString(),
        data_expiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        validade_dias: 30,
        tipo: 'Normal',
        dispositivo_id: localStorage.getItem('device_id') || 'unknown',
        ip_address_criacao: 'auto'
      });

      return novoAccessToken;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      await logout('Erro Refresh');
      throw error;
    }
  };

  const login = async (email, senha, opcoes = {}) => {
    try {
      // Simula autenticação
      const usuario = await base44.auth.me(); // Em produção, seria um endpoint de login

      // Gerar tokens
      const newAccessToken = gerarTokenSimulado(usuario, 'access');
      const newRefreshToken = gerarTokenSimulado(usuario, 'refresh');

      // Criar sessão
      const novaSessao = await base44.entities.SessaoUsuario.create({
        usuario_id: usuario.id,
        usuario_nome: usuario.full_name,
        usuario_email: usuario.email,
        empresa_id: usuario.empresa_padrao_id,
        empresa_nome: usuario.empresa_padrao_nome,
        contexto: 'empresa',
        token_sessao: btoa(newAccessToken),
        data_hora_inicio: new Date().toISOString(),
        data_hora_ultimo_acesso: new Date().toISOString(),
        data_hora_expiracao: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        timeout_inatividade_minutos: 60,
        ip_address: 'auto',
        user_agent: navigator.userAgent,
        dispositivo_tipo: /Mobile|Android|iPhone/.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
        status: 'Ativa',
        ativa: true,
        tipo_autenticacao: opcoes.mfa ? `MFA ${opcoes.mfa_metodo}` : 'Senha',
        mfa_validado: opcoes.mfa || false,
        keep_alive: opcoes.manterConectado || false,
        tentativas_login: opcoes.tentativas || 1
      });

      // Salvar tokens
      localStorage.setItem('access_token', newAccessToken);
      localStorage.setItem('refresh_token', newRefreshToken);
      localStorage.setItem('sessao_id', novaSessao.id);

      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      setSessao(novaSessao);
      setIsAuthenticated(true);

      return { success: true, sessao: novaSessao };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async (motivo = 'Logout Normal') => {
    try {
      if (sessao?.id) {
        await base44.entities.SessaoUsuario.update(sessao.id, {
          status: 'Encerrada',
          ativa: false,
          data_hora_encerramento: new Date().toISOString(),
          motivo_encerramento: motivo,
          duracao_segundos: Math.floor((new Date() - new Date(sessao.data_hora_inicio)) / 1000)
        });
      }

      // Limpar storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('sessao_id');

      setAccessToken(null);
      setRefreshToken(null);
      setSessao(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const revogarTodasSessoes = async (usuarioId) => {
    try {
      const sessoes = await base44.entities.SessaoUsuario.filter({
        usuario_id: usuarioId,
        ativa: true
      });

      for (const s of sessoes) {
        await base44.entities.SessaoUsuario.update(s.id, {
          status: 'Revogada',
          ativa: false,
          data_hora_encerramento: new Date().toISOString(),
          motivo_encerramento: 'Logout Todas Sessões'
        });
      }

      // Se for a sessão atual, fazer logout
      if (sessoes.find(s => s.id === sessao?.id)) {
        await logout('Logout Todas Sessões');
      }
    } catch (error) {
      console.error('Erro ao revogar sessões:', error);
    }
  };

  const listarSessoesAtivas = async (usuarioId) => {
    try {
      const sessoes = await base44.entities.SessaoUsuario.filter({
        usuario_id: usuarioId,
        ativa: true
      }, '-data_hora_inicio');

      return sessoes;
    } catch (error) {
      console.error('Erro ao listar sessões:', error);
      return [];
    }
  };

  const encerrarSessao = async (sessaoId, motivo = 'Logout Remoto') => {
    try {
      await base44.entities.SessaoUsuario.update(sessaoId, {
        status: 'Revogada',
        ativa: false,
        data_hora_encerramento: new Date().toISOString(),
        motivo_encerramento: motivo
      });

      // Se for a sessão atual, fazer logout
      if (sessaoId === sessao?.id) {
        await logout(motivo);
      }
    } catch (error) {
      console.error('Erro ao encerrar sessão:', error);
    }
  };

  return {
    accessToken,
    refreshToken,
    sessao,
    isAuthenticated,
    loading,
    login,
    logout,
    renovarToken,
    revogarTodasSessoes,
    listarSessoesAtivas,
    encerrarSessao,
    tokenExpirado: accessToken ? tokenExpirado(accessToken) : true
  };
}

/**
 * Registrar ação em auditoria
 */
export async function registrarAcaoAuditoria(acao, dados = {}) {
  try {
    const usuario = await base44.auth.me();
    const sessaoId = localStorage.getItem('sessao_id');

    await base44.entities.AuditoriaGlobal.create({
      usuario_id: usuario.id,
      usuario_nome: usuario.full_name,
      usuario_email: usuario.email,
      empresa_id: dados.empresa_id || usuario.empresa_atual_id,
      grupo_id: dados.grupo_id,
      data_hora: new Date().toISOString(),
      acao: acao,
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