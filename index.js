const { send, json, createError } = require('micro')
// TODO: persist db
const level = require('memdb')
const webPush = require('web-push')
const serverRouter = require('server-router')
const bankai = require('bankai')
const envify = require('envify')
const envobj = require('envobj')
const url = require('url')
const path = require('path')

const env = envobj({
  SERVICE_OWNER_EMAIL: String
})

const db = require('level-promisify')(level({ valueEncoding: 'json' }))

const VAPID_KEYS = webPush.generateVAPIDKeys()
webPush.setVapidDetails(
  `mailto:${env.SERVICE_OWNER_EMAIL}`,
  VAPID_KEYS.publicKey,
  VAPID_KEYS.privateKey
)
process.env.applicationServerKey = VAPID_KEYS.publicKey

var clientPath = path.join(__dirname, 'client/app.js')
var client = bankai(clientPath, {
  js: {
    transform: [envify]
  },
  optimize: process.env.NODE_ENV === 'production'
})

var workerPath = path.join(__dirname, 'client/sw.js')
var worker = bankai(workerPath, {
  optimize: process.env.NODE_ENV === 'production'
})

const router = serverRouter({ default: '/404' }, [
  ['/', (req, res) => client.html(req, res).pipe(res)],
  ['/bundle.js', (req, res) => client.js(req, res).pipe(res)],
  ['/bundle.css', (req, res) => client.css(req, res).pipe(res)],
  ['/sw.js', (req, res) => worker.js(req, res).pipe(res)],
  ['/:token/subscribe', { post: subscribe }],
  ['/:token/notify', { get: notify }],
  ['/404', (req, res) => send(res, 404)]
])

module.exports = async function (req, res) {
  return router(req, res)
}

async function subscribe (req, res, { token }) {
  const subscription = await json(req)
  console.log('got subscription', subscription)
  // TODO: validate subscription data
  /*
    "endpoint": "https://...",
    "keys": {
        "p256dh": "base64",
        "auth": "base64"
    }
   */
  await db.put(token, subscription)
  send(res, 200)
}

async function notify (req, res, { token }) {
  // TODO: support both GET and POST
  // TODO: support more params than just message body
  try {
    const subscription = await db.get(token)
    const { query } = url.parse(req.url, true)
    if (!query.msg) throw createError(400, '`msg` query parameter is required')

    await webPush.sendNotification(subscription, query.msg)
    send(res, 200)
  } catch (err) {
    if (err.notFound) throw createError(404, 'Nothing is subscribed to this token', err)
    throw err
  }
}
