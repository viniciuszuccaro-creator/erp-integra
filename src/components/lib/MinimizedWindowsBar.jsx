import React from 'react';
import { useWindowManager } from './WindowManager';
import { Maximize2 } from 'lucide-react';

/**
 * BARRA DE JANELAS MINIMIZADAS V21.0
 * Exibe janelas minimizadas na parte inferior da tela
 */

export default function MinimizedWindowsBar() {
  const { windows, restoreWindow } = useWindowManager();
  
  const minimizedWindows = windows.filter(w => w.isMinimized);

  if (minimizedWindows.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 p-2 flex gap-2 z-[9999]">
      {minimizedWindows.map(window => (
        <button
          key={window.id}
          onClick={() => restoreWindow(window.id)}
          className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded transition-colors max-w-xs"
        >
          <Maximize2 className="w-4 h-4" />
          <span className="text-sm truncate">{window.title}</span>
        </button>
      ))}
    </div>
  );
}