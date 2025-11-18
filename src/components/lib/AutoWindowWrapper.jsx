import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAbrirJanela } from './withWindow';

/**
 * 🎯 AUTO WINDOW WRAPPER
 * 
 * Envolve automaticamente qualquer página e a abre como janela
 * Detecta mudanças de rota e abre novas janelas
 */

const PAGE_COMPONENTS = {};

export function AutoWindowWrapper({ children }) {
  const location = useLocation();
  const { abrirJanela } = useAbrirJanela();
  const lastPathRef = React.useRef(null);

  React.useEffect(() => {
    const currentPath = location.pathname;
    
    // Se a rota mudou, abre nova janela
    if (currentPath !== lastPathRef.current && currentPath !== '/') {
      lastPathRef.current = currentPath;
      
      const pathName = currentPath.replace('/', '');
      const title = pathName.charAt(0).toUpperCase() + pathName.slice(1);
      
      // Abre o children atual como janela
      abrirJanela(title, children, {
        width: '90vw',
        height: '85vh',
        canResize: true,
        canMinimize: true,
        canMaximize: true
      });
    }
  }, [location.pathname, children, abrirJanela]);

  // Renderiza apenas o dashboard por padrão
  return location.pathname === '/' ? children : null;
}

/**
 * 🚀 HOOK PARA REGISTRAR COMPONENTES COMO JANELAS
 */
export function useRegistrarJanela(name, component, config = {}) {
  React.useEffect(() => {
    PAGE_COMPONENTS[name] = { component, config };
    
    return () => {
      delete PAGE_COMPONENTS[name];
    };
  }, [name, component, config]);
}

/**
 * 🎨 WRAPPER UNIVERSAL PARA PÁGINAS
 * 
 * Envolve qualquer página e garante:
 * - W-FULL automático
 * - Responsividade
 * - Pode ser aberta como janela ou na tela principal
 */
export function PageWrapper({ children, title, asWindow = false }) {
  const { abrirJanela } = useAbrirJanela();

  React.useEffect(() => {
    if (asWindow) {
      abrirJanela(title, children, {
        width: '90vw',
        height: '85vh'
      });
    }
  }, [asWindow, title, children, abrirJanela]);

  return (
    <div className="w-full max-w-full h-full" style={{ width: '100%', maxWidth: '100%' }}>
      {!asWindow && children}
    </div>
  );
}

export default AutoWindowWrapper;