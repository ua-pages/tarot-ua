const CACHE = 'tarot-ua-v1'

const BASE = self.location.pathname.replace(/\/sw\.js$/, '')

const PRECACHE = [
  BASE + '/',
  BASE + '/css/styles.css',
  BASE + '/js/components/app-root.js',
  BASE + '/js/shared-styles.js',
  BASE + '/js/types.js',
  BASE + '/js/utils.js',
  BASE + '/manifest.json',
  BASE + '/icons/icon.svg',
  BASE + '/icons/favicon-32x32.png',
  BASE + '/icons/favicon-16x16.png',
  BASE + '/icons/apple-touch-icon.png',
  BASE + '/seo/og-default.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(PRECACHE).catch(() => {
        return Promise.all(
          PRECACHE.map((url) =>
            fetch(url).then((r) => {
              if (r.ok) cache.put(url, r)
            }).catch(() => {})
          )
        )
      })
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => {
        if (k !== CACHE) return caches.delete(k)
      }))
    ).then(() => self.clients.claim())
  )
})

function isNavigation(event) {
  return event.request.mode === 'navigate'
}

function isStaticAsset(url) {
  return /\.(css|js|svg|png|jpg|webp|woff2?|json)$/.test(url.pathname) && !url.pathname.endsWith('sw.js')
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  if (url.origin !== self.location.origin) return

  if (isNavigation(event)) {
    event.respondWith(networkFirst(event.request))
    return
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(event.request))
    return
  }

  event.respondWith(networkFirst(event.request))
})

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Offline', { status: 503 })
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    if (request.mode === 'navigate') {
      return caches.match(BASE + '/')
    }
    return new Response('Offline', { status: 503 })
  }
}
