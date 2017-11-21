module.exports = (app, db) => {
  return (req, res, next) => {
    let categories = req.budget.get('categories') || []
    let targetIndex = categories.findIndex((value) => {
      return req.params.categorySlug === value.get('slug')
    })
    if (targetIndex === -1) {
      res.sendStatus(404)
      return
    }
    req.category = categories[targetIndex]
    req.categoryIndex = targetIndex
    
    next()
  }
}
