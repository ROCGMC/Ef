const CACHE_NAME = 'edu-timetable-v5.3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  'https://fonts.cdnfonts.com/css/digital-7-mono',
  'https://cdn.jsdelivr.net/npm/nosleep.js@0.12.0/dist/NoSleep.min.js'
];

// 安裝階段：快取必要的資源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching App Shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 激活階段：清理舊版的快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// 攔截請求：優先從快取讀取（Cache First），若無則從網路抓取
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        // 如果是網路請求，順便更新快取（選配）
        return fetchResponse;
      });
    }).catch(() => {
      // 離線且無快取時的保險措施
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
