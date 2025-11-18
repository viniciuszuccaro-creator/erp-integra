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
    // Prevenir fechamento de janelas ao clicar no backdrop
    const preventWindowClose = (e) => {
      const isWindowModal = e.target.closest('[data-window-modal]');
      const isWindowContent = e.target.closest('[data-window-content]');
      
      if (isWindowModal || isWindowContent) {
        e.stopPropagation();
        return;
      }
    };

    document.addEventListener('mousedown', preventWindowClose, true);
    document.addEventListener('click', preventWindowClose, true);

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

    return () => {
      document.removeEventListener('mousedown', preventWindowClose, true);
      document.removeEventListener('click', preventWindowClose, true);
      observer.disconnect();
    };
  }, []);

  return <>{children}</>;
}