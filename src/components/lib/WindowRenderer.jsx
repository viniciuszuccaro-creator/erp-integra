import React, { Suspense } from 'react';
import { useWindowManager } from './WindowManager';
import WindowModal from './WindowModal';
import ErrorBoundary from '@/components/lib/ErrorBoundary';
import { AnimatePresence } from 'framer-motion';

/**
 * WINDOW RENDERER V21.0
 * Renderiza todas as janelas abertas
 */

const WindowContent = ({ window, injectedProps, closeWindow }) => {
  const Component = window.component;
  
  if (!Component) {
    return null;
  }
  
  return (
    <Component
      {...injectedProps}
      windowId={window.id}
      closeSelf={() => closeWindow(window.id)}
    />
  );
};

export default function WindowRenderer() {
  const { windows, closeWindow } = useWindowManager();

  return (
    <AnimatePresence>
      {windows.map(window => {
        if (window.isMinimized) return null;
        
        const Component = window.component;
        
        if (!Component) {
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
              <ErrorBoundary>
                <WindowContent 
                  window={window}
                  injectedProps={injectedProps}
                  closeWindow={closeWindow}
                />
              </ErrorBoundary>
            </Suspense>
          </WindowModal>
        );
      })}
    </AnimatePresence>
  );
}