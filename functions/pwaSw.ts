import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Service Worker script responder (same-origin). Registers as /functions/pwaSw
// Returns JS with basic offline caching (app shell) + SW lifecycle helpers.
Deno.serve(async (req) => {
  try {
    // Allow HEAD for liveness checks
    if (req.method === 'HEAD') {
      return new Response(null, { status: 200, headers: { 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload' } });
    }

    const url = new URL(req.url);
    // Only serve JS for GET
    if (req.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const swCode = `
      const CACHE_NAME = 'zuccaro-app-cache-v1';
      const APP_SHELL = ['/', '/index.html'];

      self.addEventListener('install', (event) => {
        event.waitUntil(
          caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
        );
      });

      self.addEventListener('activate', (event) => {
        event.waitUntil(
          caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim())
        );
      });

      // Network-first for navigation; cache-first for same-origin static assets
      self.addEventListener('fetch', (event) => {
        const req = event.request;
        const url = new URL(req.url);
        const isSameOrigin = url.origin === self.location.origin;
        const isNavigation = req.mode === 'navigate';

        if (isNavigation) {
          event.respondWith(
            fetch(req).then((res) => {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put('/', copy)).catch(()=>{});
              return res;
            }).catch(() => caches.match('/') || caches.match('/index.html'))
          );
          return;
        }

        if (isSameOrigin && (url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.endsWith('.png') || url.pathname.endsWith('.svg') || url.pathname.endsWith('.jpg') || url.pathname.endsWith('.jpeg') || url.pathname.endsWith('.woff2'))) {
          event.respondWith(
            caches.match(req).then((hit) => hit || fetch(req).then((res) => {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(()=>{});
              return res;
            }))
          );
          return;
        }
      });

      // Support immediate activation
      self.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SKIP_WAITING') {
          self.skipWaiting();
        }
      });
    `;

    return new Response(swCode, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'no-store',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      },
    });
  } catch (error) {
    return new Response(`/* SW error: ${error?.message || error} */`, { status: 500, headers: { 'Content-Type': 'application/javascript', 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload' } });
  }
});