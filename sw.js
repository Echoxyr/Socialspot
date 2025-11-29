/*
 * sw.js
 * Service Worker per SocialSpot. Implementa caching delle risorse statiche e gestisce le notifiche push.
 */

const CACHE_NAME = 'socialspot-cache-v2';
const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/components.js',
    '/sw.js',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png',
    '/favicon.ico'
];

// Installazione: pre-caching delle risorse essenziali
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
    );
    self.skipWaiting();
});

// Attivazione: pulizia vecchie cache
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => Promise.all(
            cacheNames.map((cacheName) => {
                if (cacheName !== CACHE_NAME) {
                    return caches.delete(cacheName);
                }
            })
        ))
    );
    self.clients.claim();
});

// Strategia cache-first con fallback in rete
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((resp) => {
                if (event.request.method === 'GET' && resp.status === 200 && resp.type === 'basic') {
                    const respClone = resp.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, respClone);
                    });
                }
                return resp;
            });
        })
    );
});

// Gestione notifiche push: responsabilita del server inviare payload idonei.
self.addEventListener('push', (event) => {
    let data = { title: 'SocialSpot', body: 'Hai una nuova notifica' };
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            // fallback a stringa
            data.body = event.data.text();
        }
    }
    const options = {
        body: data.body,
        icon: '/favicon.ico',
        vibrate: [100, 50, 100],
        data: { dateOfArrival: Date.now(), primaryKey: 1 }
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
});
