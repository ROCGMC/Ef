const CACHE_NAME = 'timetable-v1';
const ASSETS = [
  'index.html',
  'manifest.json',
  // 如果你有放圖示或 CSS 檔案，也要加在這裡
];

// 安裝階段：快取資源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('正在預載入課表資源...');
      return cache.addAll(ASSETS);
    })
  );
});

// 激活階段：清理舊快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// 攔截請求：優先使用快取
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
