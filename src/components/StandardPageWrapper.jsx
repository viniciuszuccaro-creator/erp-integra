import React from 'react';

/**
 * 📄 STANDARD PAGE WRAPPER - ETAPA 1 V21.0
 * 
 * Wrapper universal para TODAS as páginas do sistema
 * Garante comportamento padronizado:
 * - w-full absoluto
 * - Responsivo (sm/md/lg padding)
 * - Overflow-y auto
 * - Min-height calculado
 * - Preparado para multitarefa
 */

export default function StandardPageWrapper({ children, className = '' }) {
  return (
    <div 
      className={`w-full p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto min-h-[calc(100vh-4rem)] max-w-full ${className}`}
      style={{ width: '100%', maxWidth: '100%' }}
    >
      {children}
    </div>
  );
}