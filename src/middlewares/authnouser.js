const jwt = require('jsonwebtoken')

module.exports = (app, db) => {
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

    req.username = payload
    next()
  }
}
