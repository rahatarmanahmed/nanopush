const test = require('ava')
const window = require('global/window')

const mainView = require('../../client/mainView')
const { TOKEN } = require('../helpers/testData')

test.before(() => {
  window.location = {
    origin: 'http://localhost:3000'
  }
})

test.after(() => {
  delete window.location
})

test('mainView redirects to / if token not set', t => {
  const html = mainView({}, null, (action, data) => {
    t.is(action, 'location:set')
    t.is(data, '/')
  })

  t.snapshot(html.toString())
})

test('mainView renders all the docs and stuff with a given token', t => {
  const html = mainView({ token: TOKEN })

  t.snapshot(html.toString())
})
