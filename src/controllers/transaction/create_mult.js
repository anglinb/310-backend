const validate = require('express-validation')
const transcationBatchValidation = require('../../validators/transaction/batch')
const uuidv4 = require('uuid/v4')
const VALID_KEYS = [
  'name',
  'amount',
  'description',
  'recurring',
  'recurring_days'
]

module.exports = (router, app, db) => {
  router.post('/_batch',
    validate(transcationBatchValidation),
    async (req, res, next) => {
      let transactions_to_push = req.body.map((transaction_obj) => {
        let transaction = new db.Transaction(Object.assign(
          {},
          ...VALID_KEYS.map((key) => {
            let obj = {}
            obj[key] = transaction_obj[key]
            return obj
          }), {'_id': uuidv4()}, {'timestamp': new Date()}
        ))
        return transaction
      })


      let transactions = req.category.get('transactions') || []
      let categories = req.budget.get('categories') || []

      transactions.push(transactions_to_push)
      req.category.set('transactions', transactions)
      categories[req.categoryIndex] = req.category
      req.budget.set('categories', categories)

      await req.budget.save()
      res.json(transactions_to_push.toJSON())
    })
}
