const CACHE_NAME = 'hitman-social-v1';
const ASSETS_TO_CACHE = [
    '/hitman-social/',
    '/hitman-social/contract-game.html',
    '/hitman-social/manifest.webmanifest',
    '/hitman-social/icon-192.png',
    '/hitman-social/icon-512.png'
  ];  

// Installation : on pré-cache les fichiers critiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activation : nettoyage des anciens caches si besoin
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
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
        return caches.match('./contract-game.html');
      });
    })
  );
});
