const test = require('ava')

const initView = require('../../client/initView')
const { TOKEN } = require('../helpers/testData')

test('initView with notification permission denied', t => {
  const html = initView({
    notificationPermission: 'denied'
  })

  t.snapshot(html.toString())
})

test('initView without service worker support', t => {
  const html = initView({
    serviceWorkerSupported: false
  })

  t.snapshot(html.toString())
})

test('initView with notification permission not yet granted', t => {
  const html = initView({
    serviceWorkerSupported: true,
    notificationPermission: 'default'
  })

  t.snapshot(html.toString())
})

test('initView with token not yet ready', t => {
  const html = initView({
    serviceWorkerSupported: true,
    notificationPermission: 'granted'
  })

  t.snapshot(html.toString())
})

test('initView with unknown state', t => {
  const html = initView({
    serviceWorkerSupported: true,
    notificationPermission: 'default',
    token: TOKEN
  })

  t.snapshot(html.toString())
})
