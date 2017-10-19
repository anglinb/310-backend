module.exports = (router, app, db) => {
  router.delete('/', async (req, res, next) => {
    let categories = req.budget.get('categories') || []
    categories.splice(req.categoryIndex, 1)
    req.budget.set('categories', categories)
    await req.budget.save()
    res.json({})
  })
}
