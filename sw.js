// Aura Heat Energy — Service Worker
// Enables offline support and PWA installation

const CACHE_NAME = 'aura-heat-v1';
const OFFLINE_URL = 'index.html';

// Files to cache for offline use
const CACHE_FILES = [
  'index.html',
  'manifest.json'
];

// Install — cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Aura Heat: Caching files for offline use');
      return cache.addAll(CACHE_FILES);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch — serve from cache when offline, network when online
self.addEventListener('fetch', event => {
  // Skip non-GET and external requests
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => {
        // Offline fallback
        return caches.match(event.request) || caches.match(OFFLINE_URL);
      })
  );
});
