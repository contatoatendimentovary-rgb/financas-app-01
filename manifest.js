const CACHE_NAME = "financas-cache-v1";
const urlsToCache = ["index.html","app.js","sw.js"];

self.addEventListener("install", e=>{
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache=>cache.addAll(urlsToCache))
    );
});

self.addEventListener("fetch", e=>{
    e.respondWith(
        caches.match(e.request).then(resp => resp || fetch(e.request))
    );
});
