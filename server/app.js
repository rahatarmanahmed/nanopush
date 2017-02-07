const { send } = require('micro')

const webPush = require('web-push')
const serverRouter = require('server-router')
const bankai = require('bankai')
const babelify = require('babelify')
const envify = require('envify')
const yoyoify = require('yo-yoify')
const sheetifyTransform = require('sheetify/transform')
const envobj = require('envobj')
const uuid = require('node-uuid')
const Checkit = require('checkit')
const path = require('path')
const sublevel = require('level-sublevel')
const levelPromisify = require('level-promisify')
const DEV = process.env.NODE_ENV === 'development'

const env = envobj({
  SERVICE_OWNER_EMAIL: String,
  VAPID_PUBLIC_KEY: String,
  VAPID_PRIVATE_KEY: String
})

module.exports = ({ db, pino }) => {
  db = sublevel(db)

  webPush.setVapidDetails(
    `mailto:${env.SERVICE_OWNER_EMAIL}`,
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
  )
  process.env.applicationServerKey = env.VAPID_PUBLIC_KEY

  const bankaiOpts = {
    html: {
      title: 'nanopush'
    },
    js: {
      // go thru a shitshow of transforms to appease the uglifyify gods
      transform: DEV ? [envify] : [
        envify,
        sheetifyTransform,
        yoyoify,
        [babelify, { presets: ['latest'] }]
      ],
      debug: DEV
    },
    optimize: !DEV
  }
  const clientPath = path.join(__dirname, '../client/app.js')
  const client = bankai(clientPath, bankaiOpts)

  const workerPath = path.join(__dirname, '../client/sw.js')
  const worker = bankai(workerPath, bankaiOpts)

  var subscriptionsDB = levelPromisify(db.sublevel('subscriptions'))
  const subscribe = require('./subscribe')(subscriptionsDB)
  const unsubscribe = require('./unsubscribe')(subscriptionsDB)
  const notify = require('./notify')(subscriptionsDB)

  const router = serverRouter({ default: '/h/' }, [
    ['/', (req, res) => redirect(req, res, '/h/')],
    ['/h/', ensureTrailingSlash((req, res) => client.html(req, res).pipe(res))],
    ['/h/bundle.js', (req, res) => client.js(req, res).pipe(res)],
    ['/h/bundle.css', (req, res) => client.css(req, res).pipe(res)],
    ['/h/sw.js', (req, res) => worker.js(req, res).pipe(res)],

    ['/h/token', { get: (req, res) => send(res, 200, { token: uuid.v4() }) }],
    ['/h/:token/subscribe', { post: subscribe }],
    ['/h/:token/unsubscribe', unsubscribe],
    ['/h/:token/notify', { get: notify, post: notify }]
  ])

  function ensureTrailingSlash (handler) {
    return (req, res) => {
      if (!req.url.match(/\/$/)) return redirect(req, res, req.url + '/')
      return handler(req, res)
    }
  }

  function redirect (req, res, location) {
    res.setHeader('Location', '/h/')
    send(res, 301)
  }

  async function sendError (req, res, err) {
    const { statusCode, message, stack } = err
    if (statusCode) {
      send(res, statusCode, DEV ? stack : message)
    } else {
      send(res, 500, DEV ? stack : 'Internal Server Error')
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
