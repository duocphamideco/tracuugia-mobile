/* Tăng VERSION khi thay đổi các tệp PWA. Không lưu dữ liệu giá hay HTML ứng dụng. */
const VERSION = 'v2';
const PREFIX = 'ideco-tracuugia-pwa-';
const CACHE = PREFIX + VERSION;
const base = self.registration.scope;
const offline = new URL('offline.html', base).href;
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll([
    offline, new URL('icons/icon-192.png', base).href,
    new URL('icons/icon-512.png', base).href
  ])));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith(PREFIX) && key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || request.mode !== 'navigate' || !request.url.startsWith(base)) return;
  event.respondWith(fetch(request).catch(async () => {
    return (await caches.match(offline)) || new Response('Vui lòng kết nối mạng.', {
      status: 503, headers: {'Content-Type':'text/plain; charset=utf-8'}
    });
  }));
});
