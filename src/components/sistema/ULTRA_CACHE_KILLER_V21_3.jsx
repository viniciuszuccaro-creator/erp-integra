import { useEffect } from 'react';

/**
 * 🔥 ULTRA CACHE KILLER V21.3
 * FORÇA LIMPEZA ABSOLUTA E RELOAD AUTOMÁTICO
 */
export default function UltraCacheKillerV21_3() {
  useEffect(() => {
    const executarLimpezaTotal = async () => {
      console.log('🔥🔥🔥 ULTRA CACHE KILLER ATIVADO - V21.3');
      
      // 1. Limpar TODOS os storages
      try { localStorage.clear(); } catch(e) { console.log('localStorage clear error:', e); }
      try { sessionStorage.clear(); } catch(e) { console.log('sessionStorage clear error:', e); }
      
      // 2. Limpar TODOS os caches do navegador
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
          console.log('✅ Todos os caches limpos:', cacheNames.length);
        } catch(e) { console.log('caches error:', e); }
      }
      
      // 3. Desregistrar TODOS os service workers
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map(reg => reg.unregister()));
          console.log('✅ Service Workers removidos:', registrations.length);
        } catch(e) { console.log('service worker error:', e); }
      }
      
      // 4. Limpar cookies relacionados ao app
      document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // 5. Marcar versão V21.3
      localStorage.setItem('erp_zuccaro_version', 'V21.3_ULTRA_CLEAN');
      localStorage.setItem('cache_limpo_em', new Date().toISOString());
      
      // 6. Forçar reload HARD
      console.log('🔄 Recarregando aplicação...');
      setTimeout(() => {
        window.location.href = window.location.href.split('?')[0] + '?v=' + Date.now();
      }, 300);
    };
    
    // Verificar se já rodou
    const jaRodou = localStorage.getItem('erp_zuccaro_version');
    if (jaRodou !== 'V21.3_ULTRA_CLEAN') {
      executarLimpezaTotal();
    }
  }, []);

  return null;
}