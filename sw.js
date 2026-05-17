// Force kill all caches
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({type:'window'}).then(clients => {
        clients.forEach(c => c.navigate(c.url));
      }))
  );
});
self.addEventListener('fetch', ev => {
  ev.respondWith(fetch(ev.request).catch(() => caches.match(ev.request)));
});
