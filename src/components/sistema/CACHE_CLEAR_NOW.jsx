/**
 * FORCE CACHE CLEAR - V21.2.3
 * This file forces browser to reload all cached files
 */

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}

if ('caches' in window) {
  caches.keys().then(function(names) {
    for (let name of names) {
      caches.delete(name);
    }
  });
}

console.log('🔄 CACHE CLEARED - VERSION 21.2.3');
console.log('✅ Please refresh the page: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)');