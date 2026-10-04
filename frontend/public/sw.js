const PREFIX = "utg-allscore";
const VERSION = `${PREFIX}-${new URLSearchParams(self.location.search || "").get("build") || "v6"}`;
const APP_SHELL = ["/", "/live", "/fixtures", "/results", "/standings", "/news", "/more", "/announcements", "/events", "/teams", "/athletes", "/offline", "/icons/icon-192.png", "/icons/icon-512.png", "/images/utg-allscore-logo.png", "/images/football.png"];
const DATA_ENDPOINTS = ["/api/live", "/api/fixtures", "/api/results", "/api/news", "/api/announcements", "/api/events", "/api/teams", "/api/standings", "/api/competitions", "/api/athletes"];


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
  event.waitUntil(caches.open(VERSION).then((cache) => Promise.all(APP_SHELL.map(async (path) => {
    try {
      if (!path.startsWith("/icons/") && !path.startsWith("/images/")) await cacheShellPage(cache, path);
      else {
        const response = await fetch(path);
        if (response.ok) await cache.put(path, response);
      }
    } catch { /* The remaining shell entries can still be cached. */ }
  }))));

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
  const data = DATA_ENDPOINTS.includes(url.pathname) && !request.headers.has("authorization");
  if (url.pathname.startsWith("/api/") && !data) return;
  const navigation = request.mode === "navigate";
  const publicPage = navigation && !["/admin", "/login"].some((path) => url.pathname.startsWith(path));
  const asset = url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/images/");
  // Do not cache Next.js RSC responses as HTML or intercept authenticated requests.
  if (!navigation && !data && !asset) return;
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    if (asset) {
      const cached = await cache.match(request);
      if (cached) return cached;
    }
    try {
      const response = await fetch(request);
      if (response.ok && !response.redirected && (data || publicPage || asset)) await cache.put(request, response.clone()).catch(() => undefined);
      if (!response.ok && data) return (await cache.match(request)) || response;
      return response;
    } catch {
      const cached = (data || publicPage || asset) ? await cache.match(request) : null;
      if (cached) return cached;
      if (navigation) return (await cache.match("/offline")) || new Response("Offline. Reconnect and try again.", { status: 503, headers: { "Content-Type": "text/plain" } });
      if (data) return new Response(JSON.stringify({ error: "Offline and no cached data available." }), { status: 503, headers: { "Content-Type": "application/json" } });
      return Response.error();
    }
  })());
});

self.addEventListener("push", (event) => {
  let data = { title: "UTG AllScore", body: "New update", url: "/", tag: "utg-allscore" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    /* ignore malformed payload */
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "UTG AllScore", {
      body: data.body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: data.tag || "utg-allscore",
      data: { url: data.url || "/" }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client && client.url.includes(self.location.origin)) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
      return undefined;
    })
  );
});

// Activate an update only after the user has saved their work and chosen to reload.
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
