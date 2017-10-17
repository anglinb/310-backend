const validate = require('express-validation')
const transcationUpdateValidation = require('../../validators/transaction/update')
const VALID_KEYS = [
  'name',
  'amount',
  'description',
  'recurring',
  'recurring_days'
]

module.exports = (router, app, db) => {
  router.put('/',
    validate(transcationUpdateValidation),
    async (req, res, next) => {
      let transactions = req.category.get('transactions') || []
      VALID_KEYS.forEach((key) => {
        if (req.body[key]) {
          req.transaction.set(key, req.body[key])
        }
      })

      transactions[req.transactionIndex] = req.transaction
      req.category.set('transactions', transactions)
      await req.category.save()
      res.json(req.transaction.toJSON())
    })
}
