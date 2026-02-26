// 每次你修改 data.js 或 index.html 後，請把 v1 改成 v2, v3...
const CACHE_NAME = 'school-timetable-v2';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './data.js',
  './manifest.json',
  // 如果你有放小圖示 icon.png，也請加在這裡
];

// 1. 安裝：將檔案存入手機快取
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('課表資源已快取');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // 強制跳過等待，立即啟用新版
});

// 2. 激活：刪除舊版本的快取，釋放空間
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('清理舊版快取:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// 3. 攔截請求：沒網路時也能讀取課表
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 優先使用快取，如果快取沒有則連網抓取
      return response || fetch(event.request);
    })
  );
});
