const CACHE_NAME = 'dizsan-dmet-v1.0.6';
const ASSETS = [
  './',
  './index.html',
  './mobil.html',
  './style.css',
  './app.js',
  './version.json',
  './manifest.json',
  './dizsan_logo.jpg',
  './icon-192.png',
  './icon-512.png',
  './inc1.jpg',
  './inc2.jpg',
  './inc3.jpg',
  './inc4.jpg',
  './inc5.jpg',
  './inc6.jpg',
  './auto-date-helper.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener('push', (event) => {
  let payload = {
    title: 'D-Met KIRMIZI ALARM: SCANIA KAZA TESPİTİ',
    body: 'Hinterland bölgesinde yeni ağır vasıta kaza haberi tespit edildi.',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: 'demet-alarm',
    data: { url: './index.html' }
  };
  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch (e) {
      payload.body = event.data.text();
    }
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || 'icon-192.png',
      badge: payload.badge || 'icon-192.png',
      vibrate: [300, 100, 300, 100, 400],
      tag: payload.tag || 'demet-alarm',
      requireInteraction: true,
      data: payload.data || { url: './index.html' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || './index.html';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({ type: 'OPEN_INCIDENT', incidentId: event.notification.data?.incidentId });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
