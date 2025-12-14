import React from 'react';
import { useWindowManager } from './WindowManager';
import { Maximize2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * BARRA DE JANELAS MINIMIZADAS V21.1 - APRIMORADA
 * Exibe janelas minimizadas com animações e controles
 */

export default function MinimizedWindowsBar() {
  const { windows, restoreWindow, closeWindow } = useWindowManager();
  
  const minimizedWindows = windows.filter(w => w.isMinimized);

  if (minimizedWindows.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-slate-800 to-slate-900 border-t-2 border-blue-500/50 p-3 flex gap-3 z-[999999999] shadow-2xl backdrop-blur-sm">
      <div className="flex items-center gap-2 px-3 text-slate-300 border-r border-slate-600">
        <Badge className="bg-blue-600 text-white">{minimizedWindows.length}</Badge>
        <span className="text-sm font-medium">Janela{minimizedWindows.length > 1 ? 's' : ''} minimizada{minimizedWindows.length > 1 ? 's' : ''}</span>
      </div>
      
      <div className="flex gap-2 overflow-x-auto flex-1">
        <AnimatePresence>
          {minimizedWindows.map(window => (
            <motion.button
              key={window.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => {
                e.stopPropagation();
                restoreWindow(window.id);
              }}
              className="group relative flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 border border-slate-600 hover:border-blue-500 flex-shrink-0"
            >
              <Maximize2 className="w-4 h-4 flex-shrink-0 text-blue-400" />
              <span className="text-sm font-medium whitespace-nowrap">{window.title}</span>
              
              {/* Botão fechar (aparece no hover) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeWindow(window.id);
                }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                title="Fechar janela"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}