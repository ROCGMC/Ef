const CACHE_NAME = 'edu-timetable-v5.5'; // 每次更新 HTML 後請手動改一下版本號
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  'https://fonts.cdnfonts.com/css/digital-7-mono',
  'https://cdn.jsdelivr.net/npm/nosleep.js@0.12.0/dist/NoSleep.min.js'
];

// 1. 安裝階段：強制跳過等待，立即進入激活狀態
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] 正在預快取資源');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // 強制讓處於 waiting 狀態的 Service Worker 進入 activate 狀態
  self.skipWaiting(); 
});

// 2. 激活階段：清理舊快取，並立即取得頁面控制權
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[SW] 刪除舊快取:', key);
          return caches.delete(key);
        }
      }));
    })
  );
  // 讓新的 SW 立即控制所有開放的客戶端（頁面）
  return self.clients.claim();
});

// 3. 請求攔截：網路優先 (Network First) - 最適合課表這類會變動的資料
// 如果網路可用就抓新的，網路斷了才用快取
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
