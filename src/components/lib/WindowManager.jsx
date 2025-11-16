import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * V21.1.2-R2 - SISTEMA DE MULTITAREFAS GLOBAL APRIMORADO
 * ✅ Z-index inteligente com foco automático
 * ✅ Detecta janela ativa para highlighting
 */

const WindowManagerContext = createContext(null);

export function WindowManagerProvider({ children }) {
  const [windows, setWindows] = useState([]);
  const [zIndexCounter, setZIndexCounter] = useState(1000);
  const [activeWindowId, setActiveWindowId] = useState(null);

  const openWindow = useCallback((windowConfig) => {
    const newWindow = {
      id: `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...windowConfig,
      state: 'normal', // normal | minimized | maximized
      pinned: false,
      zIndex: zIndexCounter,
      createdAt: Date.now()
    };

    setWindows(prev => [...prev, newWindow]);
    setZIndexCounter(prev => prev + 1);
    setActiveWindowId(newWindow.id); // Nova janela sempre fica ativa
    return newWindow.id;
  }, [zIndexCounter]);

  const closeWindow = useCallback((windowId) => {
    setWindows(prev => {
      const newWindows = prev.filter(w => w.id !== windowId);
      // Se fechou a janela ativa, ativa a última
      if (windowId === activeWindowId && newWindows.length > 0) {
        const lastWindow = newWindows.reduce((max, w) => 
          w.zIndex > max.zIndex ? w : max
        );
        setActiveWindowId(lastWindow.id);
      }
      return newWindows;
    });
  }, [activeWindowId]);

  const minimizeWindow = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, state: 'minimized' } : w
    ));
    // Ao minimizar, ativa a próxima janela visível
    setWindows(current => {
      const visibleWindows = current.filter(w => w.id !== windowId && w.state !== 'minimized');
      if (visibleWindows.length > 0) {
        const nextActive = visibleWindows.reduce((max, w) => 
          w.zIndex > max.zIndex ? w : max
        );
        setActiveWindowId(nextActive.id);
      } else {
        setActiveWindowId(null);
      }
      return current;
    });
  }, []);

  const maximizeWindow = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, state: 'maximized' } : w
    ));
    bringToFront(windowId);
  }, []);

  const restoreWindow = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, state: 'normal' } : w
    ));
    bringToFront(windowId);
  }, []);

  const togglePin = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, pinned: !w.pinned } : w
    ));
  }, []);

  const bringToFront = useCallback((windowId) => {
    const newZIndex = zIndexCounter;
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, zIndex: newZIndex } : w
    ));
    setZIndexCounter(prev => prev + 1);
    setActiveWindowId(windowId);
  }, [zIndexCounter]);

  const updateWindowData = useCallback((windowId, data) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, data: { ...w.data, ...data } } : w
    ));
  }, []);

  const value = {
    windows,
    activeWindowId,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    togglePin,
    bringToFront,
    updateWindowData
  };

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  );
}

export function useWindowManager() {
  const context = useContext(WindowManagerContext);
  if (!context) {
    throw new Error('useWindowManager deve ser usado dentro de WindowManagerProvider');
  }
  return context;
}