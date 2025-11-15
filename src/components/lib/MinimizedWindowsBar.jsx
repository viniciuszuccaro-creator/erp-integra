import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Maximize2, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWindowManager } from './WindowManager';

/**
 * V21.1.2 - Barra de Janelas Minimizadas
 * Aparece no canto inferior direito
 */
export default function MinimizedWindowsBar() {
  const { windows, restoreWindow, closeWindow } = useWindowManager();

  const minimizedWindows = windows.filter(w => w.state === 'minimized');

  if (minimizedWindows.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-[9999]">
      {minimizedWindows.map((window) => {
        const Icon = window.icon;
        
        return (
          <div
            key={window.id}
            className={cn(
              "bg-white rounded-lg shadow-lg border-2 p-3 max-w-xs flex items-center gap-3 hover:shadow-xl transition-shadow",
              window.pinned ? "border-blue-500" : "border-slate-300"
            )}
          >
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
                onClick={() => restoreWindow(window.id)}
                className="h-7 w-7"
                title="Restaurar"
              >
                <Maximize2 className="w-3 h-3 text-slate-500" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => closeWindow(window.id)}
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
        <Badge className="bg-blue-600 text-white text-xs self-end">
          {minimizedWindows.length} janela{minimizedWindows.length > 1 ? 's' : ''} minimizada{minimizedWindows.length > 1 ? 's' : ''}
        </Badge>
      )}
    </div>
  );
}