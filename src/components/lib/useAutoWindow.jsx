import { useWindowManager } from './WindowManagerPersistent';

/**
 * 🪟 AUTO WINDOW HOOK
 * Hook para abrir qualquer componente como janela multitarefa
 * Uso: const openAsWindow = useAutoWindow();
 *       openAsWindow(MinhaTelaComponent, { title: 'Minha Tela', props: {...} });
 */

export function useAutoWindow() {
  const { openWindow, hasWindowOfType } = useWindowManager();

  const openAsWindow = (component, config = {}) => {
    const defaultConfig = {
      title: config.title || 'Nova Janela',
      component,
      props: config.props || {},
      size: config.size || 'large',
      module: config.module || 'custom',
      metadata: config.metadata || {},
      canResize: config.canResize !== false,
      canMinimize: config.canMinimize !== false,
      canMaximize: config.canMaximize !== false
    };

    // Previne duplicatas se especificado
    if (config.preventDuplicate && hasWindowOfType(defaultConfig.module, defaultConfig.metadata)) {
      return null;
    }

    return openWindow(defaultConfig);
  };

  return openAsWindow;
}

export default useAutoWindow;