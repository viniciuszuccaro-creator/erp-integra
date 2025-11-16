import React, { useEffect } from 'react';
import { WindowManagerProvider, useWindowManager } from './WindowManager';
import { usePermissionChecker } from './PermissionChecker';
import { AuditLogger } from './AuditLogger';
import { toast } from 'sonner';

/**
 * V21.0 - MÓDULO 0 - WINDOW MANAGER APRIMORADO
 * ✅ Integração com auditoria
 * ✅ Verificação de permissões
 * ✅ Tracking de uso
 * ✅ Alertas e validações
 */

export function WindowManagerEnhancedProvider({ children }) {
  return (
    <WindowManagerProvider>
      <WindowManagerEnhancedWrapper>
        {children}
      </WindowManagerEnhancedWrapper>
    </WindowManagerProvider>
  );
}

function WindowManagerEnhancedWrapper({ children }) {
  const windowManager = useWindowManager();
  const { canOpenWindow, user } = usePermissionChecker();

  // Função aprimorada para abrir janelas com validação de permissões
  const openWindowWithPermission = async (windowConfig) => {
    // Verifica permissões
    const permissionCheck = await canOpenWindow(windowConfig);
    
    if (!permissionCheck.allowed) {
      toast.error(permissionCheck.message || 'Acesso negado');
      return null;
    }

    // Abre a janela
    const windowId = windowManager.openWindow(windowConfig);

    // Registra no log
    try {
      await AuditLogger.logWindowOpen(
        { ...windowConfig, id: windowId },
        user?.email || 'unknown',
        user?.empresa_selecionada_id || user?.empresa_id || '1'
      );
    } catch (error) {
      console.error('Erro ao registrar abertura:', error);
    }

    return windowId;
  };

  // Sobrescreve o openWindow original com a versão aprimorada
  useEffect(() => {
    windowManager.openWindow = openWindowWithPermission;
  }, [user]);

  return <>{children}</>;
}

/**
 * Hook customizado para usar o Window Manager aprimorado
 */
export function useWindowManagerEnhanced() {
  const windowManager = useWindowManager();
  const { canOpenWindow, user, hasPermission } = usePermissionChecker();

  return {
    ...windowManager,
    canOpenWindow,
    user,
    hasPermission
  };
}