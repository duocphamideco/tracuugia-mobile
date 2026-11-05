/* IDECO Mobile Hub v3.3: only cache this app shell, never ERP/other websites or dynamic data. */
const CACHE_NAME = 'ideco-mobile-hub-shell-v3.3';
const APP_SHELL = [
  './index.html',
  './manifest-ideco-webhub-v3.3.webmanifest',
  './apple-touch-ideco-webhub-v3.3.png',
  './icons/ideco-webhub-192-v3.3.png',
  './icons/ideco-webhub-512-v3.3.png',
  './icons/ideco-webhub-maskable-192-v3.3.png',
  './icons/ideco-webhub-maskable-512-v3.3.png',
  './icons/ideco-webhub-ios-180-v3.3.png'
];
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(name => name.startsWith('ideco-mobile-hub-shell-') && name !== CACHE_NAME)
        .map(name => caches.delete(name))
    )).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || request.mode !== 'navigate') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const scopeUrl = new URL(self.registration.scope);
  if (url.pathname !== scopeUrl.pathname && url.pathname !== scopeUrl.pathname + 'index.html') return;
  event.respondWith(
    fetch(request).catch(async () => {
      const cache = await caches.open(CACHE_NAME);
      const saved = await cache.match('./index.html');
      return saved || Response.error();
    })
  );
});
