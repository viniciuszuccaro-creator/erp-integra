import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Minus, Square } from 'lucide-react';
import { useMultitarefa } from './lib/useMultitarefa';
import { cn } from '@/lib/utils';

/**
 * V21.1.2 - DOCK DE JANELAS ABERTAS
 * Barra inferior estilo Windows/Mac com todas as janelas abertas
 */
export default function BarraJanelasAbertas() {
  const { janelas, ativarJanela, fecharJanela, minimizarJanela } = useMultitarefa();

  if (janelas.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-800 to-slate-900 border-t border-slate-700 shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto">
        {janelas.map((janela) => (
          <div
            key={janela.id}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer min-w-[200px] max-w-[300px]",
              janela.ativa 
                ? "bg-blue-600 text-white shadow-lg" 
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            )}
            onClick={() => ativarJanela(janela.id)}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{janela.titulo}</p>
              <p className="text-xs opacity-70 truncate">{janela.tipo}</p>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  minimizarJanela(janela.id);
                }}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  fecharJanela(janela.id);
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
        
        <div className="ml-auto flex items-center gap-2 px-3">
          <Badge className="bg-white/10 text-white border-white/20">
            {janelas.length} janela(s)
          </Badge>
        </div>
      </div>
    </div>
  );
}