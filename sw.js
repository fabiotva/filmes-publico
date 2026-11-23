// Deixa o app abrir sem internet. A página vem da rede quando dá (pra mostrar a lista nova) e do aparelho quando não dá.
// Os apps pessoal e público dividem o mesmo domínio: cada um só mexe no cache com o próprio prefixo.
const PREFIXO = "filmes-frl-";
const CACHE = PREFIXO + "v2";
const FIXOS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FIXOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith(PREFIXO) && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (!r.ok) return r;
        const copia = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copia)).catch(() => {});
        return r;
      })
      .catch(() => caches.open(CACHE).then((c) => c.match(e.request).then((r) => r || c.match("./index.html"))))
  );
});
