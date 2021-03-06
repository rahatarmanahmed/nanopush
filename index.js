require('async-to-gen/register')({ sourceMaps: false })
const micro = require('micro')
const level = require('level')
const pino = require('pino')()

const db = level('./.db', { valueEncoding: 'json' })
const port = process.env.PORT || 3000
const host = process.env.HOST || '127.0.0.1'

try {
  const server = micro(require('./server/app')({ db, pino }))
  server.listen(port, host)
  pino.info(`Server started on port ${port}`)
} catch (err) {
  pino.error(err, 'Failed to start server')
  process.exit(1)
}
