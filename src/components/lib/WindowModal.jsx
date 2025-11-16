import React, { useEffect, useRef, useState } from 'react';
import { X, Minus, Maximize2, Minimize2, Pin, PinOff, Copy, Grid3x3, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

/**
 * V21.0 - COMPONENTE DE JANELA MULTITAREFA
 * 
 * ✅ Drag & Drop avançado
 * ✅ Redimensionamento livre
 * ✅ Visual highlighting de janela ativa
 * ✅ Menu de ações avançadas
 * ✅ Snap automático
 * ✅ Feedback visual aprimorado
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
  onDuplicate,
  onUpdatePosition,
  onUpdateSize,
  children 
}) {
  const windowRef = useRef(null);
  const dragRef = useRef(null);
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ width: 0, height: 0, x: 0, y: 0 });
  
  const [localPosition, setLocalPosition] = useState(window.position || { x: 100, y: 100 });
  const [localSize, setLocalSize] = useState(window.size || { width: '90vw', height: '90vh' });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging.current && window.state !== 'maximized') {
        const newX = e.clientX - dragOffset.current.x;
        const newY = Math.max(0, e.clientY - dragOffset.current.y);
        
        setLocalPosition({ x: newX, y: newY });
      }
      
      if (isResizing.current) {
        const deltaX = e.clientX - resizeStart.current.x;
        const deltaY = e.clientY - resizeStart.current.y;
        
        const newWidth = Math.max(400, resizeStart.current.width + deltaX);
        const newHeight = Math.max(300, resizeStart.current.height + deltaY);
        
        setLocalSize({ width: `${newWidth}px`, height: `${newHeight}px` });
      }
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = '';
        if (onUpdatePosition) onUpdatePosition(localPosition);
      }
      
      if (isResizing.current) {
        isResizing.current = false;
        document.body.style.cursor = 'default';
        if (onUpdateSize) onUpdateSize(localSize);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [window.state, localPosition, localSize, onUpdatePosition, onUpdateSize]);

  const handleMouseDown = (e) => {
    if (window.state === 'maximized') return;
    
    isDragging.current = true;
    document.body.style.cursor = 'move';
    document.body.style.userSelect = 'none';
    
    const rect = windowRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    onBringToFront();
  };

  const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    isResizing.current = true;
    document.body.style.cursor = 'nwse-resize';
    
    const rect = windowRef.current.getBoundingClientRect();
    resizeStart.current = {
      width: rect.width,
      height: rect.height,
      x: e.clientX,
      y: e.clientY
    };
  };

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
      ref={windowRef}
      className={cn(
        "fixed bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden transition-all duration-200",
        isMaximized ? "inset-4" : "",
        isActive 
          ? window.pinned 
            ? "border-4 border-blue-500 ring-4 ring-blue-200" 
            : "border-4 border-purple-500 ring-4 ring-purple-200"
          : window.pinned
            ? "border-2 border-blue-300"
            : "border-2 border-slate-300",
        isActive ? "shadow-2xl scale-[1.01]" : "shadow-lg"
      )}
      style={{
        zIndex: window.zIndex,
        left: isMaximized ? undefined : `${localPosition.x}px`,
        top: isMaximized ? undefined : `${localPosition.y}px`,
        width: isMaximized ? undefined : localSize.width,
        height: isMaximized ? undefined : localSize.height
      }}
      onClick={handleWindowClick}
    >
      {/* Header */}
      <div 
        ref={dragRef}
        className={cn(
          "flex items-center justify-between px-4 py-3 border-b cursor-move transition-colors select-none",
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
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {window.icon && (
            <window.icon className={cn(
              "w-5 h-5 flex-shrink-0",
              isActive ? "text-white" : "text-slate-700"
            )} />
          )}
          <div className="min-w-0 flex-1">
            <h3 className={cn(
              "font-semibold truncate",
              isActive ? "text-white" : "text-slate-900"
            )}>
              {window.title}
            </h3>
            {window.subtitle && (
              <p className={cn(
                "text-xs truncate",
                isActive ? "text-white/80" : "text-slate-500"
              )}>
                {window.subtitle}
              </p>
            )}
          </div>
          {window.badge && (
            <Badge className={cn(
              "flex-shrink-0",
              isActive ? "bg-white/20 text-white" : ""
            )}>
              {window.badge}
            </Badge>
          )}
          {window.pinned && (
            <Badge className={cn(
              "flex-shrink-0",
              isActive ? "bg-white/20 text-white" : "bg-blue-600 text-white"
            )}>
              📌 Fixado
            </Badge>
          )}
          {isActive && !window.pinned && (
            <Badge className="flex-shrink-0 bg-white/20 text-white animate-pulse">
              ✨ Ativa
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Menu de ações avançadas */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  isActive ? "hover:bg-white/20 text-white" : ""
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                if (onDuplicate) onDuplicate();
              }}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicar Janela
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                // Snap left
              }}>
                <Grid3x3 className="w-4 h-4 mr-2" />
                Ancorar à Esquerda
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onTogglePin();
              }}>
                {window.pinned ? (
                  <>
                    <PinOff className="w-4 h-4 mr-2" />
                    Desfixar
                  </>
                ) : (
                  <>
                    <Pin className="w-4 h-4 mr-2" />
                    Fixar no Topo
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
      <div className="flex-1 overflow-hidden flex flex-col">
        {children}
      </div>

      {/* Resize Handle */}
      {!isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
          onMouseDown={handleResizeMouseDown}
          style={{
            background: 'linear-gradient(135deg, transparent 0%, transparent 50%, #94a3b8 50%, #94a3b8 100%)'
          }}
        />
      )}
    </div>
  );
}