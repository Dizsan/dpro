// D-Pro Kurumsal Yönetim & DizGün Entegre Platformu - Service Worker (v1.8.1)
const CACHE_NAME = 'dizsan-dpro-v4.9.5';
const ASSETS = [
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./Dizsan Logo.JPG",
  "./dizsan_logo.jpg"
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(() => {}))
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = e.request.url;
  if (
    e.request.method !== "GET" ||
    url.includes("api.github.com") ||
    url.includes("raw.githubusercontent.com") ||
    url.includes("/api/") ||
    url.includes("shared_state.json") ||
    url.includes("customer_database.json")
  ) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const copy = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy)).catch(() => {});
        }
        return networkRes;
      })
      .catch(() =>
        caches.match(e.request).then((cachedRes) => {
          if (cachedRes) return cachedRes;
          if (e.request.destination === "document") {
            return caches.match("./index.html");
          }
        })
      )
  );
});
