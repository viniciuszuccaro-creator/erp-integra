import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

/**
 * 📐 LARGE MODAL WRAPPER V21.0 - ETAPA 1
 * Wrapper padrão para todos os modais grandes (max-w-[90vw])
 * 
 * Aplicação obrigatória:
 * - Todos os formulários de cadastro (Cliente, Fornecedor, Produto, etc.)
 * - Todos os formulários de documentos (Pedido, NF-e, OP, etc.)
 * - Todos os wizards e telas complexas
 * - Qualquer tela marcada como "Completo" ou "Detalhamento"
 */

export default function LargeModalWrapper({ 
  isOpen, 
  onClose, 
  title, 
  children,
  className = '',
  showHeader = true,
  headerActions = null
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col ${className}`}>
        {showHeader && (
          <DialogHeader className="border-b pb-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-slate-900">
                {title}
              </DialogTitle>
              {headerActions && (
                <div className="flex items-center gap-2">
                  {headerActions}
                </div>
              )}
            </div>
          </DialogHeader>
        )}
        
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}