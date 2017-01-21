var html = require('choo/html')
var css = require('sheetify')
var choo = require('choo')
var promisifyPlugin = require('barracks-promisify-plugin')

css('tachyons')
css`
  html, body, main {
    width: 100%;
    height: 100%;
  }
`

var app = choo()
app.use(promisifyPlugin())

app.model(require('./init'))

app.router([
  ['/', main]
])

const tree = app.start()
document.body.appendChild(tree)

function main (state, prev, send) {
  let content
  if (state.notificationPermission === 'denied') {
    content = html`
      <p class="lh-copy">
        Seems like you denied the request to show notifications. You're gonna
        have to reset that if you want to use this app.
      </p>
    `
  } else if (state.notificationPermission === 'unsupported' || !state.serviceWorkerSupported) {
    content = html`
      <p class="lh-copy">
        Your browser doesn't support web push notifications. Write to your local
        representative, or use something like Chrome or Firefox.
      </p>
    `
  } else if (state.notificationPermission === 'default') {
    content = html`
      <p class="lh-copy">
        We'll get started once you accept the request to show notifications.
      </p>
    `
  } else {
    content = html`
      <p class="lh-copy">
        Registering web push notifications...
      </p>
    `
  }
  return html`
    <main class="helvetica bg-green washed-blue pa3">
      <h1 class="f5 fw7 mt0 mb3">nanopush</h1>
      <div class="measure-narrow">
        ${content}
      </div>
      <pre>
        ${JSON.stringify(state, null, '    ')}
      </pre>
    </main>
  `
}
