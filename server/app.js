const { send } = require('micro')

const webPush = require('web-push')
const serverRouter = require('server-router')
const bankai = require('bankai')
const envify = require('envify')
const envobj = require('envobj')
const uuid = require('node-uuid')
const Checkit = require('checkit')
const path = require('path')
const sublevel = require('level-sublevel')
const levelPromisify = require('level-promisify')
const PROD = process.env.NODE_ENV === 'production'

const env = envobj({
  SERVICE_OWNER_EMAIL: String
})

module.exports = ({ db, pino }) => {
  db = sublevel(db)
  const keysDB = levelPromisify(db.sublevel('keys'))

  async function getKeys () {
    try {
      const keys = await keysDB.get('VAPID_KEYS')
      pino.info('Loaded VAPID keys from db')
      return keys
    } catch (err) {
      if (err.notFound) {
        pino.info('VAPID keys not found, generating new keys')
        const keys = webPush.generateVAPIDKeys()
        await keysDB.put('VAPID_KEYS', keys)
        return keys
      }

      pino.error(err, 'Failed to initialize VAPID keys')
      throw err
    }
  }

  async function initKeys () {
    const keys = await getKeys()
    webPush.setVapidDetails(
      `mailto:${env.SERVICE_OWNER_EMAIL}`,
      keys.publicKey,
      keys.privateKey
    )
    process.env.applicationServerKey = keys.publicKey
  }

  let client
  let worker
  initKeys()
  .then(() => {
    const clientPath = path.join(__dirname, '../client/app.js')
    client = bankai(clientPath, {
      js: { transform: [envify] },
      optimize: PROD
    })

    const workerPath = path.join(__dirname, '../client/sw.js')
    worker = bankai(workerPath, {
      js: { transform: [envify] },
      optimize: PROD
    })
  })

  var subscriptionsDB = levelPromisify(db.sublevel('subscriptions'))
  const subscribe = require('./subscribe')(subscriptionsDB)
  const notify = require('./notify')(subscriptionsDB)

  const router = serverRouter({ default: '/' }, [
    ['/', (req, res) => client.html(req, res).pipe(res)],
    ['/bundle.js', (req, res) => client.js(req, res).pipe(res)],
    ['/bundle.css', (req, res) => client.css(req, res).pipe(res)],
    ['/sw.js', (req, res) => worker.js(req, res).pipe(res)],

    ['/token', { get: (req, res) => send(res, 200, { token: uuid.v4() }) }],
    ['/:token/subscribe', { post: subscribe }],
    ['/:token/notify', { get: notify, post: notify }],

    ['/404', (req, res) => send(res, 404)]
  ])

  async function sendError (req, res, err) {
    const { statusCode, message, stack } = err
    if (statusCode) {
      send(res, statusCode, PROD ? message : stack)
    } else {
      send(res, 500, PROD ? 'Internal Server Error' : stack)
    }
  }

  return async function (req, res) {
    try {
      pino.info({
        ip: req.socket.remoteAddress,
        method: req.method,
        url: req.url
      })
      return await router(req, res)
    } catch (err) {
      pino.error(err)
      if (err instanceof Checkit.Error) return send(res, 400, err.toJSON())
      return sendError(req, res, err)
    }
  }
}
