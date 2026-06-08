// Service worker mínimo: torna a PWA instalável e dá um cache offline básico
// (network-first, com fallback para cache). O conteúdo é estático, por isso
// isto chega para abrir as aulas já vistas sem ligação.
const CACHE = "estudos-v1";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  e.respondWith(
    fetch(request)
      .then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
        return resp;
      })
      .catch(() => caches.match(request).then((r) => r || caches.match("/")))
  );
});
