/* eslint-env serviceworker */
self.addEventListener('install', (e) => {
  self.skipWaiting()
})

self.addEventListener('push', (event) => {
  const notification = event.data.json()
  event.waitUntil(self.registration.showNotification(
    notification.title || 'nanopush',
    notification
  ))
})

// TODO: figure out how to resubscribe on subscription expiration?
