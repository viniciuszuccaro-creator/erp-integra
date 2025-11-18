import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, Maximize2, Minimize2, X, Move } from 'lucide-react';
import { useWindowManager } from './WindowManagerPersistent';

/**
 * 🪟 WINDOW MODAL V21.0 - ETAPA 1
 * Componente de Janela Individual Multitarefa
 * 
 * Características:
 * - Draggable (arrastar pela barra de título)
 * - Resizable (redimensionar pelas bordas)
 * - Minimizar, Maximizar, Fechar
 * - Z-index dinâmico (janela ativa sempre na frente)
 */

export default function WindowModal({ window, children }) {
  const {
    closeWindow,
    minimizeWindow,
    toggleMaximize,
    bringToFront,
    updateWindowPosition,
    updateWindowDimensions,
    activeWindowId
  } = useWindowManager();

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const windowRef = useRef(null);
  const isActive = activeWindowId === window.id;

  // Configuração de dimensões
  const getDimensions = () => {
    if (window.isMaximized) {
      return {
        width: '100vw',
        height: '100vh',
        top: 0,
        left: 0
      };
    }

    return {
      width: window.dimensions.width,
      height: window.dimensions.height,
      top: window.position.y,
      left: window.position.x
    };
  };

  const dimensions = getDimensions();

  // Handler para início de drag
  const handleDragStart = (e) => {
    if (window.isMaximized) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - window.position.x,
      y: e.clientY - window.position.y
    });
    bringToFront(window.id);
  };

  // Handler para movimento de drag
  useEffect(() => {
    if (!isDragging) return;

    const handleDragMove = (e) => {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      updateWindowPosition(window.id, {
        x: Math.max(0, Math.min(newX, window.innerWidth - 300)),
        y: Math.max(0, Math.min(newY, window.innerHeight - 100))
      });
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, dragStart, window.id, updateWindowPosition]);

  // Handler para resize (simplificado)
  const handleResizeStart = (e, direction) => {
    if (window.isMaximized || !window.canResize) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = windowRef.current.getBoundingClientRect();
    setIsResizing(direction);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: rect.width,
      height: rect.height
    });
    bringToFront(window.id);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleResizeMove = (e) => {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;

      if (isResizing.includes('e')) newWidth += deltaX;
      if (isResizing.includes('s')) newHeight += deltaY;
      if (isResizing.includes('w')) newWidth -= deltaX;
      if (isResizing.includes('n')) newHeight -= deltaY;

      // Dimensões mínimas
      newWidth = Math.max(400, newWidth);
      newHeight = Math.max(300, newHeight);

      updateWindowDimensions(window.id, {
        width: `${newWidth}px`,
        height: `${newHeight}px`
      });
    };

    const handleResizeEnd = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);

    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isResizing, resizeStart, window.id, updateWindowDimensions]);

  return (
    <div
      data-window-modal
      className="fixed"
      style={{
        width: dimensions.width,
        height: dimensions.height,
        top: dimensions.top,
        left: dimensions.left,
        zIndex: isActive ? 1000 : 900,
        display: window.isMinimized ? 'none' : 'block',
        pointerEvents: 'auto',
        isolation: 'isolate'
      }}
      onClick={(e) => {
        e.stopPropagation();
        bringToFront(window.id);
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Card
        ref={windowRef}
        className={`w-full h-full shadow-2xl transition-all ${
          isActive ? 'ring-2 ring-blue-500' : 'ring-1 ring-slate-300'
        } ${isDragging ? 'cursor-move' : ''} flex flex-col`}
      >
      {/* BARRA DE TÍTULO */}
      <div
        className={`flex items-center justify-between px-4 py-2 bg-gradient-to-r ${
          isActive ? 'from-blue-600 to-blue-700' : 'from-slate-600 to-slate-700'
        } text-white rounded-t-lg cursor-move select-none`}
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2 flex-1">
          <Move className="w-4 h-4" />
          <span className="font-semibold text-sm truncate">{window.title}</span>
          {window.empresaId && (
            <span className="text-xs opacity-75">• Empresa: {window.empresaId}</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {window.canMinimize && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                minimizeWindow(window.id);
              }}
            >
              <Minus className="w-4 h-4" />
            </Button>
          )}

          {window.canMaximize && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                toggleMaximize(window.id);
              }}
            >
              {window.isMaximized ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-red-500/80"
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(window.id);
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* CONTEÚDO DA JANELA - W-FULL FORÇADO + PADDING RESPONSIVO */}
      <CardContent className="flex-1 p-0 overflow-hidden w-full">
        <div className="w-full h-full overflow-y-auto p-4 md:p-6" style={{boxSizing: 'border-box'}}>
          {children}
        </div>
      </CardContent>

      {/* HANDLES DE RESIZE (se habilitado) */}
      {window.canResize && !window.isMaximized && (
        <>
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-1 cursor-s-resize"
            onMouseDown={(e) => handleResizeStart(e, 's')}
          />
          <div
            className="absolute top-0 bottom-0 right-0 w-1 cursor-e-resize"
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          />
        </>
      )}
      </Card>
    </div>
  );
}