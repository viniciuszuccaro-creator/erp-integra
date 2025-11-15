import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * V21.1.2 - SISTEMA DE MULTITAREFAS GLOBAL
 * Permite múltiplos modais/janelas abertas simultaneamente
 */

const WindowManagerContext = createContext(null);

export function WindowManagerProvider({ children }) {
  const [windows, setWindows] = useState([]);
  const [zIndexCounter, setZIndexCounter] = useState(1000);

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
    return newWindow.id;
  }, [zIndexCounter]);

  const closeWindow = useCallback((windowId) => {
    setWindows(prev => prev.filter(w => w.id !== windowId));
  }, []);

  const minimizeWindow = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, state: 'minimized' } : w
    ));
  }, []);

  const maximizeWindow = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, state: 'maximized' } : w
    ));
  }, []);

  const restoreWindow = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, state: 'normal' } : w
    ));
  }, []);

  const togglePin = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, pinned: !w.pinned } : w
    ));
  }, []);

  const bringToFront = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, zIndex: zIndexCounter } : w
    ));
    setZIndexCounter(prev => prev + 1);
  }, [zIndexCounter]);

  const updateWindowData = useCallback((windowId, data) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, data: { ...w.data, ...data } } : w
    ));
  }, []);

  const value = {
    windows,
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