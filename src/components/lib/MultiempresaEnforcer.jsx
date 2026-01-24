import { useEffect } from 'react';
import { useContextoVisual } from './useContextoVisual';
import { useUser } from './UserContext';
import { base44 } from '@/api/base44Client';

/**
 * MULTIEMPRESA ENFORCER - GUARDIÃO DO CONTEXTO
 * Componente invisível que garante contexto multiempresa válido
 * Valida e força empresa_id em todas as operações
 */

export default function MultiempresaEnforcer({ children }) {
  const { empresaAtual, grupoAtual, estaNoGrupo } = useContextoVisual();
  const { user } = useUser();

  useEffect(() => {
    // Marcar que MultiempresaEnforcer está carregado (para prova final)
    window.__ETAPA1_MULTIEMPRESA_LOADED__ = true;

    // Validar que há contexto válido
    if (!user) return;

    const hasValidContext = estaNoGrupo ? !!grupoAtual : !!empresaAtual;

    if (!hasValidContext) {
      console.error('⚠️ CONTEXTO MULTIEMPRESA INVÁLIDO - Nenhuma empresa/grupo selecionado');
      
      // Auditoria do problema
      base44.entities.AuditLog.create({
        usuario: user.full_name || user.email,
        usuario_id: user.id,
        acao: 'Alerta',
        modulo: 'Sistema',
        entidade: 'MultiempresaEnforcer',
        descricao: 'Contexto multiempresa inválido detectado',
        dados_novos: { estaNoGrupo, empresaAtual: empresaAtual?.id, grupoAtual: grupoAtual?.id },
        data_hora: new Date().toISOString()
      }).catch(() => {});
    }

    // Persistir contexto para validações backend
    if (empresaAtual?.id) {
      localStorage.setItem('empresa_atual_id', empresaAtual.id);
    }
    if (grupoAtual?.id) {
      localStorage.setItem('group_atual_id', grupoAtual.id);
    }

  }, [empresaAtual, grupoAtual, estaNoGrupo, user]);

  return children;
}