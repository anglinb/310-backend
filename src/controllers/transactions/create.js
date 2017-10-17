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
      await transaction.save()
      res.json(transaction.toJSON())
    })
}
