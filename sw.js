// Aura Heat Energy — Service Worker v7
const CACHE = 'aura-heat-v7';
const FILES = ['index.html','manifest.json','icon-192.png','icon-512.png'];

self.addEventListener('install', ev => {
  ev.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({type:'window'}).then(clients => {
        clients.forEach(c => c.postMessage({type:'CACHE_UPDATED'}));
      }))
  );
});

// Handle SKIP_WAITING message from app
self.addEventListener('message', ev => {
  if(ev.data && ev.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', ev => {
  if(ev.request.method !== 'GET') return;
  if(!ev.request.url.startsWith(self.location.origin)) return;
  ev.respondWith(
    fetch(ev.request)
      .then(res => {
        if(res && res.status === 200){
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(ev.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(ev.request) || caches.match('index.html'))
  );
});
