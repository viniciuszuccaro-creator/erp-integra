import { useWindowManager } from './WindowManager';

/**
 * HOOK USE WINDOW V21.0
 * Hook simplificado para abrir janelas de qualquer lugar do sistema
 * 
 * Exemplo de uso:
 * const { openWindow } = useWindow();
 * 
 * openWindow(CadastroClienteCompleto, { cliente: clienteData }, { 
 *   title: 'Editar Cliente',
 *   width: 1200,
 *   height: 700
 * });
 */

export function useWindow() {
  const { 
    openWindow, 
    closeWindow, 
    minimizeWindow, 
    toggleMaximize,
    restoreWindow,
    bringToFront 
  } = useWindowManager();

  return {
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow: toggleMaximize,
    restoreWindow,
    bringToFront
  };
}

export default useWindow;