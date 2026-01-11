/* ============================================
   Service Worker для Telegram Mini App "Тапалка"
   ============================================ */

const CACHE_NAME = 'tap-game-v1.0.0';
const RUNTIME_CACHE = 'tap-game-runtime-v1.0.0';

// Ресурсы для кеширования при установке
const STATIC_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/firebase-config.js',
    '/manifest.json',
    '/icon-192x192.png',
    '/icon-512x512.png',
    '/icon-192x192.svg',
    '/icon-512x512.svg'
];

// Стратегия кеширования: Network First для динамических, Cache First для статических
const CACHE_STRATEGY = {
    STATIC: 'cache-first',
    API: 'network-first',
    IMAGES: 'cache-first'
};

/* ============================================
   Установка Service Worker
   ============================================ */
self.addEventListener('install', (event) => {
    console.log('[SW] Установка Service Worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Кеширование статических ресурсов...');
                return cache.addAll(STATIC_CACHE.map(url => new Request(url, { cache: 'reload' })));
            })
            .then(() => {
                console.log('[SW] Service Worker установлен');
                return self.skipWaiting(); // Активация без ожидания
            })
            .catch((error) => {
                console.error('[SW] Ошибка установки:', error);
            })
    );
});

/* ============================================
   Активация Service Worker
   ============================================ */
self.addEventListener('activate', (event) => {
    console.log('[SW] Активация Service Worker...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // Удаляем старые кеши
                        if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                            console.log('[SW] Удаление старого кеша:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Service Worker активирован');
                return self.clients.claim(); // Контроль над всеми страницами
            })
    );
});

/* ============================================
   Обработка запросов (Fetch)
   ============================================ */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Пропускаем не-GET запросы
    if (request.method !== 'GET') {
        return;
    }
    
    // Пропускаем Chrome extensions и другие схемы
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    // Стратегия для разных типов ресурсов
    if (isStaticAsset(url.pathname)) {
        // Статические ресурсы: Cache First
        event.respondWith(cacheFirst(request));
    } else if (isAPIRequest(url.pathname)) {
        // API запросы: Network First с fallback на кеш
        event.respondWith(networkFirst(request));
    } else {
        // HTML страницы: Network First
        event.respondWith(networkFirst(request));
    }
});

/* ============================================
   Проверка типа ресурса
   ============================================ */
function isStaticAsset(pathname) {
    return /\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/.test(pathname);
}

function isAPIRequest(pathname) {
    // Firebase запросы
    return pathname.includes('firestore.googleapis.com') || 
           pathname.includes('firebase.googleapis.com');
}

/* ============================================
   Стратегия Cache First
   ============================================ */
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        
        // Кешируем успешные ответы
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('[SW] Ошибка Cache First:', error);
        
        // Fallback для основных ресурсов
        if (request.url.endsWith('/index.html')) {
            return new Response(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Тапалка - Оффлайн</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            min-height: 100vh;
                            margin: 0;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            text-align: center;
                            padding: 20px;
                        }
                        h1 { font-size: 2rem; margin-bottom: 1rem; }
                        p { font-size: 1.125rem; opacity: 0.9; }
                    </style>
                </head>
                <body>
                    <div>
                        <h1>📴 Оффлайн режим</h1>
                        <p>Проверьте интернет-соединение</p>
                        <p>Приложение работает в ограниченном режиме</p>
                    </div>
                </body>
                </html>
            `, {
                headers: { 'Content-Type': 'text/html' }
            });
        }
        
        throw error;
    }
}

/* ============================================
   Стратегия Network First
   ============================================ */
async function networkFirst(request) {
    try {
        // Пытаемся получить из сети
        const networkResponse = await fetch(request);
        
        // Кешируем успешные ответы
        if (networkResponse.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.warn('[SW] Ошибка сети, пробуем кеш:', error);
        
        // Fallback на кеш
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Если нет в кеше, пробуем index.html (для SPA)
        if (request.mode === 'navigate') {
            const indexResponse = await caches.match('/index.html');
            if (indexResponse) {
                return indexResponse;
            }
        }
        
        throw error;
    }
}

/* ============================================
   Обработка синхронизации в фоне
   ============================================ */
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-game-state') {
        event.waitUntil(syncGameState());
    }
});

async function syncGameState() {
    try {
        // Здесь можно добавить логику синхронизации с Firebase
        console.log('[SW] Синхронизация состояния игры...');
        
        // Уведомление клиентам
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_COMPLETE',
                timestamp: Date.now()
            });
        });
    } catch (error) {
        console.error('[SW] Ошибка синхронизации:', error);
    }
}

/* ============================================
   Обработка сообщений от клиента
   ============================================ */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(CACHE_NAME)
                .then(cache => cache.addAll(event.data.urls))
        );
    }
});

/* ============================================
   Периодическая синхронизация (Background Sync)
   ============================================ */
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncGameState());
    }
});
