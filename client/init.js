/* eslint-env browser */
const serviceWorkerSupported = 'serviceWorker' in navigator
const applicationServerKey = urlBase64ToUint8Array(process.env.applicationServerKey)

const getNotificationPermission = () =>
  'Notification' in window ? window.Notification.permission : 'unsupported'

function urlBase64ToUint8Array (base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
  .replace(/-/g, '+')
  .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

module.exports = {
  state: {
    notificationPermission: getNotificationPermission(),
    serviceWorkerSupported
  },
  effects: {
    updateSubscription: (state, { subscription }, send) => {
      // TODO: figure out how to use unique tokens
      return fetch('/some-unique-token/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription)
      })
      .then(() => {
        return send('setSubscription', { subscription })
      })
    }
  },
  reducers: {
    setSubscription: (state, { subscription }) => {
      return Object.assign({}, state, { subscription })
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
        return navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          return registration.pushManager.getSubscription()
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
            send('updateNotificationPermission', {}),
            send('updateSubscription', { subscription })
          ])
          // TODO: go to the screen for the unique token
        })
        .catch(() => {
          return send('updateNotificationPermission', {})
        })
      }
    }
  }
}
