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
  ['/', require('./initView')],
  ['/:token', require('./mainView')]
])

var container = html`
  <main class="helvetica bg-green washed-blue pa3">
    <h1 class="f3 fw7 mt0 mb3">nanopush</h1>
    <div class="f5">
      <p class="lh-copy measure">nanopush is a tool that sends push notifications. No installation. No registration.</p>
      <div id="root"></div>
    </div>
  </main>
`

const appTree = app.start()
document.body.appendChild(container)
document.querySelector('#root').appendChild(appTree)
