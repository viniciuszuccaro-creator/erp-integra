import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useWindowManager } from './WindowManagerPersistent';

/**
 * 🪟 BARRA DE JANELAS MINIMIZADAS V21.0 - ETAPA 1
 * Exibe janelas minimizadas na parte inferior da tela
 * Permite restaurar ou fechar janelas rapidamente
 */

export default function MinimizedWindowsBar() {
  const { minimizedWindows, restoreWindow, closeWindow } = useWindowManager();

  if (minimizedWindows.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-800 border-t border-slate-700 p-2">
      <div className="flex items-center gap-2 overflow-x-auto">
        <span className="text-xs text-slate-300 font-semibold px-2">
          Janelas Minimizadas:
        </span>
        
        {minimizedWindows.map(window => (
          <Button
            key={window.id}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
            onClick={() => restoreWindow(window.id)}
          >
            <span className="text-xs font-medium truncate max-w-[200px]">
              {window.title}
            </span>
            
            {window.module && (
              <Badge variant="secondary" className="text-xs">
                {window.module}
              </Badge>
            )}

            <button
              className="ml-1 hover:bg-red-500/20 rounded p-0.5"
              onClick={(e) => {
                e.stopPropagation();
                closeWindow(window.id);
              }}
            >
              <X className="w-3 h-3" />
            </button>
          </Button>
        ))}
      </div>
    </div>
  );
}