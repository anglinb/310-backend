
module.exports = (router, app, db) => {
  router.delete('/', async (req, res, next) => {
    await req.budget.remove()
    res.json({})
  })
}
