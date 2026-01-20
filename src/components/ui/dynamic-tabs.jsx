import React, { useRef, useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

/**
 * V22.0 ETAPA 3 - Tabs com Rolagem Dinâmica
 * 
 * Calcula automaticamente a altura disponível
 * Elimina cortes de conteúdo
 * Rolagem interna inteligente
 */
export function DynamicTabs({
  children,
  defaultValue,
  value,
  onValueChange,
  className = '',
  tabListClassName = '',
  reserveHeight = 120,
  ...props
}) {
  const containerRef = useRef(null);
  const [contentHeight, setContentHeight] = useState('auto');

  useEffect(() => {
    if (!containerRef.current) return;

    const calculateHeight = () => {
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const tabsList = container.querySelector('[role="tablist"]');
      const tabsListHeight = tabsList?.getBoundingClientRect().height || 48;

      const available = containerRect.height - tabsListHeight - reserveHeight;
      setContentHeight(Math.max(200, available));
    };

    calculateHeight();

    const resizeObserver = new ResizeObserver(calculateHeight);
    resizeObserver.observe(containerRef.current);

    window.addEventListener('resize', calculateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', calculateHeight);
    };
  }, [reserveHeight]);

  return (
    <div ref={containerRef} className={cn('w-full h-full', className)}>
      <Tabs
        defaultValue={defaultValue}
        value={value}
        onValueChange={onValueChange}
        className="w-full h-full flex flex-col"
        {...props}
      >
        {children}
      </Tabs>
    </div>
  );
}

/**
 * TabContent com Scroll Automático
 */
export function DynamicTabContent({
  children,
  value,
  className = '',
  padding = 4,
  ...props
}) {
  const contentRef = useRef(null);
  const [height, setHeight] = useState('auto');

  useEffect(() => {
    if (!contentRef.current) return;

    const calculateHeight = () => {
      const parent = contentRef.current.closest('[data-state="active"]');
      if (!parent) return;

      const parentRect = parent.getBoundingClientRect();
      const available = parentRect.height - (padding * 8); // padding em pixels

      setHeight(Math.max(200, available));
    };

    // Delay para garantir que a aba está visível
    setTimeout(calculateHeight, 100);

    const resizeObserver = new ResizeObserver(calculateHeight);
    const parent = contentRef.current.closest('[role="tabpanel"]');
    if (parent) resizeObserver.observe(parent);

    return () => resizeObserver.disconnect();
  }, [padding, value]);

  return (
    <TabsContent
      value={value}
      className={cn('w-full m-0 focus-visible:outline-none', className)}
      {...props}
    >
      <div ref={contentRef} className="w-full">
        <ScrollArea
          className="w-full"
          style={{ height: typeof height === 'number' ? `${height}px` : height }}
        >
          <div className={`p-${padding}`}>
            {children}
          </div>
        </ScrollArea>
      </div>
    </TabsContent>
  );
}

/**
 * TabsList Responsiva
 */
export function DynamicTabsList({
  children,
  className = '',
  scrollable = true,
  ...props
}) {
  return (
    <div className={cn('w-full', scrollable && 'overflow-x-auto')}>
      <TabsList
        className={cn('flex w-full justify-start', className)}
        {...props}
      >
        {children}
      </TabsList>
    </div>
  );
}