/* IDECO WEB HUB v3.4. Network first for the hub itself, no interfering with linked websites. */
const SHELL_CACHE = 'ideco-web-hub-v3.4';
const HOME = new URL('./index.html', self.registration.scope).href;
self.addEventListener('install', e => {
  // Never let an incorrectly uploaded logo block service worker installation.
  e.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k =>
      (k.startsWith('ideco-web-hub-') || k.startsWith('ideco-mobile-hub-shell-'))
      && k !== SHELL_CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || r.mode !== 'navigate') return;
  const u = new URL(r.url), scope = new URL(self.registration.scope);
  if (u.origin !== scope.origin) return;
  if (u.pathname !== scope.pathname && u.pathname !== new URL('./index.html', scope).pathname) return;
  e.respondWith((async () => {
    try {
      const response = await fetch(r);
      if (response.ok) {
        const copy = response.clone();
        e.waitUntil(caches.open(SHELL_CACHE).then(c => c.put(HOME, copy)).catch(() => {}));
      }
      return response;
    } catch (err) {
      return (await caches.match(HOME)) || Response.error();
    }
  })());
});
