/* eslint-env serviceworker */
/* global fetch: true */
const localforage = require('localforage')
localforage.config({ driver: localforage.INDEXEDDB })

const { urlBase64ToUint8Array } = require('./util')
const applicationServerKey = urlBase64ToUint8Array(process.env.applicationServerKey)

self.addEventListener('install', (e) => {
  console.log('SW: Installing')
  e.waitUntil(self.skipWaiting())
})
self.addEventListener('activate', (e) => {
  console.log('SW: Activating')
  e.waitUntil(self.clients.claim())
})

self.addEventListener('push', (e) => {
  const notification = e.data.json()
  console.log('SW: Received a push notification', notification)
  e.waitUntil(self.registration.showNotification(
    notification.title || 'nanopush',
    notification
  ))
})

self.addEventListener('pushsubscriptionchange', (e) => {
  console.log('SW: Push subscription lost, attempting to renew')
  e.waitUntil(
    localforage.getItem('token')
    .then((token) => {
      if (!token) throw new Error('Cannot renew subscription without token')

      return self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      })
      .then((subscription) => {
        return fetch(`/h/${token}/subscribe`, {
          method: 'POST',
          body: JSON.stringify(subscription)
        })
      })
    })
  )
})
