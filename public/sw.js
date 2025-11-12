const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll([
      '/',
      '/index.html',
      '/manifest.webmanifest'
    ]))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((key) => {
      if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) return caches.delete(key);
    })))
  );
  self.clients.claim();
});

function networkFirst(request) {
  return fetch(request).then((res) => {
    const copy = res.clone();
    caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, copy));
    return res;
  }).catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html')));
}

function cacheFirst(request) {
  return caches.match(request).then((cached) => {
    if (cached) return cached;
    return fetch(request).then((res) => {
      const copy = res.clone();
      caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
      return res;
    });
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(req));
    return;
  }
  const dest = req.destination;
  if (dest === 'style' || dest === 'script' || dest === 'image' || dest === 'font') {
    event.respondWith(cacheFirst(req));
    return;
  }
});

