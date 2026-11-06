/* IDECO WEB HUB v3.5 — service worker (mẫu cấu trúc HUYỀN TRỢ LÝ).
   Network first: code/app/icon updates propagate from GitHub Pages.
   Only the HUB shell is intercepted; embedded external apps, ERP, Firebase, APIs remain untouched. */
const CACHE = 'ideco-web-hub-v3.5';
const ROOT = new URL('./', self.registration.scope);
const FILES = ['./', './index.html', './manifest.json', './icon-192.png',
  './icon-512.png', './icon-maskable-192.png', './icon-maskable-512.png',
  './apple-touch-icon.png', './favicon-48.png'];
const HOME = new URL('./index.html', ROOT).href;
const KNOWN = new Set(FILES.map(path => new URL(path, ROOT).href));
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache =>
    Promise.allSettled(FILES.map(path => cache.add(new URL(path, ROOT).href)))).then(() => {}));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => (key.startsWith('ideco-web-hub-') || key.startsWith('ideco-mobile-hub-shell-')) && key !== CACHE)
    .map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request=event.request;
  if (request.method !== 'GET') return;
  const url=new URL(request.url);
  if (url.origin !== ROOT.origin) return;
  // Only our own entry point and declared shell assets, never other sites or app URLs.
  const bare=url.origin+url.pathname;
  if (!KNOWN.has(bare)) return;
  const cleanRequest=new Request(bare,{credentials:'same-origin'});
  event.respondWith(fetch(request).then(response => {
    if (response && response.ok) {
      const copy=response.clone();
      event.waitUntil(caches.open(CACHE).then(cache=>cache.put(cleanRequest,copy)).catch(()=>{}));
    }
    return response;
  }).catch(async () => {
    const cache=await caches.open(CACHE);
    return (await cache.match(cleanRequest)) ||
      ((bare===ROOT.href || bare===HOME) ? await cache.match(HOME) : undefined) ||
      Response.error();
  }));
});
