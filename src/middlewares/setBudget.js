module.exports = (app, db) => {
  return async (req, res, next) => {
    let budget = await req.user.getBudgetIfOwner(req.params.budgetId)
    if (!budget) {
      res.sendStatus(401)
      return
    }
    req.budget = budget
    
    next()
  }
}
