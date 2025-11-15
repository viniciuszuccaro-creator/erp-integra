import React from 'react';
import { useWindowManager } from './WindowManager';
import WindowModal from './WindowModal';
import MinimizedWindowsBar from './MinimizedWindowsBar';

/**
 * V21.1.2 - Renderizador Global de Janelas
 * Deve ser incluído no Layout principal
 */
export default function WindowRenderer() {
  const {
    windows,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    togglePin,
    bringToFront
  } = useWindowManager();

  return (
    <>
      {/* Janelas ativas */}
      {windows.map((window) => (
        <WindowModal
          key={window.id}
          window={window}
          onClose={() => closeWindow(window.id)}
          onMinimize={() => minimizeWindow(window.id)}
          onMaximize={() => maximizeWindow(window.id)}
          onRestore={() => restoreWindow(window.id)}
          onTogglePin={() => togglePin(window.id)}
          onBringToFront={() => bringToFront(window.id)}
        >
          {window.content}
        </WindowModal>
      ))}

      {/* Barra de minimizados */}
      <MinimizedWindowsBar />
    </>
  );
}