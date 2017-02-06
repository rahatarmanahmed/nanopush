const test = require('ava')
const levelPromisify = require('level-promisify')

const setup = require('../helpers/setup')

test('generates new tokens', async t => {
  const { db } = await setup()

  const keysDB = levelPromisify(db.sublevel('keys'))
  const vapidKeys = await keysDB.get('VAPID_KEYS')
  t.truthy(vapidKeys.publicKey)
  t.truthy(vapidKeys.privateKey)
})

test('uses existing tokens from db', async t => {
  const { db } = await setup()

  const keysDB = levelPromisify(db.sublevel('keys'))
  const vapidKeys = await keysDB.get('VAPID_KEYS')

  const { db: db2 } = await setup({ db })

  const keysDB2 = levelPromisify(db2.sublevel('keys'))
  const vapidKeys2 = await keysDB2.get('VAPID_KEYS')

  t.deepEqual(vapidKeys, vapidKeys2)
})
