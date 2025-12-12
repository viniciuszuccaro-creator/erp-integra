import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * WINDOW MANAGER V21.0
 * Sistema de Multitarefas com Janelas Responsivas
 * Regra-Mãe: Acrescentar • Reorganizar • Conectar • Melhorar
 */

const WindowContext = createContext();

export const useWindowManager = () => {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error('useWindowManager deve ser usado dentro de WindowProvider');
  }
  return context;
};

export function WindowProvider({ children }) {
  const [windows, setWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);

  // Fechar janela
  const closeWindow = useCallback((windowId) => {
    setWindows(prev => prev.filter(w => w.id !== windowId));
    if (activeWindowId === windowId) {
      setActiveWindowId(windows[windows.length - 2]?.id || null);
    }
  }, [activeWindowId, windows]);

  // Minimizar janela
  const minimizeWindow = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMinimized: true } : w
    ));
  }, []);

  // Restaurar janela minimizada
  const restoreWindow = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMinimized: false } : w
    ));
    setActiveWindowId(windowId);
  }, []);

  // Maximizar/Restaurar janela
  const toggleMaximize = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  }, []);

  // Trazer janela para frente - V21.6 MELHORADO
  const bringToFront = useCallback((windowId) => {
    setActiveWindowId(windowId);
    setWindows(prev => {
      const maxZ = Math.max(...prev.map(w => w.zIndex), 1000);
      return prev.map(w => 
        w.id === windowId ? { ...w, zIndex: maxZ + 10, isMinimized: false } : w
      );
    });
  }, []);

  // Abrir nova janela - V21.6 MELHORADO: Evita duplicação + Sempre na frente
  const openWindow = useCallback((component, props = {}, options = {}) => {
    // V21.6: Verificar se já existe janela com mesmo componente e registro
    const uniqueKey = options.uniqueKey || (props.id || props[Object.keys(props)[0]]?.id);
    
    if (uniqueKey) {
      const janelaExistente = windows.find(w => 
        w.component === component && 
        (w.props.id === uniqueKey || w.props[Object.keys(props)[0]]?.id === uniqueKey)
      );

      if (janelaExistente) {
        // Trazer janela existente para frente
        bringToFront(janelaExistente.id);
        if (janelaExistente.isMinimized) {
          restoreWindow(janelaExistente.id);
        }
        return janelaExistente.id;
      }
    }
    
    const windowId = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Cascata inteligente com limite de tela
    const offsetBase = windows.length * 40;
    const maxOffset = 400;
    const cascade = offsetBase % maxOffset;
    
    // V21.6: zIndex sempre maior que todas janelas abertas
    const maxZ = windows.length > 0 ? Math.max(...windows.map(w => w.zIndex)) : 1000;
    
    const newWindow = {
      id: windowId,
      component,
      props,
      title: options.title || 'Nova Janela',
      isMinimized: false,
      isMaximized: false,
      width: options.width || 900,
      height: options.height || 600,
      x: options.x !== undefined ? options.x : 100 + cascade,
      y: options.y !== undefined ? options.y : 80 + cascade,
      zIndex: maxZ + 10, // V21.6: Sempre 10 acima da maior
    };

    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(windowId);
    
    return windowId;
  }, [windows, bringToFront, restoreWindow]);

  // Atualizar posição e tamanho
  const updateWindow = useCallback((windowId, updates) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, ...updates } : w
    ));
  }, []);

  const value = {
    windows,
    activeWindowId,
    openWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    toggleMaximize,
    bringToFront,
    updateWindow,
  };

  return (
    <WindowContext.Provider value={value}>
      {children}
    </WindowContext.Provider>
  );
}