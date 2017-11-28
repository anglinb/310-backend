const mongodb = require('mongodb')

module.exports = (app, db) => {
  return async (req, res, next) => {
    let budget = await db.Budget.findOne({ _id: mongodb.ObjectId(req.params.budgetId) })
    if (!budget) {
      res.sendStatus(402)
      return
    }
    req.budget = budget
    next()
  }
}