const html = require('choo/html')
const css = require('sheetify')
const choo = require('choo')
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

const app = choo()
app.use(chooPromise())

app.model(require('./init'))

app.router([
  ['/', require('./initView')],
  ['/:token', require('./mainView')]
])

const container = html`
  <main class="helvetica bg-green washed-blue pa3">
    <h1 class="f3 fw7 mt0 mb3">nanopush 📌</h1>
    <div class="f5">
      <p class="lh-copy measure">nanopush is a tool that sends push notifications. No installation. No registration.</p>
      <div id="root"></div>
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

const appTree = app.start()
document.body.appendChild(container)
document.querySelector('#root').appendChild(appTree)
