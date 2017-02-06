const { send, json, createError } = require('micro')
const Checkit = require('checkit')
const isUUID = require('is-uuid')

const URLSafeBase64Regex = /^(?:[A-Za-z0-9-_]{4})*(?:[A-Za-z0-9-_]{2}==|[A-Za-z0-9-_]{3}=)?$/
const isURLSafeBase64 = (value) => {
  if (!value.match(URLSafeBase64Regex)) throw new Error('Must be a valid url safe base 64 value')
}

const validator = new Checkit({
  endpoint: ['required', 'string', { rule: 'url', message: 'The endpoint must be a valid URL' }],
  'keys.p256dh': ['required', 'string', isURLSafeBase64], // maybe should validate pub key format
  'keys.auth': ['required', 'string', isURLSafeBase64]
})

module.exports = (db) => async (req, res, { token }) => {
  if (!isUUID.v4(token)) throw createError(400, 'Token must be a valid UUID')

  const subscription = await json(req)
  subscription.keys = subscription.keys || {} // avoid checkit nesting bug
  await validator.run(subscription)
  await db.put(token, subscription)

  send(res, 204)
}
