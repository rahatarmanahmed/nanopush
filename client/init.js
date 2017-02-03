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

function getToken () {
  return Promise.resolve(localStorage.token)
  .then(token => {
    if (token) return token

    return fetch('/token')
    .then((result) => result.json())
    .then(({ token }) => token)
  })
}

function saveToken (token) {
  localStorage.token = token
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
        saveToken(token)

        return fetch(`/${token}/subscribe`, {
          method: 'POST',
          body: JSON.stringify(subscription)
        })
        .then(() => {
          return send('setSubscription', { token, subscription })
        })
        .then(() => {
          return send('location:set', `/${token}`)
        })
      })
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
        return navigator.serviceWorker.register('/sw.js')
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
