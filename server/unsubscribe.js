const { send } = require('micro')

module.exports = (db) => async (req, res, { token }) => {
  await db.del(token)
  send(res, 200)
}
