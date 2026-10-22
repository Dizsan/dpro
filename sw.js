// D-Pro Kurumsal Yönetim & DizGün Entegre Platformu - Service Worker (v1.6.5)
const CACHE_NAME = "dizsan-dpro-v1.6.5";
const ASSETS = [
  "./",
  "./index.html",
  "./mobil.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./Dizsan Logo.JPG",
  "./dizsan_logo.jpg",
  "./apps/ziyaret/index.html",
  "./apps/toplanti/index.html",
  "./apps/kredi/index.html",
  "./apps/odeme-takvimi/index.html",
  "./apps/kredi-karti/index.html",
  "./apps/vdf-odeme/index.html",
  "./apps/dikas/index.html",
  "./apps/dmet/index.html",
  "./apps/gunluk-kasa/index.html"
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
    url.includes("api.github.com") ||
    url.includes("raw.githubusercontent.com") ||
    url.includes("/api/") ||
    url.includes("shared_state.json")
  ) {
    return;
  }

  e.respondWith(
    fetch(e.request, { cache: "no-store" })
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200 && e.request.method === "GET") {
          const copy = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
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
