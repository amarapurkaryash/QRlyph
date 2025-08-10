
const CACHE_NAME = 'qrlyph-cache-v1';

// A list of essential assets to pre-cache on install.
const PRECACHE_ASSETS = [
  '/',
  '/index.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('QRlyph ServiceWorker: Caching pre-cache assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // We only want to handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // For navigation requests, use a network-first strategy.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // For other requests (CSS, JS, images, fonts), use a cache-first strategy.
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // If we have a response in cache, serve it.
          // In the background, fetch a fresh version and update the cache.
          const fetchPromise = fetch(event.request).then(networkResponse => {
            if (networkResponse.ok) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          }).catch(err => {
              console.log('QRlyph ServiceWorker: fetch failed', err)
          });
          return cachedResponse;
        }

        // If not in cache, fetch from the network.
        return fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.ok) {
            // Clone the response and store it in the cache.
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
  );
});