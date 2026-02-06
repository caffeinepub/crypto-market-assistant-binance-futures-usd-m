const CACHE_NAME = 'crypto-market-v9-standalone';
const RUNTIME_CACHE = 'crypto-market-runtime-v9';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/generated/app-icon-192.dim_192x192.png',
  '/assets/generated/app-icon-512.dim_512x512.png',
  '/assets/generated/app-icon-maskable.dim_512x512.png',
  '/assets/generated/app-icon.dim_1024x1024.png',
  '/assets/generated/mobile-splash-screen.dim_375x812.png',
  '/assets/generated/desktop-screenshot-1280x720.dim_1280x720.png',
  '/assets/generated/icp-logo-neon-transparent.dim_200x200.png',
  '/assets/generated/bullish-arrow-transparent.dim_64x64.png',
  '/assets/generated/bearish-arrow-transparent.dim_64x64.png',
  '/assets/generated/radar-alert-icon-transparent.dim_64x64.png',
  '/assets/generated/dynamic-alert-icon-transparent.dim_64x64.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW v9] Installing standalone service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        STATIC_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW v9] Failed to cache ${url}:`, err);
          })
        )
      );
    })
  );
});

// Activate event - clean up old caches and ensure critical assets
self.addEventListener('activate', (event) => {
  console.log('[SW v9] Activating standalone service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all([
        ...cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log('[SW v9] Deleting old cache:', name);
            return caches.delete(name);
          }),
        caches.open(CACHE_NAME).then((cache) => {
          // Ensure manifest and critical icons are cached
          return Promise.all([
            cache.match('/manifest.json').then((response) => {
              if (!response) {
                console.warn('[SW v9] Manifest not in cache, adding it now...');
                return cache.add('/manifest.json').catch((err) => {
                  console.error('[SW v9] Failed to cache manifest:', err);
                });
              }
            }),
            cache.match('/assets/generated/app-icon-192.dim_192x192.png').then((response) => {
              if (!response) {
                console.warn('[SW v9] 192x192 icon not in cache, adding it now...');
                return cache.add('/assets/generated/app-icon-192.dim_192x192.png').catch((err) => {
                  console.error('[SW v9] Failed to cache 192x192 icon:', err);
                });
              }
            }),
            cache.match('/assets/generated/app-icon-512.dim_512x512.png').then((response) => {
              if (!response) {
                console.warn('[SW v9] 512x512 icon not in cache, adding it now...');
                return cache.add('/assets/generated/app-icon-512.dim_512x512.png').catch((err) => {
                  console.error('[SW v9] Failed to cache 512x512 icon:', err);
                });
              }
            }),
            cache.match('/assets/generated/app-icon-maskable.dim_512x512.png').then((response) => {
              if (!response) {
                console.warn('[SW v9] Maskable icon not in cache, adding it now...');
                return cache.add('/assets/generated/app-icon-maskable.dim_512x512.png').catch((err) => {
                  console.error('[SW v9] Failed to cache maskable icon:', err);
                });
              }
            })
          ]);
        })
      ]);
    })
  );
  self.clients.claim();
});

// Fetch event - strict asset handling
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests except for API calls
  if (url.origin !== location.origin && !url.pathname.includes('?canisterId=')) {
    return;
  }

  // For JS/CSS/module assets, NEVER return HTML fallback
  const isAsset = /\.(js|css|woff2?|ttf|otf|eot|svg|png|jpg|jpeg|gif|webp|ico)$/i.test(url.pathname);
  const isModule = url.pathname.includes('/assets/') || url.pathname.includes('/@');

  if (isAsset || isModule) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });

          return response;
        }).catch((error) => {
          console.error(`[SW v9] Failed to fetch asset ${url.pathname}:`, error);
          return new Response('Asset not available offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
    );
    return;
  }

  // For manifest.json and icons, cache first with network fallback
  if (url.pathname === '/manifest.json' || url.pathname.includes('/app-icon')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        }).catch((error) => {
          console.error(`[SW v9] Failed to fetch ${url.pathname}:`, error);
          return cachedResponse || new Response('Resource not available', { status: 503 });
        });
      })
    );
    return;
  }

  // For navigation requests (including with query strings like /?tab=...)
  if (request.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put('/', responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match('/').then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return caches.match('/index.html');
          });
        })
    );
    return;
  }

  // For API calls, network first with cache fallback
  if (url.pathname.includes('/api/') || url.pathname.includes('?canisterId=')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Default: cache first with network fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        const responseClone = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseClone);
        });

        return response;
      });
    })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW v9] Received SKIP_WAITING message, activating new service worker...');
    self.skipWaiting();
  }
});

console.log('[SW v9] Standalone service worker loaded');
