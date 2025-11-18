import React from 'react';
import { useWindowManager } from './WindowManagerPersistent';
import { WINDOW_COMPONENTS } from './WindowRegistry';
import WindowModal from './WindowModal';

/**
 * 🪟 WINDOW RENDERER V21.0 - ETAPA 1
 * Renderiza todas as janelas abertas
 * Gerencia ordem e visibilidade
 */

export default function WindowRenderer() {
  const { windows, closeWindow } = useWindowManager();

  return (
    <>
      {windows.map(window => {
        // Resolver componente do registro se for string
        const Component = typeof window.component === 'string'
          ? WINDOW_COMPONENTS[window.component]
          : window.component;

        if (!Component) {
          console.error(`⚠️ Componente não encontrado no WindowRegistry: "${window.component}"`);
          console.log('🔍 Componentes disponíveis:', Object.keys(WINDOW_COMPONENTS));
          return null;
        }
        
        return (
          <WindowModal key={window.id} window={window}>
            <Component 
              {...window.props} 
              windowId={window.id}
              onSubmit={async (data) => {
                if (window.props?.onSubmit) {
                  await window.props.onSubmit(data);
                }
                closeWindow(window.id);
              }}
              onCancel={() => closeWindow(window.id)}
            />
          </WindowModal>
        );
      })}
    </>
  );
}