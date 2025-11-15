import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Minus, Maximize2 } from 'lucide-react';
import { useMultitarefa } from './lib/useMultitarefa';

/**
 * V21.1.2 - RENDERIZADOR DE JANELAS MULTITAREFA
 * Todas as janelas abertas renderizadas como modais 90vw
 */
export default function JanelasMultitarefa() {
  const { janelas, fecharJanela, minimizarJanela, ativarJanela } = useMultitarefa();

  return (
    <>
      {janelas.map((janela) => (
        <Dialog
          key={janela.id}
          open={!janela.minimizada}
          onOpenChange={(open) => {
            if (!open) fecharJanela(janela.id);
          }}
        >
          <DialogContent 
            className="max-w-[90vw] max-h-[90vh] overflow-y-auto"
            onInteractOutside={(e) => {
              e.preventDefault();
              ativarJanela(janela.id);
            }}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between pr-8">
                <span>{janela.titulo}</span>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => minimizarJanela(janela.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="mt-4">
              {janela.conteudo}
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </>
  );
}