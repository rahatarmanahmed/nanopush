const test = require('ava')
const request = require('supertest')
const levelPromisify = require('level-promisify')
const xtend = require('xtend')

const setup = require('../helpers/setup')
const { TOKEN, SUBSCRIPTION } = require('../helpers/testData')

test('/:token/subscribe saves subscription for a token', async t => {
  const { app, db } = setup()

  await request(app)
  .post(`/${TOKEN}/subscribe`)
  .send(SUBSCRIPTION)
  .expect(204)

  const subsDB = levelPromisify(db.sublevel('subscriptions'))
  const savedSubscription = await subsDB.get(TOKEN)

  t.deepEqual(savedSubscription, SUBSCRIPTION)
})

test('/:token/subscribe sends 400 for missing data', async t => {
  const { app } = setup()

  let res = await request(app)
  .post(`/${TOKEN}/subscribe`)
  .send({})
  .expect(400)

  t.deepEqual(res.body, {
    endpoint: ['The endpoint is required'],
    'keys.p256dh': ['The keys.p256dh is required'],
    'keys.auth': ['The keys.auth is required']
  })
})

test('/:token/subscribe sends 400 for bad endpoint', async t => {
  const { app } = setup()
  let res = await request(app)
  .post(`/${TOKEN}/subscribe`)
  .send(xtend(SUBSCRIPTION, {
    endpoint: 'why cant i say the n word'
  }))
  .expect(400)

  t.deepEqual(res.body, {
    endpoint: ['The endpoint must be a valid URL']
  })
})

test('/:token/subscribe sends 400 for non url safe base64 keys', async t => {
  const { app } = setup()
  let res = await request(app)
  .post(`/${TOKEN}/subscribe`)
  .send(xtend(SUBSCRIPTION, {
    keys: {
      p256dh: SUBSCRIPTION.keys.p256dh + '💩',
      auth: SUBSCRIPTION.keys.auth + '💩'
    }
  }))
  .expect(400)

  t.deepEqual(res.body, {
    'keys.p256dh': ['Must be a valid url safe base 64 value'],
    'keys.auth': ['Must be a valid url safe base 64 value']
  })
})

test('/:token/subscribe fails for non-uuid tokens', async t => {
  const { app } = setup()

  const res = await request(app)
  .post(`/💩/subscribe`)
  .expect(400)

  t.is(res.text, 'Token must be a valid UUID')
})
