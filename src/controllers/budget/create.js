const validate = require('express-validation')
const budgetCreateValidation = require('../../validators/budget/create')
const VALID_KEYS = [
  'name',
  'resetType',
  'resetDate',
]

module.exports = (router, app, db) => {
  router.post('/',
    validate(budgetCreateValidation),
    async (req, res, next) => {
      let budget = new db.Budget(Object.assign(
      {},
      ...VALID_KEYS.map((key) => {
        let obj = {}
        obj[key] = req.body[key]
        return obj
      }),
      { owner_id: req.user.get('_id') },
      { categories: [] },
    ))
      await budget.save()
      res.json(budget.toJSON())
    })
}
