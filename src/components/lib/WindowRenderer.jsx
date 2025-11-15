import React from 'react';
import { useWindowManager } from './WindowManager';
import WindowModal from './WindowModal';
import MinimizedWindowsBar from './MinimizedWindowsBar';

/**
 * V21.1.2-R2 - Renderizador Global de Janelas APRIMORADO
 * ✅ Passa isActive para cada janela
 * ✅ Z-index dinâmico gerenciado
 */
export default function WindowRenderer() {
  const {
    windows,
    activeWindowId,
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
          isActive={window.id === activeWindowId}
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