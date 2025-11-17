import { useWindowManager } from './WindowManager';

/**
 * 🪟 USE WINDOW HOOK V21.0 - ETAPA 1
 * Hook simplificado para abrir janelas de qualquer lugar do sistema
 * 
 * Exemplo de uso:
 * 
 * const { openWindow } = useWindow();
 * 
 * openWindow({
 *   title: 'Editar Cliente',
 *   component: CadastroClienteCompleto,
 *   props: { cliente: clienteData },
 *   module: 'comercial',
 *   size: 'large'
 * });
 */

export function useWindow() {
  const windowManager = useWindowManager();

  return {
    ...windowManager,
    
    // Atalhos específicos por tamanho
    openLargeWindow: (config) => windowManager.openWindow({
      ...config,
      dimensions: { width: '90vw', height: '85vh' }
    }),

    openMediumWindow: (config) => windowManager.openWindow({
      ...config,
      dimensions: { width: '70vw', height: '70vh' }
    }),

    openSmallWindow: (config) => windowManager.openWindow({
      ...config,
      dimensions: { width: '50vw', height: '60vh' }
    }),

    openFullscreenWindow: (config) => windowManager.openWindow({
      ...config,
      dimensions: { width: '100vw', height: '100vh' },
      isMaximized: true
    })
  };
}