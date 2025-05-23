const CACHE_NAME = "notes-cache-v1";
const URLS = [
  "/",
  "/index.html",
  "/css/styles.css",
  "/js/app.js",
  "/manifest.json",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png",
];

self.addEventListener("install", (e) =>
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((c) => c.addAll(URLS))
      .then(() => self.skipWaiting())
  )
);

self.addEventListener("activate", (e) =>
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
  )
);

self.addEventListener("fetch", (e) =>
  e.respondWith(
    caches
      .match(e.request)
      .then((r) => r || fetch(e.request))
      .catch(
        () =>
          e.request.headers.get("accept").includes("text/html") &&
          caches.match("/index.html")
      )
  )
);
