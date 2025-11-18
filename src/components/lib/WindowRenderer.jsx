import React, { Suspense } from 'react';
import { useWindowManager } from './WindowManagerPersistent';
import { WINDOW_COMPONENTS } from './WindowRegistry';
import WindowModal from './WindowModal';
import { Loader2 } from 'lucide-react';

/**
 * 🪟 WINDOW RENDERER V21.1 - MULTITAREFA TOTAL
 * Renderiza todas as janelas abertas com Suspense
 * Gerencia ordem, visibilidade e loading states
 */

function WindowLoader() {
  return (
    <div className="flex items-center justify-center h-full w-full bg-white">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
        <p className="text-sm text-slate-600">Carregando módulo...</p>
      </div>
    </div>
  );
}

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
          console.error(`Componente não encontrado: ${window.component}`);
          return null;
        }
        
        return (
          <WindowModal key={window.id} window={window}>
            <Suspense fallback={<WindowLoader />}>
              <div className="w-full h-full">
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
              </div>
            </Suspense>
          </WindowModal>
        );
      })}
    </>
  );
}