const validate = require('express-validation')
const categoryUpdateValidation = require('../../validators/category/update')

const VALID_KEYS = [
  'name',
  'amount'
]

module.exports = (router, app, db) => {
  router.put('/',
    validate(categoryUpdateValidation),
    async (req, res, next) => {
      let categories = req.budget.get('categories') || []
      VALID_KEYS.forEach((key) => {
        if (req.body[key]) {
          req.category.set(key, req.body[key])
        }
      })
      if (req.body.name) {
        req.category.set('slug', db.Category.createSlug(req.body.name))
      }
      categories[req.categoryIndex] = req.category
      req.budget.set('categories', categories)
      await req.budget.save()
      res.json(req.category.toJSON())
    })
}
