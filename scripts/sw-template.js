const cacheName = "__CACHE_NAME__";
const precache = __PRECACHE__;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(precache)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith("nachoc-") && key !== cacheName).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate" && url.pathname === "/") {
    event.respondWith(caches.open(cacheName).then(async (cache) => (await cache.match("/")) ?? fetch(request)));
    return;
  }

  if (precache.includes(url.pathname)) {
    event.respondWith(caches.open(cacheName).then(async (cache) => (await cache.match(request, { ignoreSearch: true })) ?? fetch(request)));
  }
});
