import { useEffect, useRef, useState } from 'react';

/**
 * V22.0 ETAPA 3 - Hook de Layout Responsivo Universal
 * 
 * Garante que TODOS os componentes usem w-full e h-full
 * Calcula dinamicamente as dimensões disponíveis
 * Adapta sem cortes de conteúdo
 */
export function useResponsiveLayout(options = {}) {
  const {
    minHeight = 200,
    maxHeight = null,
    padding = 0,
    reserveHeader = 0,
    reserveFooter = 0
  } = options;

  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
    availableHeight: 0,
    availableWidth: 0
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      const rect = containerRef.current.getBoundingClientRect();
      const availableHeight = Math.max(
        minHeight,
        rect.height - reserveHeader - reserveFooter - (padding * 2)
      );

      const finalHeight = maxHeight ? Math.min(availableHeight, maxHeight) : availableHeight;

      setDimensions({
        width: rect.width,
        height: rect.height,
        availableHeight: finalHeight,
        availableWidth: rect.width - (padding * 2)
      });
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    window.addEventListener('resize', updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [minHeight, maxHeight, padding, reserveHeader, reserveFooter]);

  return {
    containerRef,
    dimensions,
    containerClassName: 'w-full h-full'
  };
}

/**
 * Hook para calcular altura de abas dinâmicas
 */
export function useTabHeight(options = {}) {
  const {
    headerHeight = 48,
    padding = 16,
    extraReserve = 0
  } = options;

  const tabRef = useRef(null);
  const [tabHeight, setTabHeight] = useState('auto');

  useEffect(() => {
    if (!tabRef.current) return;

    const calculateHeight = () => {
      const parent = tabRef.current.closest('[role="tabpanel"]') || 
                     tabRef.current.closest('.tab-content') ||
                     tabRef.current.parentElement;

      if (!parent) return;

      const parentRect = parent.getBoundingClientRect();
      const available = parentRect.height - headerHeight - padding - extraReserve;
      
      setTabHeight(Math.max(200, available));
    };

    calculateHeight();

    const resizeObserver = new ResizeObserver(calculateHeight);
    if (tabRef.current.parentElement) {
      resizeObserver.observe(tabRef.current.parentElement);
    }

    return () => resizeObserver.disconnect();
  }, [headerHeight, padding, extraReserve]);

  return {
    tabRef,
    tabHeight,
    tabClassName: 'w-full',
    tabStyle: { height: typeof tabHeight === 'number' ? `${tabHeight}px` : tabHeight }
  };
}