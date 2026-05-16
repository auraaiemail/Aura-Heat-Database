// SW disabled - clears all caches
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
  // Do NOT send any messages - no banner
});
self.addEventListener('fetch', () => {});
