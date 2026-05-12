// Aura Heat Energy — Service Worker v3
// Auto-clears old cache on every update — change version number to force refresh

const CACHE_NAME = 'aura-heat-v3'; // ← increment this every time you update
const OFFLINE_URL = 'index.html';

const CACHE_FILES = [
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'logo-banner.png'
];

// Install — cache all files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Aura Heat v3: Installing fresh cache');
      return cache.addAll(CACHE_FILES);
    })
  );
  // Force immediate activation — don't wait for old SW to die
  self.skipWaiting();
});

// Activate — DELETE all old caches immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('Aura Heat: Deleting old cache:', k);
          return caches.delete(k);
        })
      );
    }).then(() => {
      // Take control of all open pages immediately
      return self.clients.claim();
    }).then(() => {
      // Tell all open pages to reload
      return self.clients.matchAll({type: 'window'}).then(clients => {
        clients.forEach(client => {
          console.log('Aura Heat: Refreshing page with new version');
          client.postMessage({type: 'CACHE_UPDATED'});
        });
      });
    })
  );
});

// Fetch — Network first, fallback to cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    // Always try network first — get latest version
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => {
        // Offline fallback — serve cached version
        return caches.match(event.request) || caches.match(OFFLINE_URL);
      })
  );
});
