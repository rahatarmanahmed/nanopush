/* eslint-env serviceworker */
self.addEventListener('install', (e) => {
  self.skipWaiting()
})

self.addEventListener('push', (event) => {
  const body = event.data.text()
  event.waitUntil(self.registration.showNotification('nanopush', { body }))
})

// TODO: figure out how to resubscribe on subscription expiration?
