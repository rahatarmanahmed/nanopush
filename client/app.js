const window = require('global/window')
const css = require('sheetify')
const html = require('bel')
const framework = require('./framework')
const { getToken, saveToken, subscribeToken, unsubscribeToken } = require('./api')
const { urlBase64ToUint8Array } = require('./util')

const serviceWorkerSupported = 'serviceWorker' in navigator
const notificationPermission = 'Notification' in window ? window.Notification.permission : 'unsupported'
const applicationServerKey = urlBase64ToUint8Array(process.env.applicationServerKey)

css('tachyons')
css`
  html, body {
    width: 100%;
    height: 100%;
  }

  main {
    width: 100%;
    min-height: 100%;
  }
`
const horizontalFlip = css`
  :host {
    transform: scale(-1, 1);
  }
`

const LoadingView = (state) => {
  let content
  if (state.err) {
    content = html`
      <span>
        Something went wrong...
        <pre class="">${state.err.stack}</pre>
      </span>
    `
  } else if (state.notificationPermission === 'denied') {
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

const Divider = (flip) => {
  var classes = 'nowrap overflow-hidden tc'
  if (flip) classes += ' ' + horizontalFlip
  return html`
    <div class=${classes}>📌📌📌📌📌</div>
  `
}

const MainView = (state, send) => {
  function confirmResetToken (e) {
    e.preventDefault()
    if (window.confirm(`Are you sure you want to reset your token? This is permanent and can't be undone.`)) {
      resetToken(state.token, state.subscription)
    }
  }

  return html`
    <div class="measure">
      <section class="mv4">
        <p class="lh-copy">
          Your push notification URL is:
        </p>
        <div class="code pa2 br2 bg-dark-green light-blue overflow-y-scroll nowrap">
          ${window.location.href}${state.token}/notify
        </div>

        <p class="lh-copy">
          You can receive notifications when you send a request to that URL,
          even when this page isn't open. This URL will stay the same (even if
          you refresh) until you clear your browser data. If you want a new
          token, <a class="link underline hover-light-blue pointer" onclick=${confirmResetToken}>click here</a>.
        </p>
      </section>

      ${Divider(false)}

      <section class="mv4">
        <p class="lh-copy">
          Try it out! Run this command to see if it works
        </p>
        <div class="code pa2 br2 bg-dark-green light-blue">
          curl '${window.location.href}${state.token}/notify?title=nanopush&body=This%20is%20a%20test'
        </div>
      </section>

      ${Divider(true)}

      <section class="mv4">
        <h2 class="f4 fw7 mb2 lh-title">
          API
        </h2>

        <h3 class="code f5 fw7 mt0 mb1 lh-copy">
          GET ${window.location.href}${state.token}/notify
        </h3>
        <p class="ml2 mv1">
          Takes parameters by query string.
        </p>

        <h3 class="code f5 fw7 mt2 mb1 lh-copy">
          POST ${window.location.href}${state.token}/notify
        </h3>
        <p class="ml2 mv1">
          Takes parameters by JSON body.
        </p>

        <h4 class="f5 fw7 mt3 mb1">
          Parameters
        </h4>
        <ul class="list mv1">
          <li>
            <span class="code">title</span>: The title text of the notification.
          </li>
          <li>
            <span class="code">body</span>: The body text of the notification.
          </li>
          <li>
            <span class="code">icon</span>: A URL to an icon for the notification.
          </li>
        </ul>
      </section>
    </div>
  `
}

const AppView = (state, change) => {
  const currentView = state.token ? MainView : LoadingView
  return html`
    <main class="helvetica bg-green washed-blue pa3">
      <h1 class="f3 fw7 mt0 mb3">nanopush 📌</h1>
      <div class="f5">
        <p class="lh-copy measure">nanopush is a tool that sends push notifications. No installation. No registration.</p>
        <div id="root">${currentView(state, change)}</div>
      </div>
      <footer class="f5 fw3 o-60">
        <div class="vh-25"></div>
        <ul class="list pl0">
          <li>Created with 👌 by <a class="link fw5 dim washed-blue" href="http://rahatah.me/d">Rahat Ahmed</a></li>
          <li><a class="link fw5 dim washed-blue" href="https://github.com/rahatarmanahmed/nanopush">Github</a></li>
        </ul>
      </footer>
    </main>
  `
}

const f = framework(AppView)

// initial state
const el = f.start({
  serviceWorkerSupported,
  notificationPermission,
  token: null,
  subscription: null
})
document.body.appendChild(el)

// Set up service worker subscriptions
if (serviceWorkerSupported) {
  navigator.serviceWorker.register('sw.js')
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
    f.change({ notificationPermission: window.Notification.permission })
    return updateSubscription(subscription)
  })
  .catch((err) => {
    if (err.name === 'NotAllowedError') { // Notification permission denied
      f.change({ notificationPermission: window.Notification.permission })
    } else {
      f.change({ err })
    }
  })
}

// effects
const updateSubscription = (subscription) => {
  return getToken()
  .then((token) => {
    return saveToken(token)
    .then(() => subscribeToken(token, subscription))
    .then(() => f.change({ token, subscription }))
  })
}

const resetToken = (token, subscription) => {
  return unsubscribeToken(token)
  .then(() => updateSubscription(subscription))
}
