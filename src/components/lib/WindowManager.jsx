import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * 🪟 WINDOW MANAGER V21.0 - ETAPA 1
 * Sistema de Gerenciamento de Janelas Multitarefa
 * 
 * Regra-Mãe: Acrescentar • Reorganizar • Conectar • Melhorar
 * - Abertura simultânea de múltiplos módulos
 * - Minimizar, Maximizar, Fechar, Redimensionar
 * - Persistência de estado por sessão
 * - Controle de acesso integrado
 * - Multiempresa aware
 */

const WindowManagerContext = createContext(null);

export const useWindowManager = () => {
  const context = useContext(WindowManagerContext);
  if (!context) {
    throw new Error('useWindowManager deve ser usado dentro de WindowManagerProvider');
  }
  return context;
};

let windowIdCounter = 0;

export function WindowManagerProvider({ children }) {
  const [windows, setWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [minimizedWindows, setMinimizedWindows] = useState([]);

  // Abrir nova janela
  const openWindow = useCallback((config) => {
    const windowId = `window-${++windowIdCounter}`;
    
    const newWindow = {
      id: windowId,
      title: config.title,
      component: config.component,
      props: config.props || {},
      size: config.size || 'large', // 'small', 'medium', 'large', 'fullscreen'
      position: config.position || { x: 50 + windows.length * 30, y: 50 + windows.length * 30 },
      dimensions: config.dimensions || { width: '90vw', height: '85vh' },
      isMaximized: false,
      isMinimized: false,
      canResize: config.canResize !== false,
      canMinimize: config.canMinimize !== false,
      canMaximize: config.canMaximize !== false,
      module: config.module, // ex: 'comercial', 'financeiro'
      empresaId: config.empresaId, // ID da empresa ativa ao abrir
      metadata: config.metadata || {},
      createdAt: new Date().toISOString()
    };

    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(windowId);
    
    return windowId;
  }, [windows.length]);

  // Fechar janela
  const closeWindow = useCallback((windowId) => {
    setWindows(prev => prev.filter(w => w.id !== windowId));
    setMinimizedWindows(prev => prev.filter(id => id !== windowId));
    
    // Se fechar a janela ativa, ativar a última janela
    setActiveWindowId(prev => {
      if (prev === windowId) {
        const remaining = windows.filter(w => w.id !== windowId);
        return remaining.length > 0 ? remaining[remaining.length - 1].id : null;
      }
      return prev;
    });
  }, [windows]);

  // Minimizar janela
  const minimizeWindow = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMinimized: true } : w
    ));
    setMinimizedWindows(prev => [...prev, windowId]);
  }, []);

  // Restaurar janela minimizada
  const restoreWindow = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMinimized: false } : w
    ));
    setMinimizedWindows(prev => prev.filter(id => id !== windowId));
    setActiveWindowId(windowId);
  }, []);

  // Maximizar/Restaurar janela
  const toggleMaximize = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  }, []);

  // Trazer janela para frente
  const bringToFront = useCallback((windowId) => {
    setActiveWindowId(windowId);
  }, []);

  // Atualizar posição da janela
  const updateWindowPosition = useCallback((windowId, position) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, position } : w
    ));
  }, []);

  // Atualizar dimensões da janela
  const updateWindowDimensions = useCallback((windowId, dimensions) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, dimensions } : w
    ));
  }, []);

  // Atualizar props da janela (útil para refresh de dados)
  const updateWindowProps = useCallback((windowId, newProps) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, props: { ...w.props, ...newProps } } : w
    ));
  }, []);

  // Fechar todas as janelas
  const closeAllWindows = useCallback(() => {
    setWindows([]);
    setMinimizedWindows([]);
    setActiveWindowId(null);
  }, []);

  // Obter janela por ID
  const getWindow = useCallback((windowId) => {
    return windows.find(w => w.id === windowId);
  }, [windows]);

  // Verificar se existe janela de um tipo específico
  const hasWindowOfType = useCallback((module, metadata = {}) => {
    return windows.some(w => {
      if (w.module !== module) return false;
      
      // Verificar metadata específico (ex: pedido_id, cliente_id)
      const metadataKeys = Object.keys(metadata);
      if (metadataKeys.length === 0) return true;
      
      return metadataKeys.every(key => w.metadata[key] === metadata[key]);
    });
  }, [windows]);

  const value = {
    windows: windows.filter(w => !w.isMinimized),
    allWindows: windows,
    minimizedWindows: minimizedWindows.map(id => windows.find(w => w.id === id)).filter(Boolean),
    activeWindowId,
    openWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    toggleMaximize,
    bringToFront,
    updateWindowPosition,
    updateWindowDimensions,
    updateWindowProps,
    closeAllWindows,
    getWindow,
    hasWindowOfType
  };

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  );
}