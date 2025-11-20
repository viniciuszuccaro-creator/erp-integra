import { useEffect } from 'react';

/**
 * 🔥🔥🔥 ULTRA CACHE KILLER V21.3 FINAL - ABSOLUTO 🔥🔥🔥
 * LIMPEZA TOTAL + RELOAD AGRESSIVO
 */
export default function UltraCacheKillerV21_3() {
  useEffect(() => {
    const FORCE_VERSION = 'V21.3.2_ABSOLUTE_FINAL';
    const currentVersion = localStorage.getItem('erp_absolute_version');
    
    if (currentVersion !== FORCE_VERSION) {
      console.log('🔥🔥🔥 ULTRA CACHE KILLER V21.3.2 ATIVADO - LIMPEZA ABSOLUTA!');
      
      // 1. LIMPAR TUDO
      try { localStorage.clear(); } catch(e) {}
      try { sessionStorage.clear(); } catch(e) {}
      
      // 2. LIMPAR TODOS OS CACHES
      if ('caches' in window) {
        caches.keys().then(names => {
          Promise.all(names.map(name => caches.delete(name))).then(() => {
            console.log('✅ Caches deletados:', names.length);
          });
        });
      }
      
      // 3. DESREGISTRAR SERVICE WORKERS
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
          regs.forEach(reg => reg.unregister());
        });
      }
      
      // 4. LIMPAR COOKIES
      document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // 5. MARCAR VERSÃO
      localStorage.setItem('erp_absolute_version', FORCE_VERSION);
      
      // 6. RELOAD HARD COM TIMESTAMP
      console.log('🔄 FORÇANDO RELOAD ABSOLUTO...');
      setTimeout(() => {
        // Adiciona timestamp único para forçar bypass de QUALQUER cache
        const url = new URL(window.location.href);
        url.searchParams.set('v', Date.now());
        url.searchParams.set('nocache', '1');
        window.location.href = url.toString();
      }, 100);
    }
  }, []);

  return null;
}