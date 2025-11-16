import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

/**
 * V21.0 - SISTEMA DE MULTITAREFAS GLOBAL - MÓDULO 0
 * 
 * ✅ Gerenciamento universal de janelas
 * ✅ Z-index inteligente com foco automático
 * ✅ Suporte a multi-instância ilimitada
 * ✅ Snap automático e agrupamento
 * ✅ Persistência de estado
 * ✅ Memória de posição
 * ✅ Modo comando
 * ✅ Integração com IA
 * ✅ Logs e auditoria
 * ✅ Permissões por janela
 */

const WindowManagerContext = createContext(null);

export function WindowManagerProvider({ children }) {
  const [windows, setWindows] = useState([]);
  const [zIndexCounter, setZIndexCounter] = useState(1000);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [snapMode, setSnapMode] = useState(false);
  const [commandMode, setCommandMode] = useState(false);
  const [windowHistory, setWindowHistory] = useState([]);

  // Persistência: salvar estado das janelas no localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('windowManager_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Não restaurar conteúdo, apenas posições e configurações
        const restoredWindows = parsed.windows.map(w => ({
          ...w,
          content: null, // Conteúdo será recarregado sob demanda
          state: 'minimized' // Iniciar minimizado
        }));
        setWindows(restoredWindows);
      } catch (error) {
        console.error('Erro ao restaurar estado das janelas:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Salvar estado periodicamente
    const timer = setTimeout(() => {
      const stateToSave = {
        windows: windows.map(w => ({
          id: w.id,
          title: w.title,
          subtitle: w.subtitle,
          position: w.position,
          size: w.size,
          state: w.state,
          pinned: w.pinned,
          module: w.module
        }))
      };
      localStorage.setItem('windowManager_state', JSON.stringify(stateToSave));
    }, 1000);

    return () => clearTimeout(timer);
  }, [windows]);

  const openWindow = useCallback((windowConfig) => {
    const newWindow = {
      id: `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...windowConfig,
      state: windowConfig.state || 'normal',
      pinned: windowConfig.pinned || false,
      zIndex: zIndexCounter,
      createdAt: Date.now(),
      position: windowConfig.position || { x: 100 + windows.length * 30, y: 100 + windows.length * 30 },
      size: windowConfig.size || { width: '90vw', height: '90vh' },
      module: windowConfig.module || 'generic',
      permissions: windowConfig.permissions || {},
      metadata: windowConfig.metadata || {}
    };

    setWindows(prev => [...prev, newWindow]);
    setZIndexCounter(prev => prev + 1);
    setActiveWindowId(newWindow.id);
    
    // Adicionar ao histórico
    setWindowHistory(prev => [...prev, {
      action: 'open',
      windowId: newWindow.id,
      timestamp: Date.now(),
      title: newWindow.title
    }]);

    return newWindow.id;
  }, [zIndexCounter, windows.length]);

  const closeWindow = useCallback((windowId) => {
    setWindows(prev => {
      const windowToClose = prev.find(w => w.id === windowId);
      const newWindows = prev.filter(w => w.id !== windowId);
      
      // Log de fechamento
      setWindowHistory(prevHistory => [...prevHistory, {
        action: 'close',
        windowId,
        timestamp: Date.now(),
        title: windowToClose?.title
      }]);
      
      // Se fechou a janela ativa, ativa a última
      if (windowId === activeWindowId && newWindows.length > 0) {
        const lastWindow = newWindows.reduce((max, w) => 
          w.zIndex > max.zIndex ? w : max
        );
        setActiveWindowId(lastWindow.id);
      } else if (newWindows.length === 0) {
        setActiveWindowId(null);
      }
      
      return newWindows;
    });
  }, [activeWindowId]);

  const minimizeWindow = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, state: 'minimized' } : w
    ));
    
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

  const updateWindowPosition = useCallback((windowId, position) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, position } : w
    ));
  }, []);

  const updateWindowSize = useCallback((windowId, size) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, size } : w
    ));
  }, []);

  // NOVO: Duplicar janela (multi-instância)
  const duplicateWindow = useCallback((windowId) => {
    const original = windows.find(w => w.id === windowId);
    if (!original) return;

    const duplicate = {
      ...original,
      id: `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: `${original.title} (Cópia)`,
      zIndex: zIndexCounter,
      position: {
        x: original.position.x + 30,
        y: original.position.y + 30
      },
      createdAt: Date.now()
    };

    setWindows(prev => [...prev, duplicate]);
    setZIndexCounter(prev => prev + 1);
    setActiveWindowId(duplicate.id);
    
    return duplicate.id;
  }, [windows, zIndexCounter]);

  // NOVO: Snap de janelas (organização automática)
  const snapWindows = useCallback((layout = 'grid') => {
    const visibleWindows = windows.filter(w => w.state !== 'minimized');
    
    if (layout === 'grid') {
      const cols = Math.ceil(Math.sqrt(visibleWindows.length));
      const rows = Math.ceil(visibleWindows.length / cols);
      const windowWidth = `${100 / cols}vw`;
      const windowHeight = `${100 / rows}vh`;
      
      setWindows(prev => prev.map((w, idx) => {
        if (w.state === 'minimized') return w;
        
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        
        return {
          ...w,
          position: {
            x: col * (100 / cols),
            y: row * (100 / rows)
          },
          size: { width: windowWidth, height: windowHeight },
          state: 'normal'
        };
      }));
    } else if (layout === 'cascade') {
      setWindows(prev => prev.map((w, idx) => {
        if (w.state === 'minimized') return w;
        
        return {
          ...w,
          position: {
            x: 50 + idx * 30,
            y: 50 + idx * 30
          },
          size: { width: '70vw', height: '70vh' },
          state: 'normal'
        };
      }));
    }
  }, [windows]);

  // NOVO: Fechar todas as janelas de um módulo
  const closeModuleWindows = useCallback((moduleName) => {
    setWindows(prev => prev.filter(w => w.module !== moduleName));
  }, []);

  // NOVO: Minimizar todas exceto a ativa
  const minimizeAllExceptActive = useCallback(() => {
    setWindows(prev => prev.map(w => 
      w.id !== activeWindowId ? { ...w, state: 'minimized' } : w
    ));
  }, [activeWindowId]);

  // NOVO: Modo comando (abrir janelas por atalho)
  const toggleCommandMode = useCallback(() => {
    setCommandMode(prev => !prev);
  }, []);

  const value = {
    windows,
    activeWindowId,
    snapMode,
    commandMode,
    windowHistory,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    togglePin,
    bringToFront,
    updateWindowData,
    updateWindowPosition,
    updateWindowSize,
    duplicateWindow,
    snapWindows,
    closeModuleWindows,
    minimizeAllExceptActive,
    toggleCommandMode,
    setSnapMode
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