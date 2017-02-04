/* eslint-env serviceworker */
/* global fetch: true */
// TODO: add service worker logging
const localforage = require('localforage')
localforage.config({ driver: localforage.INDEXEDDB })

const { urlBase64ToUint8Array } = require('./util')
const applicationServerKey = urlBase64ToUint8Array(process.env.applicationServerKey)

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

self.addEventListener('pushsubscriptionchange', (e) => {
  e.waitUntil(
    localforage.getItem('token')
    .then((token) => {
      if (!token) throw new Error('Cannot renew subscription without token')

      return self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      })
      .then((subscription) => {
        return fetch(`/${token}/subscribe`, {
          method: 'POST',
          body: JSON.stringify(subscription)
        })
      })
    })
  )
})
