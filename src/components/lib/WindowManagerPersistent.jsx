import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useUser } from './UserContext';

/**
 * 🪟 WINDOW MANAGER PERSISTENT V21.0 - ETAPA 1 COMPLETA
 * Sistema de Gerenciamento de Janelas Multitarefa com Persistência
 * 
 * Funcionalidades:
 * - Múltiplas janelas simultâneas
 * - Minimizar, Maximizar, Fechar, Redimensionar
 * - Persistência automática em PreferenciasUsuario
 * - Multiempresa aware com controle de contexto
 * - Auditoria integrada
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
  const { user } = useUser();
  const [windows, setWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [minimizedWindows, setMinimizedWindows] = useState([]);
  const [preferencias, setPreferencias] = useState(null);

  // Carregar preferências do usuário
  useEffect(() => {
    if (!user?.email) return;

    const carregarPreferencias = async () => {
      try {
        const prefs = await base44.entities.PreferenciasUsuario.filter({
          usuario_id: user.email
        });

        if (prefs && prefs.length > 0) {
          setPreferencias(prefs[0]);
          
          // Restaurar janelas da última sessão (opcional)
          // if (prefs[0].janelas_abertas_sessao?.length > 0) {
          //   setWindows(prefs[0].janelas_abertas_sessao);
          // }
        }
      } catch (error) {
        console.error('Erro ao carregar preferências:', error);
      }
    };

    carregarPreferencias();
  }, [user?.email]);

  // Salvar estado das janelas ao mudar
  useEffect(() => {
    if (!user?.email || !preferencias?.id) return;

    const salvarEstado = async () => {
      try {
        const estadoJanelas = windows.map(w => ({
          windowId: w.id,
          module: w.module,
          title: w.title,
          position: w.position,
          dimensions: w.dimensions,
          isMaximized: w.isMaximized,
          isMinimized: w.isMinimized,
          metadata: w.metadata
        }));

        await base44.entities.PreferenciasUsuario.update(preferencias.id, {
          janelas_abertas_sessao: estadoJanelas
        });
      } catch (error) {
        console.error('Erro ao salvar estado das janelas:', error);
      }
    };

    const debounceTimer = setTimeout(salvarEstado, 2000);
    return () => clearTimeout(debounceTimer);
  }, [windows, user?.email, preferencias?.id]);

  // Abrir nova janela
  const openWindow = useCallback((config) => {
    const windowId = `window-${++windowIdCounter}-${Date.now()}`;
    
    const newWindow = {
      id: windowId,
      title: config.title,
      component: config.component,
      props: config.props || {},
      size: config.size || 'large',
      position: config.position || { x: 50 + windows.length * 30, y: 50 + windows.length * 30 },
      dimensions: config.dimensions || { width: '90vw', height: '85vh' },
      isMaximized: config.isMaximized || false,
      isMinimized: false,
      canResize: config.canResize !== false,
      canMinimize: config.canMinimize !== false,
      canMaximize: config.canMaximize !== false,
      module: config.module,
      empresaId: config.empresaId,
      metadata: config.metadata || {},
      createdAt: new Date().toISOString()
    };

    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(windowId);
    
    // Registrar auditoria se for módulo sensível
    const modulosSensiveis = ['financeiro', 'fiscal', 'rh', 'configuracoes'];
    if (modulosSensiveis.includes(config.module)) {
      try {
        base44.entities.AuditLog.create({
          usuario: user?.full_name || 'Desconhecido',
          usuario_id: user?.email,
          acao: 'Visualização',
          modulo: config.module,
          descricao: `Abriu janela: ${config.title}`,
          data_hora: new Date().toISOString()
        });
      } catch (error) {
        console.error('Erro ao registrar auditoria:', error);
      }
    }
    
    return windowId;
  }, [windows.length, user]);

  // Fechar janela
  const closeWindow = useCallback((windowId) => {
    setWindows(prev => prev.filter(w => w.id !== windowId));
    setMinimizedWindows(prev => prev.filter(id => id !== windowId));
    
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

  // Atualizar props da janela
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

  // Minimizar todas as janelas
  const minimizeAllWindows = useCallback(() => {
    setWindows(prev => prev.map(w => ({ ...w, isMinimized: true })));
    setMinimizedWindows(windows.map(w => w.id));
  }, [windows]);

  // Restaurar todas as janelas
  const restoreAllWindows = useCallback(() => {
    setWindows(prev => prev.map(w => ({ ...w, isMinimized: false })));
    setMinimizedWindows([]);
  }, []);

  // Obter janela por ID
  const getWindow = useCallback((windowId) => {
    return windows.find(w => w.id === windowId);
  }, [windows]);

  // Verificar se existe janela de um tipo específico
  const hasWindowOfType = useCallback((module, metadata = {}) => {
    return windows.some(w => {
      if (w.module !== module) return false;
      
      const metadataKeys = Object.keys(metadata);
      if (metadataKeys.length === 0) return true;
      
      return metadataKeys.every(key => w.metadata[key] === metadata[key]);
    });
  }, [windows]);

  // Atualizar janelas ao trocar empresa
  const handleEmpresaChange = useCallback(async (novaEmpresaId) => {
    const preferencia = preferencias?.preferencia_multiempresa || 'atualizar_todas';

    if (preferencia === 'atualizar_todas') {
      // Atualizar todas as janelas para nova empresa
      setWindows(prev => prev.map(w => ({
        ...w,
        empresaId: novaEmpresaId,
        props: { ...w.props, empresaId: novaEmpresaId, forceRefresh: Date.now() }
      })));
    } else {
      // Manter janelas congeladas (somente leitura)
      setWindows(prev => prev.map(w => ({
        ...w,
        props: { ...w.props, readonly: true, empresaAnterior: w.empresaId }
      })));
    }
  }, [preferencias]);

  const value = {
    windows: windows.filter(w => !w.isMinimized),
    allWindows: windows,
    minimizedWindows: minimizedWindows.map(id => windows.find(w => w.id === id)).filter(Boolean),
    activeWindowId,
    preferencias,
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
    minimizeAllWindows,
    restoreAllWindows,
    getWindow,
    hasWindowOfType,
    handleEmpresaChange
  };

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  );
}