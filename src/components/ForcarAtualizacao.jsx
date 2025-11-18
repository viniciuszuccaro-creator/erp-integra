import { useEffect } from 'react';

// FORÇAR ATUALIZAÇÃO - V21.1.2 FINAL + APLICAR ESTILOS INLINE
export default function ForcarAtualizacao() {
  useEffect(() => {
    // Força aplicação de estilos inline no DOM
    const applyStyles = () => {
      const root = document.getElementById('root');
      const body = document.body;
      const html = document.documentElement;
      
      [html, body, root].forEach(el => {
        if (el) {
          el.style.width = '100%';
          el.style.maxWidth = '100vw';
          el.style.overflowX = 'hidden';
        }
      });

      // Força no main e containers
      const main = document.querySelector('main');
      if (main) {
        main.style.width = '100%';
        main.style.maxWidth = '100%';
        main.style.flex = '1 1 auto';
      }

      // Remove limitações de container
      document.querySelectorAll('.container, .max-w-7xl, .max-w-6xl').forEach(el => {
        el.style.maxWidth = '100%';
        el.style.marginLeft = '0';
        el.style.marginRight = '0';
      });
    };

    applyStyles();
    // Reaplica após 100ms para garantir
    setTimeout(applyStyles, 100);
  }, []);

  return null;
}