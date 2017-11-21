const mongodb = require('mongodb')
const jwt = require('jsonwebtoken')

module.exports = (app, db) => {
  let cache = app.get('cache')
  return async (req, res, next) => {

    let token = req.headers.authorization ? req.headers.authorization.replace('Bearer', '').trim() : null
    if (!token) {
      res.sendStatus(401)
      return
    }

    let payload
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      res.sendStatus(401)
      return

    }


    var userId = cache.get(`user:${payload.username}`)
    console.log("ACAHCSLDHS", cache)
    if (!userId) {
      let user = await db.User.findOne({ username: payload.username })
      userId = user.get('_id')
      cache.put(`user:${payload.username}`, user.get('_id'))
    }


    let budget = await db.Budget.findOne({ _id: mongodb.ObjectID(req.params.budgetId), owner_ids: [mongodb.ObjectID(userId)] })

    if (!budget) {
      res.sendStatus(401)
      return
    }
    req.budget = budget
    next()
  }
}
