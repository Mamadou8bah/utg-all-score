const VERSION = "utg-allscore-v2";
const APP_SHELL = [
  "/",
  "/live",
  "/fixtures",
  "/results",
  "/standings",
  "/news",
  "/announcements",
  "/events",
  "/teams",
  "/athletes",
  "/offline",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg"
];
const DATA_ENDPOINTS = [
  "/api/live",
  "/api/fixtures",
  "/api/results",
  "/api/news",
  "/api/announcements",
  "/api/events",
  "/api/teams",
  "/api/standings"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(APP_SHELL).catch(() => undefined)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key)))));
  self.clients.claim();
});

const networkFirst = async (request) => {
  const cache = await caches.open(VERSION);
  try {
    const fresh = await fetch(request);
    cache.put(request, fresh.clone());
    return fresh;
  } catch {
    return (await cache.match(request)) || caches.match("/offline");
  }
};

const staleWhileRevalidate = async (request) => {
  const cache = await caches.open(VERSION);
  const cached = await cache.match(request);
  const fetched = fetch(request)
    .then((response) => {
      cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  return cached || fetched || caches.match("/offline");
};

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (DATA_ENDPOINTS.some((path) => url.pathname.startsWith(path))) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request).catch(() => caches.match("/offline")))
  );
});
