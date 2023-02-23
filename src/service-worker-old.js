/* eslint-disable no-undef */
const cacheName = 'dawam-pwa';
const cacheFiles = [
  './',
  './index.html',
  './manifest.json',
  './service-worker.js',
  './favicon.ico',
  './logo192.png',
  './logo512.png'
];

this.addEventListener('install', (e) => {
    e.waitUntil(
      caches.open(cacheName).then((cache) => {
        return cache.addAll(cacheFiles);
      })
    );
  });
  
this.addEventListener('fetch', (e) => {
    e.respondWith(
      caches.match(e.request).then((response) => {
        if (response) {
          return response;
        }
  
        const fetchRequest = e.request.clone();
  
        return fetch(fetchRequest).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
  
          const responseToCache = response.clone();
  
          caches.open(cacheName).then((cache) => {
            cache.put(e.request, responseToCache);
          });
  
          return response;
        });
      })
    );
  });

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.0/workbox-sw.js');

if (workbox) {
  console.log(`Workbox is loaded.`);
} else {
  console.log(`Workbox didn't load.`);
}

workbox.core.setCacheNameDetails({
  prefix: 'my-app',
  suffix: 'v1'
});

this.__WB_MANIFEST = [...cacheFiles, './offline.html'];

workbox.precaching.precacheAndRoute(this.__WB_MANIFEST);
