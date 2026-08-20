// Minimal service worker: makes the app installable and shows an offline
// fallback page on failed navigations. Deliberately does NOT cache API/data
// responses — this app relies on live Supabase auth/data, so serving stale
// cached data would be worse than a clear "you're offline" page.
const CACHE_NAME = 'timesheet-shell-v1'
const OFFLINE_URL = '/offline.html'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_URL, '/icon.svg']))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return

  event.respondWith(
    fetch(event.request).catch(() => caches.match(OFFLINE_URL))
  )
})
