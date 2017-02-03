/* eslint-env serviceworker */
self.addEventListener('install', (e) => {
  e.waitUntil(self.skipWaiting())
})
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim())
})

self.addEventListener('push', (e) => {
  const notification = e.data.json()
  e.waitUntil(self.registration.showNotification(
    notification.title || 'nanopush',
    notification
  ))
})

// TODO: figure out how to resubscribe on subscription expiration?
