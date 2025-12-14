import React from 'react';
import { useWindowManager } from './WindowManager';
import WindowModal from './WindowModal';
import { AnimatePresence } from 'framer-motion';

/**
 * WINDOW RENDERER V21.0
 * Renderiza todas as janelas abertas
 */

export default function WindowRenderer() {
  const { windows } = useWindowManager();

  return (
    <AnimatePresence>
      {windows.map(window => {
        if (window.isMinimized) return null;
        
        const Component = window.component;
        
        return (
          <WindowModal key={window.id} window={window}>
            <Component {...window.props} />
          </WindowModal>
        );
      })}
    </AnimatePresence>
  );
}