import React, { Suspense } from 'react';
import { useWindowManager } from './WindowManager';
import WindowModal from './WindowModal';
import { AnimatePresence } from 'framer-motion';

/**
 * WINDOW RENDERER V21.0
 * Renderiza todas as janelas abertas
 */

export default function WindowRenderer() {
  const { windows, closeWindow } = useWindowManager();

  return (
    <AnimatePresence>
      {windows.map(window => {
        if (window.isMinimized) return null;
        
        const Component = window.component;
        
        // Validar se Component é válido
        if (!Component || typeof Component !== 'function') {
          console.error('WindowRenderer: Componente inválido', window);
          return null;
        }

        const injectedProps = { ...window.props };
        if (typeof injectedProps.onSubmit === 'function') {
          const originalOnSubmit = injectedProps.onSubmit;
          injectedProps.onSubmit = (...args) => {
            const result = originalOnSubmit(...args);
            if (result && typeof result.then === 'function') {
              result.finally(() => closeWindow(window.id));
            } else {
              closeWindow(window.id);
            }
            return result;
          };
        }
        if (typeof injectedProps.onSuccess === 'function') {
          const originalOnSuccess = injectedProps.onSuccess;
          injectedProps.onSuccess = (...args) => {
            const result = originalOnSuccess(...args);
            if (result && typeof result.then === 'function') {
              result.finally(() => closeWindow(window.id));
            } else {
              closeWindow(window.id);
            }
            return result;
          };
        }

        return (
          <WindowModal key={window.id} window={window}>
            <Suspense fallback={
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            }>
              <Component
                {...injectedProps}
                windowId={window.id}
                closeSelf={() => closeWindow(window.id)}
              />
            </Suspense>
          </WindowModal>
        );
      })}
    </AnimatePresence>
  );
}