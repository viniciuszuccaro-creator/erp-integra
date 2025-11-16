import usePermissions from '@/components/lib/usePermissions';
import { AuditLogger } from './AuditLogger';

/**
 * V21.0 - MÓDULO 0 - VERIFICADOR DE PERMISSÕES PARA JANELAS
 * ✅ Valida permissões antes de abrir janelas
 * ✅ Registra tentativas negadas
 * ✅ Exibe feedback visual ao usuário
 */

export function usePermissionChecker() {
  const { hasPermission, user } = usePermissions();

  /**
   * Verifica se o usuário pode abrir uma janela específica
   */
  const canOpenWindow = async (windowConfig) => {
    // Se não há permissão necessária, libera
    if (!windowConfig.requiredPermission) {
      return { allowed: true };
    }

    const hasAccess = hasPermission(windowConfig.requiredPermission);

    if (!hasAccess) {
      // Registra tentativa negada
      await AuditLogger.logAccessDenied(
        windowConfig.module || 'Sistema',
        user?.email || 'unknown',
        user?.empresa_selecionada_id || user?.empresa_id,
        windowConfig.requiredPermission
      );

      return {
        allowed: false,
        message: `Você não possui permissão para acessar: ${windowConfig.title}. Contate o administrador.`,
        requiredPermission: windowConfig.requiredPermission
      };
    }

    return { allowed: true };
  };

  /**
   * Mapeamento de módulos para permissões
   */
  const getPermissionForModule = (moduleName) => {
    const permissionMap = {
      'comercial': 'comercial.visualizar',
      'pedidos': 'comercial.visualizar',
      'clientes': 'cadastros.visualizar',
      'produtos': 'cadastros.visualizar',
      'estoque': 'estoque.visualizar',
      'financeiro': 'financeiro.visualizar',
      'fiscal': 'fiscal.visualizar',
      'compras': 'compras.visualizar',
      'expedicao': 'expedicao.visualizar',
      'producao': 'producao.visualizar',
      'rh': 'rh.visualizar',
      'crm': 'crm.visualizar',
      'relatorios': 'relatorios.visualizar',
      'configuracoes': 'configuracoes.acessar',
      'integrações': 'integracoes.visualizar'
    };

    return permissionMap[moduleName.toLowerCase()];
  };

  return {
    canOpenWindow,
    getPermissionForModule,
    hasPermission,
    user
  };
}