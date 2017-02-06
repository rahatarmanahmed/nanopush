const { send, json, createError } = require('micro')
const Checkit = require('checkit')
const webPush = require('web-push')
const url = require('url')
const isUUID = require('is-uuid')

const validator = new Checkit({
  title: ['string'],
  body: ['string'],
  icon: ['string', { rule: 'url', message: 'The icon must be a valid URL' }]
})
.maybe({
  title: ['required']
}, (input) => input.body == null)

module.exports = (db) => async (req, res, { token }) => {
  if (!isUUID.v4(token)) throw createError(400, 'Token must be a valid UUID')

  let notification
  if (req.method === 'POST') notification = await json(req)
  else if (req.method === 'GET') notification = url.parse(req.url, true).query

  await validator.run(notification)

  try {
    const subscription = await db.get(token)
    await webPush.sendNotification(subscription, JSON.stringify(notification))

    send(res, 204)
  } catch (err) {
    if (err.notFound) throw createError(404, 'Nothing is subscribed to this token', err)
    throw err
  }
}
