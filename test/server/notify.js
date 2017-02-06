const test = require('ava')
const request = require('supertest')
const uuid = require('node-uuid')
const sinon = require('sinon')
const webPush = require('web-push')

const setup = require('../helpers/setup')
const { TOKEN, SUBSCRIPTION } = require('../helpers/testData')

test.beforeEach(t => {
  sinon.stub(webPush, 'sendNotification').returns(Promise.resolve())
})

test.afterEach.always(t => {
  webPush.sendNotification.restore()
})

test.serial('GET /:token/notify sends notification', async t => {
  const { app } = await setup()

  await request(app)
  .post(`/${TOKEN}/subscribe`)
  .send(SUBSCRIPTION)
  .expect(204)

  await request(app)
  .get(`/${TOKEN}/notify?title=test&body=whats%20up&icon=https%3A%2F%2Fstatic.minichan.org%2Fimg%2F1419560019791980.jpg`)
  .expect(204)
  t.true(webPush.sendNotification.called)
  t.deepEqual(webPush.sendNotification.args[0][0], SUBSCRIPTION)
  t.deepEqual(webPush.sendNotification.args[0][1], JSON.stringify({
    title: 'test',
    body: 'whats up',
    icon: 'https://static.minichan.org/img/1419560019791980.jpg'
  }))
})

test.serial('POST /:token/notify sends notification', async t => {
  const { app } = await setup()

  await request(app)
  .post(`/${TOKEN}/subscribe`)
  .send(SUBSCRIPTION)
  .expect(204)

  const notification = {
    title: 'test',
    body: 'whats up',
    icon: 'https://static.minichan.org/img/1419560019791980.jpg'
  }

  await request(app)
  .post(`/${TOKEN}/notify`)
  .send(notification)
  .expect(204)
  t.true(webPush.sendNotification.called)
  t.deepEqual(webPush.sendNotification.args[0][0], SUBSCRIPTION)
  t.deepEqual(webPush.sendNotification.args[0][1], JSON.stringify(notification))
})

test.serial('GET /:token/notify returns 404 for not yet subscribed token', async t => {
  const { app } = await setup()

  await request(app)
  .get(`/${uuid.v4()}/notify?title=test`)
  .expect(404)
  t.false(webPush.sendNotification.called)
})

test.serial('GET /:token/notify returns 400 for invalid token', async t => {
  const { app } = await setup()

  await request(app)
  .get('/💩/notify?title=test')
  .expect(400)
  t.false(webPush.sendNotification.called)
})

test.serial('GET /:token/notify requires at least title or body', async t => {
  const { app } = await setup()

  await request(app)
  .post(`/${TOKEN}/subscribe`)
  .send(SUBSCRIPTION)
  .expect(204)

  const res = await request(app)
  .get(`/${TOKEN}/notify`)
  .expect(400)

  t.deepEqual(res.body, {
    title: ['The title is required']
  })
  t.false(webPush.sendNotification.called)

  await request(app)
  .get(`/${TOKEN}/notify?body=test`)
  .expect(204)

  t.true(webPush.sendNotification.called)
})

test.serial('GET /:token/notify validates icon is a url', async t => {
  const { app } = await setup()

  let res = await request(app)
  .get(`/${TOKEN}/notify?title=test&icon=not_a_url`)
  .expect(400)

  t.deepEqual(res.body, {
    icon: ['The icon must be a valid URL']
  })
  t.false(webPush.sendNotification.called)
})
