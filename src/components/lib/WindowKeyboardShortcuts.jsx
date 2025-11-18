import { useEffect } from 'react';
import { useWindowManager } from './WindowManagerPersistent';

/**
 * ⌨️ ATALHOS DE TECLADO UNIVERSAIS PARA JANELAS
 * 
 * Ctrl+W - Fechar janela ativa
 * Ctrl+M - Minimizar janela ativa
 * Ctrl+Shift+M - Minimizar todas
 * Ctrl+Alt+M - Restaurar todas
 * Ctrl+F - Maximizar janela ativa
 * Alt+Tab - Alternar entre janelas
 * Ctrl+Shift+W - Fechar todas as janelas
 * Escape - Fechar janela ativa
 */

export function WindowKeyboardShortcuts() {
  const { 
    windows, 
    activeWindowId, 
    closeWindow, 
    minimizeWindow, 
    toggleMaximize, 
    bringToFront,
    closeAllWindows,
    minimizeAllWindows,
    restoreAllWindows
  } = useWindowManager();

  useEffect(() => {
    const handleKeyDown = (e) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      // Ctrl+W - Fechar janela ativa
      if (ctrl && e.key === 'w' && !shift && activeWindowId) {
        e.preventDefault();
        closeWindow(activeWindowId);
      }

      // Ctrl+Shift+W - Fechar todas
      if (ctrl && shift && e.key === 'W') {
        e.preventDefault();
        if (confirm('Fechar todas as janelas?')) {
          closeAllWindows();
        }
      }

      // Ctrl+M - Minimizar ativa
      if (ctrl && e.key === 'm' && !shift && !alt && activeWindowId) {
        e.preventDefault();
        minimizeWindow(activeWindowId);
      }

      // Ctrl+Shift+M - Minimizar todas
      if (ctrl && shift && e.key === 'M') {
        e.preventDefault();
        minimizeAllWindows();
      }

      // Ctrl+Alt+M - Restaurar todas
      if (ctrl && alt && e.key === 'm') {
        e.preventDefault();
        restoreAllWindows();
      }

      // Ctrl+F - Maximizar/Restaurar ativa
      if (ctrl && e.key === 'f' && activeWindowId) {
        e.preventDefault();
        toggleMaximize(activeWindowId);
      }

      // Alt+Tab - Alternar janelas
      if (alt && e.key === 'Tab') {
        e.preventDefault();
        const visibleWindows = windows.filter(w => !w.isMinimized);
        if (visibleWindows.length > 0) {
          const currentIndex = visibleWindows.findIndex(w => w.id === activeWindowId);
          const nextIndex = (currentIndex + 1) % visibleWindows.length;
          bringToFront(visibleWindows[nextIndex].id);
        }
      }

      // Escape - Fechar janela ativa
      if (e.key === 'Escape' && activeWindowId) {
        closeWindow(activeWindowId);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [windows, activeWindowId, closeWindow, minimizeWindow, toggleMaximize, bringToFront, closeAllWindows, minimizeAllWindows, restoreAllWindows]);

  return null;
}

export default WindowKeyboardShortcuts;