import React from 'react';
import { Button } from '@/components/ui/button';
import { Minimize2, Maximize2, X, Layers } from 'lucide-react';
import { useWindowManager } from './WindowManagerPersistent';

/**
 * 🎛️ CONTROLES GLOBAIS DE JANELAS
 * Barra de controle para gerenciar todas as janelas
 */

export function GlobalWindowControls() {
  const { 
    allWindows, 
    closeAllWindows, 
    minimizeAllWindows, 
    restoreAllWindows 
  } = useWindowManager();

  const totalWindows = allWindows.length;
  const minimizedCount = allWindows.filter(w => w.isMinimized).length;

  if (totalWindows === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] bg-white rounded-lg shadow-xl p-2 flex items-center gap-2 border border-slate-200">
      <div className="flex items-center gap-2 px-2">
        <Layers className="w-4 h-4 text-slate-600" />
        <span className="text-sm font-medium text-slate-700">{totalWindows}</span>
      </div>
      
      <div className="h-6 w-px bg-slate-200" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={minimizeAllWindows}
        className="h-8 w-8 p-0"
        title="Minimizar Todas (Ctrl+Shift+M)"
      >
        <Minimize2 className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={restoreAllWindows}
        className="h-8 w-8 p-0"
        title="Restaurar Todas (Ctrl+Alt+M)"
      >
        <Maximize2 className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (confirm(`Fechar todas as ${totalWindows} janelas?`)) {
            closeAllWindows();
          }
        }}
        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
        title="Fechar Todas (Ctrl+Shift+W)"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default GlobalWindowControls;