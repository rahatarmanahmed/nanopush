const yo = require('yo-yo')
const css = require('sheetify')
const barracks = require('barracks')
const chooPromise = require('choo-promise')

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

const store = barracks()
store.use(chooPromise())
store.use({ onStateChange: render })
store.model(require('./model'))

const initView = require('./initView')
const mainView = require('./mainView')

const App = (state, send) => {
  var view = state.token ? mainView : initView
  return yo`
    <main class="helvetica bg-green washed-blue pa3">
      <h1 class="f3 fw7 mt0 mb3">nanopush 📌</h1>
      <div class="f5">
        <p class="lh-copy measure">nanopush is a tool that sends push notifications. No installation. No registration.</p>
        <div id="root">${view(state, send)}</div>
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

const createSend = store.start()
const _send = createSend('nanopush')
const send = (action, data) => _send(action, data, (err) => {
  // TODO: do something better with the errors
  if (err) console.error(err)
})

const el = App(store.state(), send)
document.body.appendChild(el)

function render (state) {
  setTimeout(() => {
    var newEl = App(state, send)
    yo.update(el, newEl)
  })
  console.log(state)
}
