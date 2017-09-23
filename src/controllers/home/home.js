module.exports = (router, app, db) => {
  router.get('/', async (req, res, next) => {
    return res.json({
      message: ':wave: please check the docs to get started'
    })
  })
}
