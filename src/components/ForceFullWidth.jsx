import { useEffect } from 'react';

export default function ForceFullWidth() {
  useEffect(() => {
    const forceStyles = () => {
      // Aplica estilos inline em TODOS os elementos do caminho crítico
      const selectors = [
        'html',
        'body',
        '#root',
        '#root > div',
        '[data-sidebar-provider]',
        'main',
        'main > div',
        '.flex-1'
      ];

      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          el.style.width = '100%';
          el.style.maxWidth = '100vw';
          el.style.overflowX = 'hidden';
        });
      });

      // Remove TODAS as limitações de container
      const limiters = document.querySelectorAll('.container, [class*="max-w-"], .mx-auto');
      limiters.forEach(el => {
        el.style.maxWidth = '100%';
        el.style.marginLeft = '0';
        el.style.marginRight = '0';
      });

      // Log para debug
      const main = document.querySelector('main');
      if (main) {
        console.log('🔍 Main width:', main.offsetWidth);
        console.log('🔍 Window width:', window.innerWidth);
        console.log('🔍 Limitado?', main.offsetWidth < window.innerWidth - 300);
      }
    };

    forceStyles();
    setTimeout(forceStyles, 100);
    setTimeout(forceStyles, 500);
    
    // Observer para reagir a mudanças no DOM
    const observer = new MutationObserver(forceStyles);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}