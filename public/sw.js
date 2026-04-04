const CACHE_NAME = "sgm-pwa-v1";
const APP_SHELL = ["/", "/checkout", "/offline", "/manifest.webmanifest", "/app-icons/icon-192.png", "/app-icons/icon-512.png", "/app-icons/apple-touch-icon.png", "/branding/logo.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const cachedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cachedResponse));
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);
          return cachedPage || caches.match("/offline");
        }),
    );
    return;
  }

  if (["image", "style", "script", "font"].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then(
        (cachedResponse) =>
          cachedResponse ||
          fetch(request).then((response) => {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clonedResponse));
            return response;
          }),
      ),
    );
  }
});
