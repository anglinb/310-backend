const validate = require('express-validation')
const transcationCreateValidation = require('../../validators/transaction/create')
const uuidv4 = require('uuid/v4')
const VALID_KEYS = [
  'name',
  'amount',
  'description',
  'recurring',
  'recurring_days'
]

module.exports = (router, app, db) => {
  router.post('/',
    validate(transcationCreateValidation),
    async (req, res, next) => {
      let transaction = new db.Transaction(Object.assign(
      {},
      ...VALID_KEYS.map((key) => {
        let obj = {}
        obj[key] = req.body[key]
        return obj
      }), {'_id': uuidv4()}, {'timestamp': new Date()}
    ))

      let transactions = req.category.get('transactions') || []
      let categories = req.budget.get('categories') || []

      transactions.push(transaction)
      req.category.set('transactions', transactions)
      categories[req.categoryIndex] = req.category
      req.budget.set('categories', categories)

      await req.budget.save()
      res.json(transaction.toJSON())
    })
}
