import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Maximize2, Pin, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWindowManager } from './WindowManager';

/**
 * V21.1.2-R2 - Barra de Janelas Minimizadas APRIMORADA
 * ✅ Drag-and-drop para restaurar janelas
 * ✅ Feedback visual ao arrastar
 * ✅ Hover states melhorados
 */
export default function MinimizedWindowsBar() {
  const { windows, restoreWindow, closeWindow } = useWindowManager();
  const [draggingId, setDraggingId] = useState(null);

  const minimizedWindows = windows.filter(w => w.state === 'minimized');

  const handleDragStart = (e, windowId) => {
    setDraggingId(windowId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('windowId', windowId);
    
    // Criar elemento de drag visual
    const dragElement = e.currentTarget.cloneNode(true);
    dragElement.style.opacity = '0.7';
    dragElement.style.position = 'absolute';
    dragElement.style.top = '-9999px';
    document.body.appendChild(dragElement);
    e.dataTransfer.setDragImage(dragElement, 0, 0);
    
    setTimeout(() => {
      document.body.removeChild(dragElement);
    }, 0);
  };

  const handleDragEnd = (e, windowId) => {
    setDraggingId(null);
    
    // Se soltar fora da barra (em qualquer lugar da tela), restaura a janela
    const barRect = e.currentTarget.parentElement.getBoundingClientRect();
    const isOutsideBar = (
      e.clientY < barRect.top ||
      e.clientX < barRect.left ||
      e.clientX > barRect.right
    );
    
    if (isOutsideBar) {
      restoreWindow(windowId);
    }
  };

  if (minimizedWindows.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-[9999]">
      <div className="bg-slate-100/80 backdrop-blur-sm rounded-lg p-2 border border-slate-300">
        <p className="text-xs text-slate-600 font-semibold mb-2 px-2">
          🪟 Janelas Minimizadas
        </p>
        <p className="text-xs text-slate-500 mb-2 px-2">
          💡 Arraste para fora para restaurar
        </p>
      </div>

      {minimizedWindows.map((window) => {
        const Icon = window.icon;
        const isDragging = draggingId === window.id;
        
        return (
          <div
            key={window.id}
            draggable
            onDragStart={(e) => handleDragStart(e, window.id)}
            onDragEnd={(e) => handleDragEnd(e, window.id)}
            className={cn(
              "bg-white rounded-lg shadow-lg border-2 p-3 max-w-xs flex items-center gap-3 transition-all cursor-move",
              "hover:shadow-xl hover:scale-105 hover:border-purple-400",
              window.pinned ? "border-blue-500" : "border-slate-300",
              isDragging && "opacity-50 scale-95"
            )}
          >
            <GripVertical className="w-4 h-4 text-slate-400 flex-shrink-0" />
            
            {Icon && <Icon className="w-5 h-5 text-slate-700 flex-shrink-0" />}
            
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-slate-900 truncate">
                {window.title}
              </p>
              {window.subtitle && (
                <p className="text-xs text-slate-500 truncate">{window.subtitle}</p>
              )}
            </div>

            {window.pinned && (
              <Pin className="w-4 h-4 text-blue-600 flex-shrink-0" />
            )}

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  restoreWindow(window.id);
                }}
                className="h-7 w-7 hover:bg-purple-100 hover:text-purple-600"
                title="Restaurar"
              >
                <Maximize2 className="w-3 h-3" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  closeWindow(window.id);
                }}
                className="h-7 w-7 hover:bg-red-100 hover:text-red-600"
                title="Fechar"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        );
      })}

      {minimizedWindows.length > 0 && (
        <Badge className="bg-purple-600 text-white text-xs self-end shadow-lg">
          {minimizedWindows.length} janela{minimizedWindows.length > 1 ? 's' : ''}
        </Badge>
      )}
    </div>
  );
}