module.exports = (app, db) => {
  return async (req, res, next) => {
    let token = req.headers.authorization ? req.headers.authorization.replace('Bearer', '').trim() : null
    if (!token) {
      res.sendStatus(401)
      return
    }
    try {
      let payload = jwt.verify(token, process.env.JWT_SECRET)
    } catch(err) {
      res.sendStatus(401)
      return
    }
    let user = await db.User.findOne({ where: { _id: payload._id } })
    req.user = user
    next()
  }
}
