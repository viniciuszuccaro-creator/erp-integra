import React, { useEffect, useRef } from 'react';
import { X, Minus, Maximize2, Minimize2, Pin, PinOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * V21.1.2 - Componente de Janela/Modal Independente
 * Suporta: fixar, minimizar, maximizar, arrastar
 */
export default function WindowModal({ 
  window, 
  onClose, 
  onMinimize, 
  onMaximize, 
  onRestore,
  onTogglePin,
  onBringToFront,
  children 
}) {
  const dragRef = useRef(null);
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current || window.state === 'maximized') return;
      
      const element = dragRef.current;
      if (!element) return;

      element.style.left = `${e.clientX - dragOffset.current.x}px`;
      element.style.top = `${e.clientY - dragOffset.current.y}px`;
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [window.state]);

  const handleMouseDown = (e) => {
    if (window.state === 'maximized') return;
    
    isDragging.current = true;
    document.body.style.cursor = 'move';
    
    const rect = dragRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    onBringToFront();
  };

  if (window.state === 'minimized') {
    return null;
  }

  const isMaximized = window.state === 'maximized';

  return (
    <div
      ref={dragRef}
      className={cn(
        "fixed bg-white rounded-lg shadow-2xl border-2 flex flex-col overflow-hidden",
        isMaximized ? "inset-4" : "max-w-[90vw] max-h-[95vh]",
        window.pinned ? "border-blue-500" : "border-slate-300"
      )}
      style={{
        zIndex: window.zIndex,
        left: isMaximized ? undefined : '5%',
        top: isMaximized ? undefined : '5%',
        width: isMaximized ? undefined : '90vw',
        height: isMaximized ? undefined : '90vh'
      }}
      onClick={onBringToFront}
    >
      {/* Header */}
      <div 
        className={cn(
          "flex items-center justify-between px-4 py-3 border-b cursor-move",
          window.pinned ? "bg-blue-50" : "bg-slate-50"
        )}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-3">
          {window.icon && <window.icon className="w-5 h-5 text-slate-700" />}
          <div>
            <h3 className="font-semibold text-slate-900">{window.title}</h3>
            {window.subtitle && (
              <p className="text-xs text-slate-500">{window.subtitle}</p>
            )}
          </div>
          {window.badge && (
            <Badge className="ml-2">{window.badge}</Badge>
          )}
          {window.pinned && (
            <Badge className="ml-2 bg-blue-600">Fixado</Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onTogglePin}
            className="h-8 w-8"
            title={window.pinned ? "Desfixar" : "Fixar"}
          >
            {window.pinned ? (
              <PinOff className="w-4 h-4 text-blue-600" />
            ) : (
              <Pin className="w-4 h-4 text-slate-500" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onMinimize}
            className="h-8 w-8"
            title="Minimizar"
          >
            <Minus className="w-4 h-4 text-slate-500" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={isMaximized ? onRestore : onMaximize}
            className="h-8 w-8"
            title={isMaximized ? "Restaurar" : "Maximizar"}
          >
            {isMaximized ? (
              <Minimize2 className="w-4 h-4 text-slate-500" />
            ) : (
              <Maximize2 className="w-4 h-4 text-slate-500" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}