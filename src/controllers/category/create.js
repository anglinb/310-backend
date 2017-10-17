const validate = require('express-validation')
const categoryCreateValidation = require('../../validators/category/create')

module.exports = (router, app, db) => {
  router.post('/',
    validate(categoryCreateValidation),
    async (req, res, next) => {
      let slug = db.Category.createSlug(req.body.name)
      let categories = req.budget.get('categories') || []
      let duplicates = categories.filter((value) => {
        if (value.get('slug') === slug) {
          return true
        }
        return false
      })
      if (duplicates.length > 0) {
        res.sendStatus(400)
        return
      }
      let newCategory = new db.Category({ slug, transactions: [], name: req.body.name, amount: req.body.amount })
      categories.push(newCategory)
      req.budget.set('categories', categories)
      await req.budget.save()
      return res.json(newCategory.toJSON())
    })
}
