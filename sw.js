const CACHE_NAME = 'lider1000-v11-live';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icone.png',
  './icon-192.png',
  './icon-512.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(() => {});
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    })
  );
  return self.clients.claim();
});

// ESTRATÉGIA NETWORK-FIRST: Busca sempre o mais recente da internet. Se estiver sem sinal, usa o cache local!
self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('script.google.com')) {
    return;
  }

  // Para navegação / páginas HTML: tenta rede primeiro, se offline usa cache
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request).then((networkResponse) => {
        const resClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, resClone);
        });
        return networkResponse;
      }).catch(() => {
        return caches.match('./index.html') || caches.match('./');
      })
    );
    return;
  }

  // Para outros recursos estáticos: cache com fallback para rede
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(e.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, resClone);
          });
        }
        return networkResponse;
      });
    })
  );
});