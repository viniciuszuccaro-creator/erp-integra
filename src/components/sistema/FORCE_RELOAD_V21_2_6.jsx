import { useEffect } from 'react';

/**
 * V21.2.6 - FORÇA RELOAD TOTAL DO CACHE
 * Este componente força o navegador a limpar TODOS os caches
 */
export default function ForceReloadV21_2_6() {
  useEffect(() => {
    const VERSION_KEY = 'erp_zuccaro_version';
    const CURRENT_VERSION = 'V21.2.6';
    const storedVersion = localStorage.getItem(VERSION_KEY);

    if (storedVersion !== CURRENT_VERSION) {
      console.log('🔥 FORÇANDO LIMPEZA TOTAL - V21.2.6');
      
      // Limpar TUDO
      localStorage.clear();
      sessionStorage.clear();
      
      // Limpar cache de service workers
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      
      // Desregistrar service workers
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => registration.unregister());
        });
      }
      
      // Salvar nova versão
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      
      // Reload forçado
      setTimeout(() => {
        window.location.reload(true);
      }, 500);
    }
  }, []);

  return null;
}