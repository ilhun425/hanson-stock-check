// 스펙북 재고 대조 — 오프라인 캐시. 파일을 고치면 VERSION을 올려 주세요.
const VERSION = 'v2026.10.27-3';
const FILES = ['./', 'index.html', 'xlsx.full.min.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// 앱 파일은 새 버전을 먼저 받아 보고, 인터넷이 없으면 저장해 둔 것을 씁니다.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // 자동 재고 파일은 항상 새로 받음 (저장하지 않음)
  if (url.hostname === 'raw.githubusercontent.com' || url.pathname.includes('/data/')) return;
  if (url.origin !== location.origin) {
    if (!/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) return;
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; }).catch(() => new Response('', { status: 504 }))));
    return;
  }
  e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; })
    .catch(() => caches.match(req).then((hit) => hit || caches.match('index.html'))));
});
