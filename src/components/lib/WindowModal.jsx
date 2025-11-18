import React, { useEffect, useRef } from 'react';
import { X, Minus, Maximize2, Minimize2, Pin, PinOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * V21.1.2-R2 - Componente de Janela/Modal Aprimorado
 * ✅ Highlighting visual de janela ativa
 * ✅ Drag melhorado com cursor feedback
 * ✅ Foco automático ao clicar
 */
export default function WindowModal({ 
  window, 
  isActive,
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
      document.body.style.userSelect = '';
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
    document.body.style.userSelect = 'none';
    
    const rect = dragRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    onBringToFront();
  };

  // Trazer para frente ao clicar em qualquer parte da janela
  const handleWindowClick = (e) => {
    if (!isActive) {
      onBringToFront();
    }
  };

  if (window.state === 'minimized') {
    return null;
  }

  const isMaximized = window.state === 'maximized';

  return (
    <div
      ref={dragRef}
      className={cn(
        "fixed bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden transition-all duration-200",
        isMaximized ? "inset-4" : "max-w-[90vw] max-h-[95vh]",
        // V21.1.2-R2: Border visual para janela ativa
        isActive 
          ? window.pinned 
            ? "border-4 border-blue-500 ring-2 ring-blue-300" 
            : "border-4 border-purple-500 ring-2 ring-purple-300"
          : window.pinned
            ? "border-2 border-blue-300"
            : "border-2 border-slate-300",
        // Sombra mais intensa na janela ativa
        isActive ? "shadow-2xl" : "shadow-lg"
      )}
      style={{
        zIndex: window.zIndex,
        left: isMaximized ? undefined : '5%',
        top: isMaximized ? undefined : '5%',
        width: isMaximized ? undefined : '90vw',
        height: isMaximized ? undefined : '90vh'
      }}
      onClick={handleWindowClick}
    >
      {/* Header */}
      <div 
        className={cn(
          "flex items-center justify-between px-4 py-3 border-b cursor-move transition-colors",
          isActive
            ? window.pinned 
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
              : "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
            : window.pinned
              ? "bg-blue-50"
              : "bg-slate-50"
        )}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-3">
          {window.icon && (
            <window.icon className={cn(
              "w-5 h-5",
              isActive ? "text-white" : "text-slate-700"
            )} />
          )}
          <div>
            <h3 className={cn(
              "font-semibold",
              isActive ? "text-white" : "text-slate-900"
            )}>
              {window.title}
            </h3>
            {window.subtitle && (
              <p className={cn(
                "text-xs",
                isActive ? "text-white/80" : "text-slate-500"
              )}>
                {window.subtitle}
              </p>
            )}
          </div>
          {window.badge && (
            <Badge className={cn(
              "ml-2",
              isActive ? "bg-white/20 text-white" : ""
            )}>
              {window.badge}
            </Badge>
          )}
          {window.pinned && (
            <Badge className={cn(
              "ml-2",
              isActive ? "bg-white/20 text-white" : "bg-blue-600 text-white"
            )}>
              Fixado
            </Badge>
          )}
          {isActive && !window.pinned && (
            <Badge className="ml-2 bg-white/20 text-white animate-pulse">
              Ativa
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin();
            }}
            className={cn(
              "h-8 w-8",
              isActive ? "hover:bg-white/20 text-white" : ""
            )}
            title={window.pinned ? "Desfixar" : "Fixar"}
          >
            {window.pinned ? (
              <PinOff className="w-4 h-4" />
            ) : (
              <Pin className="w-4 h-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            className={cn(
              "h-8 w-8",
              isActive ? "hover:bg-white/20 text-white" : ""
            )}
            title="Minimizar"
          >
            <Minus className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              isMaximized ? onRestore() : onMaximize();
            }}
            className={cn(
              "h-8 w-8",
              isActive ? "hover:bg-white/20 text-white" : ""
            )}
            title={isMaximized ? "Restaurar" : "Maximizar"}
          >
            {isMaximized ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className={cn(
              "h-8 w-8",
              isActive 
                ? "hover:bg-red-500 text-white" 
                : "hover:bg-red-100 hover:text-red-600"
            )}
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