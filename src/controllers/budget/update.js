const validate = require('express-validation')
const budgetUpdateValidation = require('../../validators/budget/update')

const VALID_KEYS = [
  'name',
  'resetType',
  'resetDate',
  'group',
]

module.exports = (router, app, db) => {
  router.put('/',
    validate(budgetUpdateValidation),
    async (req, res, next) => {
      VALID_KEYS.forEach((key) => {
        if (req.body[key]) {
          req.budget.set(key, req.body[key])
        }
      })
      await req.budget.save()
      res.json(req.budget.toJSON())
    })
}
