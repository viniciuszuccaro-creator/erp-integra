import { useWindowManager } from './WindowManagerPersistent';

/**
 * 🪟 USE WINDOW HOOK V21.0 - ETAPA 1 COMPLETA
 * Hook simplificado para abrir janelas de qualquer lugar do sistema
 * 
 * Exemplo de uso:
 * 
 * import { useWindow } from '@/components/lib/useWindow';
 * import CadastroClienteCompleto from '../cadastros/CadastroClienteCompleto';
 * 
 * const { openWindow } = useWindow();
 * 
 * // Abrir janela grande (padrão max-w-[90vw])
 * openWindow({
 *   title: 'Editar Cliente - João Silva',
 *   component: CadastroClienteCompleto,
 *   props: { cliente: clienteData, onSuccess: () => console.log('salvo') },
 *   module: 'comercial',
 *   metadata: { cliente_id: clienteData.id }
 * });
 * 
 * // Atalho para janela grande
 * openLargeWindow({ ... });
 */

export function useWindow() {
  const windowManager = useWindowManager();

  return {
    ...windowManager,
    
    // Atalho padrão - Modal Grande (90vw x 85vh) - PADRÃO ETAPA 1
    openWindow: (config) => windowManager.openWindow({
      ...config,
      dimensions: config.dimensions || { width: '90vw', height: '85vh' }
    }),
    
    // Janela Grande - max-w-[90vw] (Padrão de formulários complexos)
    openLargeWindow: (config) => windowManager.openWindow({
      ...config,
      dimensions: { width: '90vw', height: '85vh' }
    }),

    // Janela Média - Para visualizações e relatórios
    openMediumWindow: (config) => windowManager.openWindow({
      ...config,
      dimensions: { width: '70vw', height: '70vh' }
    }),

    // Janela Pequena - Para confirmações e formulários simples
    openSmallWindow: (config) => windowManager.openWindow({
      ...config,
      dimensions: { width: '50vw', height: '60vh' }
    }),

    // Janela Fullscreen - Para dashboards e visualizações complexas
    openFullscreenWindow: (config) => windowManager.openWindow({
      ...config,
      dimensions: { width: '100vw', height: '100vh' },
      isMaximized: true,
      canResize: false
    })
  };
}