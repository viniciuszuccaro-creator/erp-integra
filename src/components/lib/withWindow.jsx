import React from 'react';
import { useWindowManager } from './WindowManagerPersistent';

/**
 * 🪟 HOC UNIVERSAL DE JANELAS - ETAPA 1 CRÍTICA
 * 
 * Transforma QUALQUER componente em uma janela multitarefa
 * - W-FULL responsivo automático
 * - Redimensionável pelo usuário
 * - Minimizar, Maximizar, Fechar
 * - Múltiplas instâncias simultâneas
 * 
 * USO:
 * export default withWindow(MeuComponente, { 
 *   title: 'Título da Janela',
 *   width: '90vw',
 *   height: '85vh'
 * });
 */

export function withWindow(Component, defaultConfig = {}) {
  return function WindowWrappedComponent(props) {
    const { openWindow } = useWindowManager();
    
    // Se já está dentro de uma janela, renderiza diretamente
    if (props._isInWindow) {
      return <Component {...props} />;
    }

    // Caso contrário, abre a janela automaticamente
    React.useEffect(() => {
      openWindow({
        id: `${defaultConfig.id || Component.name}-${Date.now()}`,
        title: defaultConfig.title || Component.name,
        component: <Component {...props} _isInWindow={true} />,
        canResize: defaultConfig.canResize !== false,
        canMinimize: defaultConfig.canMinimize !== false,
        canMaximize: defaultConfig.canMaximize !== false,
        dimensions: {
          width: defaultConfig.width || '90vw',
          height: defaultConfig.height || '85vh'
        },
        ...defaultConfig
      });
    }, []);

    // Retorna null pois o componente será renderizado dentro da janela
    return null;
  };
}

/**
 * 🔗 HOOK PARA ABRIR QUALQUER TELA COMO JANELA
 * 
 * USO:
 * const { abrirJanela } = useAbrirJanela();
 * 
 * abrirJanela('Dashboard', DashboardPage);
 * abrirJanela('Cliente #123', <ClienteForm id="123" />);
 */
export function useAbrirJanela() {
  const { openWindow } = useWindowManager();

  const abrirJanela = (title, componentOrElement, config = {}) => {
    const component = React.isValidElement(componentOrElement) 
      ? componentOrElement 
      : React.createElement(componentOrElement, { _isInWindow: true });

    openWindow({
      id: `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      component,
      canResize: true,
      canMinimize: true,
      canMaximize: true,
      dimensions: {
        width: config.width || '90vw',
        height: config.height || '85vh'
      },
      ...config
    });
  };

  return { abrirJanela };
}

export default withWindow;