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
        
        // Suporte para lazy loading
        if (typeof Component === 'function' && Component.constructor.name === 'AsyncFunction') {
          return (
            <WindowModal key={window.id} window={window}>
              <React.Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
                <LazyComponent importFn={Component} props={window.props} />
              </React.Suspense>
            </WindowModal>
          );
        }
        
        return (
          <WindowModal key={window.id} window={window}>
            <Component {...window.props} />
          </WindowModal>
        );
      })}
    </AnimatePresence>
  );
}

function LazyComponent({ importFn, props }) {
  const [Component, setComponent] = React.useState(null);
  
  React.useEffect(() => {
    importFn().then(mod => {
      setComponent(() => mod.default || mod);
    });
  }, [importFn]);
  
  if (!Component) return null;
  return <Component {...props} />;
}