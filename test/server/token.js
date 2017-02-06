const test = require('ava')
const request = require('supertest')
const isUUID = require('is-uuid')

const setup = require('../helpers/setup')

test('/token endpoint returns UUID v4', async t => {
  const { app } = await setup()

  const res = await request(app)
  .get('/token')
  .expect('Content-Type', /json/)
  .expect(200)

  t.deepEqual(Object.keys(res.body), ['token'], 'Only has token in body')
  t.true(isUUID.v4(res.body.token))
})

test(`/token returns different tokens every call`, async t => {
  const { app } = await setup()

  const response1 = await request(app)
  .get('/token')
  const response2 = await request(app)
  .get('/token')

  const token1 = response1.body.token
  const token2 = response2.body.token

  t.not(token1, token2, 'Tokens are different')
})
