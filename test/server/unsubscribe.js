const test = require('ava')
const request = require('supertest')

const setup = require('../helpers/setup')
const { TOKEN, SUBSCRIPTION } = require('../helpers/testData')

test('/:token/unsubscribe fails for tokens that werent subscribed', async t => {
  const { app } = await setup()

  const res = await request(app)
  .get(`/${TOKEN}/unsubscribe`)
  .expect(404)

  t.is(res.text, 'Nothing is subscribed to this token')
})

test('/:token/unsubscribe successfully unsubscribes a token', async t => {
  const { app } = await setup()

  await request(app)
  .post(`/${TOKEN}/subscribe`)
  .send(SUBSCRIPTION)
  .expect(204)

  // Unsubscribe subscribed token
  await request(app)
  .get(`/${TOKEN}/unsubscribe`)
  .expect(204)

  // Future unsubscribes and notifys should fail
  await request(app)
  .get(`/${TOKEN}/unsubscribe`)
  .expect(404)

  await request(app)
  .get(`/${TOKEN}/notify?title=test`)
  .expect(404)
})

test('/:token/unsubscribe fails for non-uuid tokens', async t => {
  const { app } = await setup()

  const res = await request(app)
  .get(`/💩/unsubscribe`)
  .expect(400)

  t.is(res.text, 'Token must be a valid UUID')
})
