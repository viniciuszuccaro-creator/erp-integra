import React from 'react';
import { cn } from '@/lib/utils';
import { useResponsiveLayout } from '@/components/lib/useResponsiveLayout';

/**
 * V22.0 ETAPA 3 - Container Responsivo Universal
 * 
 * GARANTE: w-full h-full em todos os componentes
 * Adapta dinamicamente sem cortes de conteúdo
 * Calcula dimensões disponíveis
 */
export function ResponsiveContainer({
  children,
  className = '',
  minHeight = 200,
  maxHeight = null,
  padding = 0,
  reserveHeader = 0,
  reserveFooter = 0,
  scrollable = true,
  ...props
}) {
  const { containerRef, dimensions } = useResponsiveLayout({
    minHeight,
    maxHeight,
    padding,
    reserveHeader,
    reserveFooter
  });

  return (
    <div
      ref={containerRef}
      className={cn(
        'w-full h-full',
        scrollable && 'overflow-auto',
        className
      )}
      {...props}
    >
      {typeof children === 'function' ? children(dimensions) : children}
    </div>
  );
}

/**
 * Container de Conteúdo com Scroll
 */
export function ScrollableContent({
  children,
  className = '',
  maxHeight = '100%',
  ...props
}) {
  return (
    <div
      className={cn(
        'w-full overflow-y-auto overflow-x-hidden',
        className
      )}
      style={{ maxHeight }}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Container de Grid Responsivo
 */
export function ResponsiveGrid({
  children,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 4,
  className = ''
}) {
  const gridClass = `grid gap-${gap} 
    grid-cols-${cols.sm} 
    md:grid-cols-${cols.md} 
    lg:grid-cols-${cols.lg} 
    xl:grid-cols-${cols.xl}`;

  return (
    <div className={cn('w-full', gridClass, className)}>
      {children}
    </div>
  );
}

/**
 * Flex Container Responsivo
 */
export function ResponsiveFlex({
  children,
  direction = 'row',
  wrap = true,
  gap = 4,
  justify = 'start',
  align = 'start',
  className = ''
}) {
  return (
    <div
      className={cn(
        'w-full flex',
        `flex-${direction}`,
        wrap && 'flex-wrap',
        `gap-${gap}`,
        `justify-${justify}`,
        `items-${align}`,
        className
      )}
    >
      {children}
    </div>
  );
}