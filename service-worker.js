const CACHE_NAME = 'hitman-social-v2.5.5';
const URLS_TO_CACHE = [
  '/',
  '/contract-game.html',
  '/styles.css',
  '/script.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];  

// Installation : on pré-cache les fichiers critiques
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting(); // optionnel, force l'activation plus rapide
});

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
  self.clients.claim(); // prend le contrôle immédiatement des pages ouvertes
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});

// Interception des requêtes : stratégie cache d'abord, puis réseau
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Ne pas intercepter les requêtes non GET
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        // On met en cache les nouvelles ressources pour les prochains lancements
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // Optionnel : renvoyer une page fallback si hors ligne et pas dans le cache
        return caches.match('./index.html');
      });
    })
  );
});
