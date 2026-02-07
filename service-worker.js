const CACHE_NAME = 'hitman-social-v2.5.5';
const URLS_TO_CACHE = [
  '/',
  '/contract-game.html',
  '/styles.css',
  '/script.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];  

// INSTALL : pré-cache les fichiers critiques
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

// ACTIVATE : nettoyage des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// FETCH : stratégie cache d'abord puis réseau + mise en cache dynamique
self.addEventListener('fetch', event => {
  const request = event.request;

  // Laisser passer les requêtes non GET
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // Fallback optionnel si hors-ligne
          return caches.match('/contract-game.html');
        });
    })
  );
});
