
module.exports = (router, app, db) => {
  router.delete('/', async (req, res, next) => {
    let categories = req.budget.get('categories') || []
    let transactions = req.category.get('transactions') || []
    transactions.splice(req.transactionIndex, 1)
    req.category.set('transactions', transactions)
    categories[req.categoryIndex] = req.category
    req.budget.set('categories', categories)
    await req.budget.save()
    res.json({})
  })
}
