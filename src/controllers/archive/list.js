module.exports = (router, app, db) => {
  router.get('/', async (req, res, next) => {
    let archives = await req.budget.archives()
    archives.sort((a, b) => {
      return a.get('created_at') < b.get('created_at')
    })
    res.json(archives.map((archive) => {
      return archive.toJSON()
    }))
  })
}
