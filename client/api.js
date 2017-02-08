/* eslint-env browser */
const localforage = require('localforage')
localforage.config({ driver: localforage.INDEXEDDB })

function fetchNewToken () {
  return fetch('token')
  .then((result) => result.json())
  .then(({ token }) => token)
}

module.exports = {
  getToken: () => {
    return localforage.getItem('token')
    .then(token => {
      if (token) return token

      return fetchNewToken()
    })
  },

  saveToken: (token) => localforage.setItem('token', token),

  subscribeToken: (token, subscription) => {
    return fetch(`${token}/subscribe`, {
      method: 'POST',
      body: JSON.stringify(subscription)
    })
  },

  unsubscribeToken: (token) => {
    return fetch(`${token}/unsubscribe`)
    .then(() => localforage.removeItem('token'))
  }
}
