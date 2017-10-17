const validate = require('express-validation')
const transcationCreateValidation = require('../../validators/transaction/create')
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
      })
    ))

    let transactions = req.category.get('transactions') || []
    let categories = req.budget.get('categories') || []



    transactions.push(transaction)
    console.log("hello")
    console.log(transactions.length)
    req.category.set('transactions',transactions)
    console.log(req.category.get('transactions').length)
    categories[req.categoryIndex] = req.category
    req.budget.set('categories', categories)

    await req.budget.save()
    res.json(transaction.toJSON())
    })
}
