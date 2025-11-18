import { useEffect } from 'react';

/**
 * 🔧 FORCE FULL WIDTH WRAPPER - ETAPA 1 CRÍTICA
 * 
 * Força w-full em TODOS os elementos do sistema
 * Previne fechamento acidental de janelas
 * Aplica regras globais de responsividade
 */
export default function ForceFullWidthWrapper({ children }) {
  useEffect(() => {
    // Prevenir fechamento de janelas ao clicar no backdrop - MÁXIMA PRIORIDADE
    const preventWindowClose = (e) => {
      const isWindowModal = e.target.closest('[data-window-modal]');
      const isWindowContent = e.target.closest('[data-window-content]');
      const isOverlay = e.target.classList.contains('fixed') && e.target.classList.contains('inset-0');
      
      // Se clicar em overlay, não fazer nada
      if (isOverlay) {
        e.stopPropagation();
        e.preventDefault();
        return false;
      }
      
      // Se clicar dentro da janela, permitir
      if (isWindowModal || isWindowContent) {
        e.stopPropagation();
        return;
      }
      
      // Se clicar fora, prevenir
      if (!isWindowModal && !isWindowContent && document.querySelector('[data-window-modal]')) {
        e.stopPropagation();
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('mousedown', preventWindowClose, true);
    document.addEventListener('click', preventWindowClose, true);
    document.addEventListener('pointerdown', preventWindowClose, true);

    // Forçar w-full em todos os TabsContent
    const observer = new MutationObserver(() => {
      const tabContents = document.querySelectorAll('[role="tabpanel"]');
      tabContents.forEach(tab => {
        tab.style.width = '100%';
        tab.style.maxWidth = '100%';
        tab.style.boxSizing = 'border-box';
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Forçar todos os containers principais
    const forceFullWidth = () => {
      document.querySelectorAll('.container, .max-w-7xl, .max-w-6xl, .max-w-5xl, .max-w-4xl').forEach(el => {
        el.style.maxWidth = '100%';
        el.style.width = '100%';
        el.style.marginLeft = '0';
        el.style.marginRight = '0';
      });
    };

    forceFullWidth();
    const intervalId = setInterval(forceFullWidth, 1000);

    return () => {
      document.removeEventListener('mousedown', preventWindowClose, true);
      document.removeEventListener('click', preventWindowClose, true);
      document.removeEventListener('pointerdown', preventWindowClose, true);
      observer.disconnect();
      clearInterval(intervalId);
    };
  }, []);

  return <>{children}</>;
}