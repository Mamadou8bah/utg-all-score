const PREFIX = "utg-admin";
const VERSION = `${PREFIX}-${new URLSearchParams(self.location.search || "").get("build") || "v6"}`;
const PUBLIC_DATA = [];

async function cacheShellPage(cache, path) {
  const response = await fetch(path);
  if (!response.ok || response.redirected) return;
  const html = await response.clone().text();
  await cache.put(path, response);
  const assets = new Set([...html.matchAll(/(?:src|href)="(\/_next\/static\/[^"<>]+)"/g)].map((match) => match[1].replaceAll("&amp;", "&")));
  await Promise.all([...assets].map(async (asset) => {
    try {
      if (await cache.match(asset)) return;
      const response = await fetch(asset);
      if (response.ok) await cache.put(asset, response);
    } catch { /* Optional assets can be retried after reconnecting. */ }
  }));
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then(async (cache) => {
    await cacheShellPage(cache, "/offline");
    await Promise.all(["/icons/icon-192.png", "/icons/icon-512.png", "/images/utg-allscore-logo.png"].map(async (path) => {
      const response = await fetch(path);
      if (response.ok) await cache.put(path, response);
    }));
  }));

});
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith(PREFIX) && key !== VERSION).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  const publicData = PUBLIC_DATA.includes(url.pathname) && !request.headers.has("authorization");
  if (url.pathname.startsWith("/api/") && !publicData) return;
  const navigation = request.mode === "navigate";
  // Never mix React Server Component payloads with HTML navigation entries.
  const publicPage = false; // Portal pages contain private data and must stay network-only.
  const asset = url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/images/");
  if (!navigation && !publicData && !asset) return;
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    if (asset) {
      const cached = await cache.match(request);
      if (cached) return cached;
    }
    try {
      const response = await fetch(request);
      if (response.ok && !response.redirected && (publicData || publicPage || asset)) {
        await cache.put(request, response.clone()).catch(() => undefined);
      }
      return response;
    } catch {
      const cached = (publicData || publicPage || asset) ? await cache.match(request) : null;
      if (cached) return cached;
      if (navigation) return (await cache.match("/offline")) || new Response("Offline. Reconnect and try again.", { status: 503, headers: { "Content-Type": "text/plain" } });
      if (publicData) return new Response(JSON.stringify({ error: "Offline and no cached data available." }), { status: 503, headers: { "Content-Type": "application/json" } });
      return Response.error();
    }
  })());
});

// Activate an update only after the user has saved their work and chosen to reload.
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
