import { useEffect } from 'react';

/**
 * FORÇAR W-FULL - V21.1.2-FINAL
 * Aplica estilos inline via JavaScript para garantir 100% de largura
 */
export default function ForcarAtualizacao() {
  useEffect(() => {
    const applyStyles = () => {
      const root = document.getElementById('root');
      const body = document.body;
      const html = document.documentElement;
      const main = document.querySelector('main');
      
      // Aplicar estilos de forma AGRESSIVA com cssText + !important
      if (html) {
        html.style.cssText = 'width: 100vw !important; max-width: 100vw !important; overflow-x: hidden !important; margin: 0 !important; padding: 0 !important;';
      }
      
      if (body) {
        body.style.cssText = 'width: 100vw !important; max-width: 100vw !important; overflow-x: hidden !important; margin: 0 !important; padding: 0 !important;';
      }
      
      if (root) {
        root.style.cssText = 'width: 100% !important; max-width: 100% !important;';
      }
      
      if (main) {
        main.style.cssText = 'width: 100% !important; max-width: 100% !important; flex: 1 1 auto !important;';
      }

      // Remover max-width de containers de forma AGRESSIVA
      const containers = document.querySelectorAll('.container, .max-w-7xl, .max-w-6xl, .max-w-5xl, .max-w-4xl, .max-w-3xl, .max-w-2xl, .max-w-xl, .max-w-lg, .max-w-md, .max-w-sm, .mx-auto');
      containers.forEach(container => {
        container.style.cssText = 'max-width: 100% !important; width: 100% !important; margin-left: 0 !important; margin-right: 0 !important;';
      });
      
      // Forçar main e seus filhos diretos (3 níveis)
      const mains = document.querySelectorAll('main, main > div, main > div > div, main > div > div > div');
      mains.forEach(el => {
        el.style.cssText = 'width: 100% !important; max-width: 100% !important;';
      });
    };

    applyStyles();
    // Reaplica após 100ms para garantir execução
    setTimeout(applyStyles, 100);
    // Reaplica após 500ms para garantir execução após todos componentes montarem
    setTimeout(applyStyles, 500);
  }, []);

  return null;
}