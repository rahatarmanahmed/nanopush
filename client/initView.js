const html = require('choo/html')

module.exports = (state, prev, send) => {
  let content
  if (state.notificationPermission === 'denied') {
    content = `Seems like you denied the request to show notifications. You're gonna have to reset that if you want to use this app.`
  } else if (state.notificationPermission === 'unsupported' || !state.serviceWorkerSupported) {
    content = `Your browser doesn't support web push notifications. Write to your local representative, or use something like Chrome or Firefox.`
  } else if (state.notificationPermission === 'default') {
    content = `We'll get started once you accept the request to show notifications.`
  } else if (!state.token) {
    content = `Registering web push notifications...`
  } else {
    content = 'Something went wrong... sorry.'
  }
  return html`
    <p class="lh-copy o-60 measure">${content}</p>
  `
}
