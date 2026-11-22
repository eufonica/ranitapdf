// ranitapdf: funciona sin conexión y se actualiza solo cuando hay internet.
const CACHE = 'ranitapdf-v12';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'pdf.min.js', 'pdf.worker.min.js', 'pdf-lib.min.js', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f => fetch(new Request(f, {cache: 'reload'})).then(r => r.ok ? c.put(f, r) : null).catch(() => null)))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin) return;
  const fresh = req.mode === 'navigate' || /(\/|index\.html|manifest\.webmanifest)$/.test(url.pathname);
  if (fresh) {
    e.respondWith(fetch(req, {cache: 'no-cache'}).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; }).catch(() => caches.match(req).then(h => h || caches.match('index.html'))));
  } else {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; })));
  }
});
