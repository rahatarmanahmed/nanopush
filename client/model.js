/* eslint-env browser */
const localforage = require('localforage')
localforage.config({ driver: localforage.INDEXEDDB })

const { urlBase64ToUint8Array } = require('./util')

const serviceWorkerSupported = 'serviceWorker' in navigator
const applicationServerKey = urlBase64ToUint8Array(process.env.applicationServerKey)

const getNotificationPermission = () =>
  'Notification' in window ? window.Notification.permission : 'unsupported'

function fetchNewToken () {
  return fetch('/h/token')
  .then((result) => result.json())
  .then(({ token }) => token)
}

function getToken () {
  return localforage.getItem('token')
  .then(token => {
    if (token) return token

    return fetchNewToken()
  })
}

function saveToken (token) {
  return localforage.setItem('token', token)
}

function unsubscribeToken (token) {
  return fetch(`/h/${token}/unsubscribe`)
  .then(() => localforage.removeItem('token'))
}

module.exports = {
  state: {
    notificationPermission: getNotificationPermission(),
    serviceWorkerSupported
  },
  effects: {
    updateSubscription: (state, { subscription }, send) => {
      return getToken()
      .then(function (token) {
        return saveToken(token)

        .then(() => {
          return fetch(`/h/${token}/subscribe`, {
            method: 'POST',
            body: JSON.stringify(subscription)
          })
        })
        .then(() => {
          return send('setSubscription', { token, subscription })
        })
        .then(() => {
          return send('location:set', `/h/${token}`)
        })
      })
    },

    resetToken: (state, data, send) => {
      if (!state.token) throw new Error('Cannot unsubscribe unless the state has a subscribed token')
      return unsubscribeToken(state.token)
      .then(() => send('updateSubscription', {
        subscription: state.subscription
      }))
    }
  },
  reducers: {
    setSubscription: (state, { token, subscription }) => {
      return Object.assign({}, state, { token, subscription })
    },
    updateNotificationPermission: (state) => {
      return Object.assign({}, state, {
        notificationPermission: getNotificationPermission()
      })
    }
  },
  subscriptions: {
    serviceWorker: (send) => {
      if (serviceWorkerSupported) {
        return navigator.serviceWorker.register('/h/sw.js')
        .then((registration) => {
          return navigator.serviceWorker.ready
          .then(() => registration.pushManager.getSubscription())
          .then((subscription) => {
            if (subscription) {
              return subscription
            }
            return registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey
            })
          })
        })
        .then((subscription) => {
          return Promise.all([
            send('updateNotificationPermission'),
            send('updateSubscription', { subscription })
          ])
        })
        .catch((err) => {
          send('updateNotificationPermission')
          throw err // TODO: handle this better?
        })
      }
    }
  }
}
