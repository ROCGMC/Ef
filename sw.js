// 每次修改 data.js 後，請把此版本號加 1 (例如 v1.1 -> v1.2)
const CACHE_NAME = 'timetable-v2.4';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './data.js',
  './manifest.json'
];

// 1. 安裝階段：強制跳過等待 (Skip Waiting)
// 確保新版 Service Worker 一下載完就立刻接管網頁
self.addEventListener('install', (event) => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('新版資源已寫入快取');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. 激活階段：清理所有舊版本的快取
// 這一步能解決你看到的「舊版畫面（國安局）」問題
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('正在清理舊快取:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // 立即控制所有頁面
  );
});

// 3. 策略：網絡優先 (Network First)
// 這是針對「動態課表」最合適的策略
// 有網路時抓最新的 data.js，沒網路時（在教室）才用快取的課表
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
