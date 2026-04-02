const CACHE_NAME = 'edgar-ide-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.png',
  'https://cdn.tailwindcss.com'
];

// 1. Dateien beim ersten Start im Handy-Speicher ablegen
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// 2. Anfragen abfangen und Dateien direkt vom Handy laden (Offline-Modus)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Wenn die Datei im Cache ist, nimm sie. Sonst lade sie aus dem Internet.
      return response || fetch(event.request);
    })
  );
});
