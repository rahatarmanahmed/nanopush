const { send } = require('micro')
// TODO: persist db
const level = require('memdb')
const webPush = require('web-push')
const serverRouter = require('server-router')
const bankai = require('bankai')
const envify = require('envify')
const envobj = require('envobj')
const uuid = require('node-uuid')
const Checkit = require('checkit')

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

const clientPath = path.join(__dirname, 'client/app.js')
const client = bankai(clientPath, {
  js: {
    transform: [envify]
  },
  optimize: process.env.NODE_ENV === 'production'
})

const workerPath = path.join(__dirname, 'client/sw.js')
const worker = bankai(workerPath, {
  optimize: process.env.NODE_ENV === 'production'
})

const subscribe = require('./server/subscribe')(db)
const notify = require('./server/notify')(db)

const router = serverRouter({ default: '/' }, [
  ['/', (req, res) => client.html(req, res).pipe(res)],
  ['/bundle.js', (req, res) => client.js(req, res).pipe(res)],
  ['/bundle.css', (req, res) => client.css(req, res).pipe(res)],
  ['/sw.js', (req, res) => worker.js(req, res).pipe(res)],
  ['/token', { get: makeUUID }],
  ['/:token/subscribe', { post: subscribe }],
  ['/:token/notify', { get: notify, post: notify }],
  ['/404', (req, res) => send(res, 404)]
])

module.exports = async function (req, res) {
  try {
    return await router(req, res)
  } catch (err) {
    if (err instanceof Checkit.Error) return send(res, 400, err.toJSON())
    throw err
  }
}

async function makeUUID (req, res) {
  send(res, 200, { token: uuid.v4() })
}
