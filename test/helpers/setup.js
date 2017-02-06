require('async-to-gen/register')({ sourceMaps: false })
const micro = require('micro')
const memdb = require('memdb')
const sublevel = require('level-sublevel')
const pino = require('pino')

module.exports = async () => {
  const db = sublevel(memdb({ valueEncoding: 'json' }))
  const quietPino = pino({ enabled: false })
  const app = await require('../../server/app')({ db, pino: quietPino })
  return {
    app: micro(app),
    db,
    pino: quietPino
  }
}
