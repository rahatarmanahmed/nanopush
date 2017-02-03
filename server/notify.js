const { send, json, createError } = require('micro')
const Checkit = require('checkit')
const webPush = require('web-push')
const url = require('url')

const validator = new Checkit({
  title: ['string'],
  body: ['string'],
  icon: ['string', 'url']
})
.maybe({
  body: ['required']
}, (input) => input.title == null)

module.exports = (db) => async (req, res, { token }) => {
  let notification
  if (req.method === 'POST') notification = await json(req)
  else if (req.method === 'GET') notification = url.parse(req.url, true).query
  else throw createError(404)

  await validator.run(notification)

  try {
    const subscription = await db.get(token)
    console.log(subscription)
    console.log(notification)
    await webPush.sendNotification(subscription, JSON.stringify(notification))

    send(res, 200)
  } catch (err) {
    if (err.notFound) throw createError(404, 'Nothing is subscribed to this token', err)
    throw err
  }
}
