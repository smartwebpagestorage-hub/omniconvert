/**
 * OmniConvert Studio - Service Worker (PWA Offline & App Support)
 * Created by Niraj Kumar, Section Supervisor, RO, Faridabad
 */

const CACHE_NAME = 'omniconvert-v3.4';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './css/components.css',
  './assets/icon.png',
  './lib/pdf.min.js',
  './lib/pdf-lib.min.js',
  './lib/jspdf.umd.min.js',
  './lib/jszip.min.js',
  './lib/mammoth.browser.min.js',
  './js/app.js',
  './js/i18n.js'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Precache partial warning:', err);
      });
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
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Network First for HTML, CSS, JS to guarantee latest UI updates immediately
  if (e.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
    e.respondWith(
      fetch(e.request).then((response) => {
        if (response && response.status === 200 && (url.origin === self.location.origin)) {
          const respClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, respClone));
        }
        return response;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache First with network fallback for other static assets
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((response) => {
        if (response && response.status === 200 && (url.origin === self.location.origin)) {
          const respClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, respClone);
          });
        }
        return response;
      });
    }).catch(() => {
      if (e.request.destination === 'document') {
        return caches.match('./index.html');
      }
    })
  );
});
