import React from 'react';

/**
 * 📐 STANDARD PAGE WRAPPER V21.0 - ETAPA 1
 * Wrapper padrão para todas as páginas principais do ERP
 * 
 * Características:
 * - w-full para ocupar toda largura disponível
 * - Responsivo em todas as resoluções
 * - Padding consistente
 * - Scroll interno quando necessário
 */

export default function StandardPageWrapper({ 
  children, 
  className = '',
  noPadding = false,
  fullHeight = false
}) {
  return (
    <div 
      className={`
        w-full 
        ${noPadding ? '' : 'p-4 sm:p-6 lg:p-8'} 
        ${fullHeight ? 'min-h-screen' : 'min-h-[calc(100vh-4rem)]'}
        overflow-y-auto
        ${className}
      `}
    >
      <div className="max-w-[1920px] mx-auto">
        {children}
      </div>
    </div>
  );
}