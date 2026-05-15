/* ═══════════════════════════════════════════════════════
   Chamundeeswari Publications — Service Worker
   sw.js  ·  Shell cache + runtime cache for offline reading
═══════════════════════════════════════════════════════ */

const SHELL_VERSION = 'v1';
const SHELL_CACHE   = 'cp-shell-' + SHELL_VERSION;
const RUNTIME_CACHE = 'cp-runtime-v1';

const SHELL_ASSETS = [
    './',
    './index.html',
    './about.html',
    './assets/css/shared.css',
    './assets/css/dashboard.css',
    './assets/css/viewer.css',
    './assets/css/about.css',
    './assets/js/theme.js',
    './assets/js/app.js',
    './assets/js/dashboard.js',
    './assets/js/viewer.js',
    './assets/audio/page-turn.mp3',
    './books/catalog.json',
    './manifest.json',
];

/* ── Install: pre-cache shell ──────────────────────────── */
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(SHELL_CACHE)
            .then(c => c.addAll(SHELL_ASSETS))
            .then(() => self.skipWaiting())
    );
});

/* ── Activate: clean up old caches ────────────────────── */
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(k => k !== SHELL_CACHE && k !== RUNTIME_CACHE)
                    .map(k => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

/* ── Fetch ─────────────────────────────────────────────── */
self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;

    const url = new URL(e.request.url);

    // CDN resources (pdf.js, page-flip, fonts) — network-first, cache as fallback
    if (url.hostname !== self.location.hostname) {
        e.respondWith(
            fetch(e.request)
                .then(res => {
                    caches.open(RUNTIME_CACHE).then(c => c.put(e.request, res.clone()));
                    return res;
                })
                .catch(() => caches.match(e.request))
        );
        return;
    }

    // PDFs and cover images — cache-first (large; user opened the book)
    if (/\/books\/.+\.(pdf|png|jpg|jpeg|webp)$/i.test(url.pathname)) {
        e.respondWith(
            caches.match(e.request).then(cached => {
                if (cached) return cached;
                return fetch(e.request).then(res => {
                    caches.open(RUNTIME_CACHE).then(c => c.put(e.request, res.clone()));
                    return res;
                });
            })
        );
        return;
    }

    // Shell assets — cache-first, revalidate in background
    e.respondWith(
        caches.match(e.request).then(cached => {
            const networkFetch = fetch(e.request).then(res => {
                caches.open(SHELL_CACHE).then(c => c.put(e.request, res.clone()));
                return res;
            });
            return cached || networkFetch;
        })
    );
});
