import React from 'react';
import { useWindowManager } from './WindowManager';
import WindowModal from './WindowModal';
import MinimizedWindowsBar from './MinimizedWindowsBar';
import WindowCommandPalette from './WindowCommandPalette';

/**
 * V21.0 - RENDERIZADOR GLOBAL DE JANELAS
 * 
 * ✅ Renderiza todas as janelas abertas
 * ✅ Gerencia z-index e foco automático
 * ✅ Inclui barra de minimizados
 * ✅ Inclui paleta de comandos
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
    bringToFront,
    updateWindowPosition,
    updateWindowSize,
    duplicateWindow
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
          onDuplicate={() => duplicateWindow(window.id)}
          onUpdatePosition={(pos) => updateWindowPosition(window.id, pos)}
          onUpdateSize={(size) => updateWindowSize(window.id, size)}
        >
          {window.content}
        </WindowModal>
      ))}

      {/* Barra de minimizados */}
      <MinimizedWindowsBar />

      {/* Paleta de comandos (Ctrl+K) */}
      <WindowCommandPalette />
    </>
  );
}