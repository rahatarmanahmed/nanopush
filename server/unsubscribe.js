const { send, createError } = require('micro')
const isUUID = require('is-uuid')

module.exports = (db) => async (req, res, { token }) => {
  if (!isUUID.v4(token)) throw createError(400, 'Token must be a valid UUID')

  try {
    await db.get(token) // Ensure the token exists first
    await db.del(token)
    send(res, 204)
  } catch (err) {
    if (err.notFound) throw createError(404, 'Nothing is subscribed to this token', err)
    throw err
  }
}
