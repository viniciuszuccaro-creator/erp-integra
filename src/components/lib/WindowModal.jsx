import React, { useRef, useState, useEffect } from 'react';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { useWindowManager } from './WindowManager';

/**
 * WINDOW MODAL V21.0
 * Janela Responsiva Individual com Controles
 * w-full e h-full responsivo, redimensionável, com barra de rolagem automática
 */

export default function WindowModal({ window, children }) {
  const { closeWindow, minimizeWindow, toggleMaximize, bringToFront, updateWindow } = useWindowManager();
  const windowRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Estilo da janela
  const windowStyle = window.isMaximized
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: window.zIndex,
      }
    : {
        position: 'fixed',
        top: window.y,
        left: window.x,
        width: window.width,
        height: window.height,
        zIndex: window.zIndex,
      };

  // Iniciar drag
  const handleMouseDown = (e) => {
    if (window.isMaximized || e.target.closest('.window-controls')) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - window.x,
      y: e.clientY - window.y,
    });
    bringToFront(window.id);
  };

  // Iniciar resize
  const handleResizeMouseDown = (e) => {
    if (window.isMaximized) return;
    
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: window.width,
      height: window.height,
    });
  };

  // Movimento do mouse
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(e.clientX - dragStart.x, window.innerWidth - 300));
        const newY = Math.max(0, Math.min(e.clientY - dragStart.y, window.innerHeight - 100));
        updateWindow(window.id, { x: newX, y: newY });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const newWidth = Math.max(400, Math.min(resizeStart.width + deltaX, window.innerWidth - window.x));
        const newHeight = Math.max(300, Math.min(resizeStart.height + deltaY, window.innerHeight - window.y));
        updateWindow(window.id, { width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart, window, updateWindow]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      ref={windowRef}
      style={windowStyle}
      className={`bg-white rounded-lg shadow-2xl border-2 border-slate-300 flex flex-col overflow-hidden ${
        isDragging ? 'cursor-move' : ''
      }`}
      onClick={() => bringToFront(window.id)}
    >
      {/* Header */}
      <div
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 flex items-center justify-between cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <h3 className="font-semibold text-sm truncate flex-1">{window.title}</h3>
        <div className="window-controls flex items-center gap-1">
          <button
            onClick={() => minimizeWindow(window.id)}
            className="p-1.5 hover:bg-blue-800 rounded transition-colors"
            title="Minimizar"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleMaximize(window.id)}
            className="p-1.5 hover:bg-blue-800 rounded transition-colors"
            title={window.isMaximized ? 'Restaurar' : 'Maximizar'}
          >
            {window.isMaximized ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => closeWindow(window.id)}
            className="p-1.5 hover:bg-red-600 rounded transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Conteúdo com barra de rolagem */}
      <div className="flex-1 overflow-auto bg-white">
        {children}
      </div>

      {/* Resize handle */}
      {!window.isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={handleResizeMouseDown}
          style={{
            background: 'linear-gradient(135deg, transparent 50%, #64748b 50%)',
          }}
        />
      )}
    </div>
  );
}