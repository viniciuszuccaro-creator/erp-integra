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
  const { windows } = useWindowManager();

  return (
    <>
      {windows.map(window => {
        const Component = window.component;
        
        return (
          <WindowModal key={window.id} window={window}>
            <Component {...window.props} windowId={window.id} />
          </WindowModal>
        );
      })}
    </>
  );
}