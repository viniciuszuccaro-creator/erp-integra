import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * 🔐 HOOK DE PERMISSÕES V21.7 - 100% GRANULAR
 * 
 * Suporta estrutura completa: módulo → seção → ação
 * Compatível com CentralPerfisAcesso e GerenciamentoAcessosCompleto
 * 
 * Exemplo de uso:
 * const { hasPermission } = usePermissions();
 * if (hasPermission('comercial', 'pedidos', 'criar')) { ... }
 */

export default function usePermissions() {
  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    },
    staleTime: 300000,
    retry: false
  });

  const { data: perfilAcesso, isLoading: loadingPerfil } = useQuery({
    queryKey: ['perfil-acesso', user?.perfil_acesso_id],
    queryFn: async () => {
      if (!user?.perfil_acesso_id) return null;
      try {
        const perfis = await base44.entities.PerfilAcesso.list();
        return perfis.find(p => p.id === user.perfil_acesso_id) || null;
      } catch {
        return null;
      }
    },
    enabled: !!user?.perfil_acesso_id,
    staleTime: 300000
  });

  /**
   * VERIFICAÇÃO GRANULAR DE PERMISSÃO
   * @param {string} modulo - ID do módulo (ex: 'comercial', 'financeiro')
   * @param {string} secao - ID da seção (ex: 'pedidos', 'clientes')
   * @param {string} acao - Ação (ex: 'visualizar', 'criar', 'editar', 'excluir')
   * @returns {boolean}
   */
  const hasPermission = (modulo, secao = null, acao = 'visualizar') => {
    // Admin sempre tem acesso total
    if (user?.role === 'admin') return true;
    
    // Sem perfil = sem permissão
    if (!perfilAcesso) return false;

    const permissoes = perfilAcesso.permissoes || {};

    // Se não especificou seção, verifica se tem a ação em QUALQUER seção do módulo
    if (!secao) {
      const moduloPerms = permissoes[modulo] || {};
      return Object.values(moduloPerms).some(secaoPerms => 
        Array.isArray(secaoPerms) && secaoPerms.includes(acao)
      );
    }

    // Verificação granular: módulo → seção → ação
    const secaoPerms = permissoes[modulo]?.[secao];
    if (!Array.isArray(secaoPerms)) return false;
    
    return secaoPerms.includes(acao);
  };

  /**
   * VERIFICAÇÃO DE QUALQUER PERMISSÃO NO MÓDULO
   */
  const hasAnyPermissionInModule = (modulo) => {
    if (user?.role === 'admin') return true;
    if (!perfilAcesso) return false;

    const moduloPerms = perfilAcesso.permissoes?.[modulo] || {};
    return Object.values(moduloPerms).some(secaoPerms => 
      Array.isArray(secaoPerms) && secaoPerms.length > 0
    );
  };

  /**
   * OBTER TODAS AS PERMISSÕES DO USUÁRIO
   */
  const getAllPermissions = () => {
    if (user?.role === 'admin') return { isAdmin: true, permissoes: {} };
    return {
      isAdmin: false,
      permissoes: perfilAcesso?.permissoes || {}
    };
  };

  /**
   * VERIFICAÇÃO ADMINISTRATIVA
   */
  const isAdmin = () => user?.role === 'admin';

  /**
   * VERIFICAÇÃO DE PERMISSÃO DE APROVAÇÃO (específica)
   */
  const canApprove = (modulo, secao) => {
    return hasPermission(modulo, secao, 'aprovar');
  };

  /**
   * VERIFICAÇÃO DE PERMISSÃO DE EXCLUSÃO (específica)
   */
  const canDelete = (modulo, secao) => {
    return hasPermission(modulo, secao, 'excluir');
  };

  return {
    user,
    perfilAcesso,
    isLoading: loadingUser || loadingPerfil,
    hasPermission,
    hasAnyPermissionInModule,
    getAllPermissions,
    isAdmin,
    canApprove,
    canDelete
  };
}