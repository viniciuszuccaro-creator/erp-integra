import React from 'react';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { cn } from '@/lib/utils';

/**
 * V22.0 ETAPA 3 - Wrapper Padrão para Páginas
 * 
 * Garante w-full h-full em todas as páginas
 * Padding consistente e responsivo
 */
export default function PageWrapper({ 
  children, 
  className = '',
  noPadding = false,
  maxWidth = 'full'
}) {
  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  };

  return (
    <ResponsiveContainer className={cn(!noPadding && 'p-4 md:p-6', className)}>
      <div className={cn('w-full mx-auto', maxWidthClasses[maxWidth] || maxWidthClasses.full)}>
        {children}
      </div>
    </ResponsiveContainer>
  );
}