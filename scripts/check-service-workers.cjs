const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function worker(app, prefix) {
  const origin = "http://localhost:3000";
  const listeners = {};
  const stores = new Map();
  let network = async () => new Response("ok");
  const key = (request) => new URL(typeof request === "string" ? request : request.url, origin).href;
  const caches = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const entries = stores.get(name);
      return {
        async match(request) { return entries.get(key(request))?.clone(); },
        async put(request, response) { entries.set(key(request), response.clone()); }
      };
    },
    async keys() { return [...stores.keys()]; },
    async delete(name) { return stores.delete(name); }
  };
  const self = {
    location: { origin }, clients: { async claim() {} }, skipWaiting() {},
    addEventListener(name, callback) { listeners[name] = callback; }
  };
  const context = vm.createContext({
    self, caches, URL, URLSearchParams, Response, fetch: (...args) => network(...args), console
  });
  vm.runInContext(fs.readFileSync(`${app}/public/sw.js`, "utf8"), context);
  const version = vm.runInContext("VERSION", context);
  return {
    caches, stores, prefix, version,
    setNetwork(callback) { network = callback; },
    async request(path, mode = "cors", headers = {}) {
      let response;
      listeners.fetch({
        request: { url: new URL(path, origin).href, method: "GET", mode, headers: new Headers(headers) },
        respondWith(promise) { response = promise; }
      });
      return response;
    },
    async activate() {
      let pending;
      listeners.activate({ waitUntil(promise) { pending = promise; } });
      await pending;
    }
  };
}

(async () => {
  const publicApp = worker("frontend", "utg-allscore");
  publicApp.setNetwork(async () => Response.json({ data: [{ id: "match", homeScore: 2 }] }));
  assert.equal((await publicApp.request("/api/live")).status, 200);
  publicApp.setNetwork(async () => new Response("Server failed", { status: 500 }));
  assert.equal((await (await publicApp.request("/api/live")).json()).data[0].homeScore, 2,
    "A server error must not overwrite the last successful score response");
  publicApp.setNetwork(async () => { throw new Error("offline"); });
  assert.equal((await (await publicApp.request("/api/live")).json()).data[0].homeScore, 2);
  const missing = await publicApp.request("/api/athletes");
  assert.equal(missing.status, 503);
  assert.match(missing.headers.get("content-type"), /application\/json/);
  assert.ok((await missing.json()).error, "An uncached API must return JSON, not an offline HTML page");
  assert.equal((await publicApp.request("/images/missing.png")).type, "error");

  for (const [app, prefix] of [["frontend", "utg-allscore"], ["admin-app", "utg-admin"], ["agent-app", "utg-agent"]]) {
    const instance = worker(app, prefix);
    assert.equal(await instance.request("/news?_rsc=payload"), undefined, "RSC responses must not enter navigation caches");
    assert.equal(await instance.request("/api/auth/me"), undefined, "Authentication requests must bypass caches");
    assert.equal(await instance.request("/api/portal/matches", "cors", { authorization: "Bearer test" }), undefined);
    await instance.caches.open(`${prefix}-v1`);
    await instance.caches.open("another-app-v1");
    await instance.activate();
    assert.equal(instance.stores.has(`${prefix}-v1`), false);
    assert.equal(instance.stores.has("another-app-v1"), true, "Activation must not delete another app's caches");
    await instance.request("/icons/icon-192.png");
    const current = [...instance.stores.keys()].find((name) => name.startsWith(prefix));
    const cache = await instance.caches.open(current || `${prefix}-v5`);
    await cache.put("/offline", new Response("Offline screen"));
    instance.setNetwork(async () => { throw new Error("offline"); });
    assert.equal(await (await instance.request("/more", "navigate")).text(), "Offline screen");
  }
  console.log("PASS: all three service workers; score fallback, JSON errors, offline navigation, RSC/auth bypass, and cache isolation.");
})().catch((error) => { console.error(error); process.exitCode = 1; });
