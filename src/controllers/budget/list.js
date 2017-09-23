
module.exports = (router, app, db) => {
  router.get('/', async (req, res, next) => {
    let budgets = await req.user.budgets()
    res.json(budgets.map((budget) => {
      return budget.toJSON()
    }))
  })
}
