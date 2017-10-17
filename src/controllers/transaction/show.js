
module.exports = (router, app, db) => {
  router.get('/', async (req, res, next) => {
    res.json(req.transaction.toJSON())
  })
}
